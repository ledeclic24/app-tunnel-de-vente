-- Vendeko — migration 002 : differenciation des plans (branding)
-- A executer une seule fois dans Supabase > SQL Editor, APRES sql/schema.sql.

alter table public.funnels add column if not exists show_branding boolean not null default true;
