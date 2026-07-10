-- Vendeko — migration 011 : paiement en ligne (Moneroo) + expiration de plan
-- A executer dans Supabase > SQL Editor, APRES migration_010_growth_features.sql.
--
-- Contexte : le trigger de la migration 008 bloque tout changement de
-- `profiles.plan` par quelqu'un qui n'est pas déjà administrateur, pour
-- empêcher qu'un utilisateur s'auto-attribue un plan payant gratuitement.
-- La fonction edge `moneroo-webhook` (déclenchée par Moneroo, pas par
-- l'utilisateur) doit pouvoir mettre à jour ce champ après un paiement
-- confirmé. Ce correctif autorise donc aussi les appels effectués avec la
-- clé "service_role" (uniquement disponible côté serveur, jamais exposée au
-- navigateur) ainsi que les exécutions internes à Postgres (tâche planifiée
-- ci-dessous), en plus d'un administrateur.

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
as $$
declare
  trusted boolean;
begin
  trusted := public.is_admin(auth.uid()) or auth.role() is null or auth.role() = 'service_role';

  if new.is_admin is distinct from old.is_admin and not trusted then
    raise exception 'Seul un administrateur peut modifier ce champ.';
  end if;

  if new.email is distinct from old.email and not trusted then
    raise exception 'L''email ne peut pas être modifié directement ici.';
  end if;

  if new.plan is distinct from old.plan and not trusted then
    raise exception 'Le changement de plan doit passer par un administrateur pour le moment.';
  end if;

  return new;
end;
$$;

-- ============ expiration du plan payant ============
alter table public.profiles add column if not exists plan_expires_at timestamptz;

-- ============ paiements ============
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_key text not null check (plan_key in ('createur','entreprise')),
  amount numeric not null,
  currency text not null default 'XOF',
  moneroo_payment_id text unique,
  status text not null default 'pending' check (status in ('pending','success','failed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "payments: owner select" on public.payments;
create policy "payments: owner select" on public.payments
  for select using (auth.uid() = user_id);

drop policy if exists "payments: admin select all" on public.payments;
create policy "payments: admin select all" on public.payments
  for select using (public.is_admin(auth.uid()));

-- Aucune policy insert/update pour les rôles authenticated/anon : seules les
-- fonctions edge (clé service_role, qui contourne RLS) créent et mettent à
-- jour les lignes de paiement.

-- ============ rétrogradation automatique à l'expiration ============
create or replace function public.downgrade_expired_plans()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set plan = 'starter', plan_expires_at = null
  where plan <> 'starter' and plan_expires_at is not null and plan_expires_at < now();
end;
$$;

-- Nécessite l'extension pg_cron (Dashboard > Database > Extensions si la
-- commande ci-dessous échoue par manque de droits).
create extension if not exists pg_cron;

-- Ré-exécuter cette commande est sans risque : pg_cron met à jour la tâche
-- existante plutôt que d'en créer une deuxième quand le nom est identique.
select cron.schedule(
  'vendeko-downgrade-expired-plans',
  '0 3 * * *',
  $$select public.downgrade_expired_plans();$$
);
