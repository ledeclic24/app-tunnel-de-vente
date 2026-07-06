-- Vendeko — migration 007 : suivi de l'usage de la génération de tunnel par IA
-- A executer dans Supabase > SQL Editor.

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.ai_generations enable row level security;

drop policy if exists "ai_generations: owner select" on public.ai_generations;
create policy "ai_generations: owner select" on public.ai_generations
  for select using (auth.uid() = user_id);

-- Les insertions se font uniquement depuis la fonction serveur (clé service_role),
-- qui contourne RLS — aucune policy d'insertion n'est nécessaire côté client.
