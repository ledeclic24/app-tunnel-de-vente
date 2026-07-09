-- Vendeko — migration 010 : fonctionnalités de croissance (SEO, planification,
-- webhooks, bibliothèque de blocs, équipe, journal d'audit, benchmark sectoriel)
-- A executer dans Supabase > SQL Editor, APRES migration_009_plan_enforcement.sql.

-- ============================================================
-- 1. Funnels : SEO, partage social, planification, catégorie
-- ============================================================
alter table public.funnels add column if not exists seo_title text;
alter table public.funnels add column if not exists seo_description text;
alter table public.funnels add column if not exists seo_image_url text;
alter table public.funnels add column if not exists publish_at timestamptz;
alter table public.funnels add column if not exists unpublish_at timestamptz;
alter table public.funnels add column if not exists category text not null default 'personnalise';

-- ============================================================
-- 2. Équipe : un propriétaire peut inviter des éditeurs qui
--    travaillent sur ses tunnels sans avoir leur propre plan.
-- ============================================================
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid references auth.users(id) on delete cascade,
  invited_email text not null,
  role text not null default 'editor' check (role in ('editor')),
  status text not null default 'pending' check (status in ('pending','active')),
  created_at timestamptz not null default now(),
  unique (owner_id, invited_email)
);

alter table public.org_members enable row level security;

drop policy if exists "org_members: owner manages" on public.org_members;
create policy "org_members: owner manages" on public.org_members
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "org_members: member reads own membership" on public.org_members;
create policy "org_members: member reads own membership" on public.org_members
  for select using (auth.uid() = member_id);

-- Résout le "compte effectif" d'un utilisateur : lui-même, sauf s'il est un
-- éditeur actif d'une autre organisation, auquel cas c'est le propriétaire.
create or replace function public.effective_owner(uid uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select owner_id from public.org_members where member_id = uid and status = 'active' limit 1),
    uid
  );
$$;

-- user_plan() et les triggers de plan (migration 009) doivent désormais
-- s'appuyer sur le compte effectif, pas sur l'utilisateur connecté brut.
create or replace function public.user_plan(uid uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select plan from public.profiles where id = public.effective_owner(uid)), 'starter');
$$;

-- Un éditeur actif peut lire le profil (et donc le plan) de son organisation.
drop policy if exists "Profiles: org member reads owner" on public.profiles;
create policy "Profiles: org member reads owner" on public.profiles
  for select using (
    exists (
      select 1 from public.org_members m
      where m.owner_id = profiles.id and m.member_id = auth.uid() and m.status = 'active'
    )
  );

-- Étend l'accès owner-only des tunnels/étapes/blocs/leads aux éditeurs actifs.
drop policy if exists "Funnels: owner all" on public.funnels;
create policy "Funnels: owner all" on public.funnels
  for all using (public.effective_owner(auth.uid()) = user_id)
  with check (public.effective_owner(auth.uid()) = user_id);

drop policy if exists "Steps: owner all" on public.funnel_steps;
create policy "Steps: owner all" on public.funnel_steps
  for all using (
    exists (select 1 from public.funnels f where f.id = funnel_id and public.effective_owner(auth.uid()) = f.user_id)
  ) with check (
    exists (select 1 from public.funnels f where f.id = funnel_id and public.effective_owner(auth.uid()) = f.user_id)
  );

drop policy if exists "Blocks: owner all" on public.blocks;
create policy "Blocks: owner all" on public.blocks
  for all using (
    exists (
      select 1 from public.funnel_steps s
      join public.funnels f on f.id = s.funnel_id
      where s.id = step_id and public.effective_owner(auth.uid()) = f.user_id
    )
  ) with check (
    exists (
      select 1 from public.funnel_steps s
      join public.funnels f on f.id = s.funnel_id
      where s.id = step_id and public.effective_owner(auth.uid()) = f.user_id
    )
  );

drop policy if exists "Leads: owner read" on public.leads;
create policy "Leads: owner read" on public.leads
  for select using (
    exists (select 1 from public.funnels f where f.id = funnel_id and public.effective_owner(auth.uid()) = f.user_id)
  );

-- ============================================================
-- 3. Bibliothèque de blocs réutilisables
-- ============================================================
create table if not exists public.reusable_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  content jsonb not null default '{}'::jsonb,
  usage_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.reusable_blocks enable row level security;

drop policy if exists "reusable_blocks: owner all" on public.reusable_blocks;
create policy "reusable_blocks: owner all" on public.reusable_blocks
  for all using (public.effective_owner(auth.uid()) = user_id)
  with check (public.effective_owner(auth.uid()) = user_id);

-- ============================================================
-- 4. Webhooks sortants (Zapier, Make, Google Sheets, CRM...)
--    Nécessite l'extension pg_net (déjà activée par défaut sur Supabase).
-- ============================================================
create extension if not exists pg_net with schema extensions;

create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  funnel_id uuid references public.funnels(id) on delete cascade,
  label text not null default 'Webhook',
  url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.webhooks enable row level security;

drop policy if exists "webhooks: owner all" on public.webhooks;
create policy "webhooks: owner all" on public.webhooks
  for all using (public.effective_owner(auth.uid()) = user_id)
  with check (public.effective_owner(auth.uid()) = user_id);

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null references public.webhooks(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  dispatched_at timestamptz not null default now()
);

alter table public.webhook_logs enable row level security;

drop policy if exists "webhook_logs: owner reads" on public.webhook_logs;
create policy "webhook_logs: owner reads" on public.webhook_logs
  for select using (
    exists (select 1 from public.webhooks w where w.id = webhook_id and public.effective_owner(auth.uid()) = w.user_id)
  );

-- Déclenche l'appel HTTP asynchrone (pg_net) vers chaque webhook actif du
-- propriétaire du tunnel dès qu'un nouveau lead est capturé.
create or replace function public.dispatch_lead_webhooks()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  wh record;
  owner uuid;
  payload jsonb;
begin
  select user_id into owner from public.funnels where id = new.funnel_id;

  payload := jsonb_build_object(
    'event', 'lead.created',
    'lead', jsonb_build_object('id', new.id, 'email', new.email, 'name', new.name, 'created_at', new.created_at),
    'funnel_id', new.funnel_id,
    'step_id', new.step_id
  );

  for wh in
    select * from public.webhooks
    where active = true and user_id = owner and (funnel_id is null or funnel_id = new.funnel_id)
  loop
    perform extensions.net.http_post(url := wh.url, body := payload);
    insert into public.webhook_logs (webhook_id, lead_id) values (wh.id, new.id);
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_dispatch_lead_webhooks on public.leads;
create trigger trg_dispatch_lead_webhooks
  after insert on public.leads
  for each row execute procedure public.dispatch_lead_webhooks();

-- ============================================================
-- 5. Journal d'audit — trace les actions admin sensibles
-- ============================================================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log: admin select" on public.audit_log;
create policy "audit_log: admin select" on public.audit_log
  for select using (public.is_admin(auth.uid()));

drop policy if exists "audit_log: admin insert" on public.audit_log;
create policy "audit_log: admin insert" on public.audit_log
  for insert with check (public.is_admin(auth.uid()));

-- ============================================================
-- 6. Benchmark sectoriel — moyenne anonymisée de conversion par
--    catégorie de tunnel (aucune donnée individuelle exposée).
-- ============================================================
create or replace function public.category_benchmark(p_category text)
returns table(avg_conversion numeric, sample_size int)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(avg(v.conversion), 0) as avg_conversion,
    count(*)::int as sample_size
  from (
    select
      f.id,
      sum(s.views) as views,
      (select count(*) from public.leads l where l.funnel_id = f.id) as lead_count,
      case when sum(s.views) > 0
        then (select count(*) from public.leads l where l.funnel_id = f.id)::numeric / sum(s.views)
        else null
      end as conversion
    from public.funnels f
    join public.funnel_steps s on s.funnel_id = f.id
    where f.is_published = true and f.category = p_category
    group by f.id
    having sum(s.views) >= 20
  ) v;
$$;

grant execute on function public.category_benchmark(text) to authenticated;

-- ============================================================
-- 7. Stockage : un éditeur d'équipe doit pouvoir déposer des
--    images dans le dossier du propriétaire (logo, images de blocs).
-- ============================================================
drop policy if exists "funnel-assets owner insert" on storage.objects;
create policy "funnel-assets owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'funnel-assets' and (storage.foldername(name))[1] = public.effective_owner(auth.uid())::text);

drop policy if exists "funnel-assets owner update" on storage.objects;
create policy "funnel-assets owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'funnel-assets' and (storage.foldername(name))[1] = public.effective_owner(auth.uid())::text);

drop policy if exists "funnel-assets owner delete" on storage.objects;
create policy "funnel-assets owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'funnel-assets' and (storage.foldername(name))[1] = public.effective_owner(auth.uid())::text);
