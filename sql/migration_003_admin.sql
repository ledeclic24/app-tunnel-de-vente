-- Vendeko — migration 003 : espace admin
-- A executer dans Supabase > SQL Editor.

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Fonction security definer pour verifier le statut admin sans provoquer
-- de recursion RLS (les policies ci-dessous appellent cette fonction plutot
-- que de refaire un "select ... from profiles" directement dans la policy).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- ============ profiles : acces admin ============
drop policy if exists "Profiles: admin select all" on public.profiles;
create policy "Profiles: admin select all" on public.profiles
  for select using (public.is_admin(auth.uid()));

drop policy if exists "Profiles: admin update all" on public.profiles;
create policy "Profiles: admin update all" on public.profiles
  for update using (public.is_admin(auth.uid()));

-- ============ funnels / funnel_steps / blocks / leads : acces admin ============
drop policy if exists "Funnels: admin all" on public.funnels;
create policy "Funnels: admin all" on public.funnels
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Steps: admin all" on public.funnel_steps;
create policy "Steps: admin all" on public.funnel_steps
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Blocks: admin all" on public.blocks;
create policy "Blocks: admin all" on public.blocks
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Leads: admin select all" on public.leads;
create policy "Leads: admin select all" on public.leads
  for select using (public.is_admin(auth.uid()));

-- ============ premier administrateur ============
-- Remplace l'email ci-dessous si ce n'est pas celui avec lequel tu te connectes a Vendeko.
update public.profiles set is_admin = true where email = 'jeanpaulden24@gmail.com';
