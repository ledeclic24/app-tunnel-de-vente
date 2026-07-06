-- Vendeko — schema Supabase
-- A executer une seule fois dans Supabase > SQL Editor (projet vide).

create extension if not exists pgcrypto;

-- ============ profiles ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  plan text not null default 'starter' check (plan in ('starter','createur','entreprise')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);
create policy "Profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- creation automatique du profil a l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ funnels ============
create table if not exists public.funnels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  template text not null default 'vierge',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.funnels enable row level security;

create policy "Funnels: owner all" on public.funnels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Funnels: public read published" on public.funnels
  for select using (is_published = true);

-- ============ funnel_steps ============
create table if not exists public.funnel_steps (
  id uuid primary key default gen_random_uuid(),
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  name text not null,
  slug text not null,
  step_type text not null default 'custom',
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (funnel_id, slug)
);

alter table public.funnel_steps enable row level security;

create policy "Steps: owner all" on public.funnel_steps
  for all using (
    exists (select 1 from public.funnels f where f.id = funnel_id and f.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.funnels f where f.id = funnel_id and f.user_id = auth.uid())
  );
create policy "Steps: public read of published funnels" on public.funnel_steps
  for select using (
    exists (select 1 from public.funnels f where f.id = funnel_id and f.is_published = true)
  );

-- ============ blocks ============
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.funnel_steps(id) on delete cascade,
  type text not null,
  content jsonb not null default '{}'::jsonb,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.blocks enable row level security;

create policy "Blocks: owner all" on public.blocks
  for all using (
    exists (
      select 1 from public.funnel_steps s
      join public.funnels f on f.id = s.funnel_id
      where s.id = step_id and f.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.funnel_steps s
      join public.funnels f on f.id = s.funnel_id
      where s.id = step_id and f.user_id = auth.uid()
    )
  );
create policy "Blocks: public read of published funnels" on public.blocks
  for select using (
    exists (
      select 1 from public.funnel_steps s
      join public.funnels f on f.id = s.funnel_id
      where s.id = step_id and f.is_published = true
    )
  );

-- ============ leads (captures de formulaire) ============
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  step_id uuid references public.funnel_steps(id) on delete set null,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Leads: owner read" on public.leads
  for select using (
    exists (select 1 from public.funnels f where f.id = funnel_id and f.user_id = auth.uid())
  );
create policy "Leads: public insert on published funnels" on public.leads
  for insert with check (
    exists (select 1 from public.funnels f where f.id = funnel_id and f.is_published = true)
  );
