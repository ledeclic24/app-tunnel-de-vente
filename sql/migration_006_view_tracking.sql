-- Vendeko — migration 006 : suivi des vues par étape (pour le taux de conversion)
-- A executer dans Supabase > SQL Editor.

alter table public.funnel_steps add column if not exists views int not null default 0;

create or replace function public.increment_step_view(p_step_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.funnel_steps set views = views + 1
  where id = p_step_id
    and exists (
      select 1 from public.funnels f
      where f.id = funnel_steps.funnel_id and f.is_published = true
    );
$$;

grant execute on function public.increment_step_view(uuid) to anon, authenticated;
