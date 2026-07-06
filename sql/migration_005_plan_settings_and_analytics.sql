-- Vendeko — migration 005 : tarifs modifiables par l'admin + historique des plans
-- A executer dans Supabase > SQL Editor.
-- Nécessite que migration_003_admin.sql ait déjà été exécutée (fonction public.is_admin).

-- ============ plan_settings : tarifs modifiables ============
create table if not exists public.plan_settings (
  key text primary key,
  name text not null,
  price numeric not null,
  period text not null default '/ mois',
  updated_at timestamptz not null default now()
);

insert into public.plan_settings (key, name, price, period) values
  ('starter', 'Starter', 0, '/ mois'),
  ('createur', 'Pro', 19000, '/ mois'),
  ('entreprise', 'Entreprise', 38000, '/ mois')
on conflict (key) do nothing;

alter table public.plan_settings enable row level security;

drop policy if exists "plan_settings: public read" on public.plan_settings;
create policy "plan_settings: public read" on public.plan_settings
  for select using (true);

drop policy if exists "plan_settings: admin update" on public.plan_settings;
create policy "plan_settings: admin update" on public.plan_settings
  for update using (public.is_admin(auth.uid()));

-- ============ plan_change_events : historique pour les analytiques ============
create table if not exists public.plan_change_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  old_plan text,
  new_plan text not null,
  changed_at timestamptz not null default now()
);

alter table public.plan_change_events enable row level security;

drop policy if exists "plan_change_events: admin select" on public.plan_change_events;
create policy "plan_change_events: admin select" on public.plan_change_events
  for select using (public.is_admin(auth.uid()));

drop policy if exists "plan_change_events: owner or admin insert" on public.plan_change_events;
create policy "plan_change_events: owner or admin insert" on public.plan_change_events
  for insert with check (auth.uid() = user_id or public.is_admin(auth.uid()));
