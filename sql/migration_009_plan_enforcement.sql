-- Vendeko — migration 009 : application des limites de plan côté base de données
-- A executer dans Supabase > SQL Editor, APRES migration_008_security_fixes.sql.
--
-- Problème corrigé : le nombre de tunnels autorisés et les types de blocs
-- disponibles par plan n'étaient vérifiés que côté interface (src/lib/plans.js,
-- src/lib/blockTypes.js). Un utilisateur pouvait donc créer plus de tunnels que
-- son plan ne l'autorise, ou ajouter des blocs premium (témoignages, tarification,
-- compte à rebours, FAQ, quiz) alors qu'il est sur le plan Starter, en appelant
-- directement l'API Supabase plutôt qu'en passant par l'interface.
--
-- Ce correctif ajoute deux triggers qui font respecter ces mêmes règles
-- directement en base, quel que soit le chemin utilisé pour écrire les données.

create or replace function public.user_plan(uid uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select plan from public.profiles where id = uid), 'starter');
$$;

-- ============ limite du nombre de tunnels (plan Starter : 1) ============
create or replace function public.enforce_funnel_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
begin
  if public.user_plan(new.user_id) = 'starter' then
    select count(*) into current_count from public.funnels where user_id = new.user_id;
    if current_count >= 1 then
      raise exception 'Le plan Starter est limité à 1 tunnel. Passe au plan Pro pour en créer davantage.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_funnel_limit on public.funnels;
create trigger trg_enforce_funnel_limit
  before insert on public.funnels
  for each row execute procedure public.enforce_funnel_limit();

-- ============ blocs réservés aux plans payants ============
create or replace function public.enforce_block_plan_gating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  owner_plan text;
  starter_blocks text[] := array['hero', 'text', 'image', 'form', 'cta'];
begin
  select f.user_id into owner_id
  from public.funnel_steps s
  join public.funnels f on f.id = s.funnel_id
  where s.id = new.step_id;

  owner_plan := public.user_plan(owner_id);

  if owner_plan = 'starter' and not (new.type = any(starter_blocks)) then
    raise exception 'Ce type de bloc n''est pas disponible avec le plan Starter.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_block_plan_gating on public.blocks;
create trigger trg_enforce_block_plan_gating
  before insert or update on public.blocks
  for each row execute procedure public.enforce_block_plan_gating();
