-- Vendeko — migration 008 : correctif de sécurité RLS (auto-élévation de privilège)
-- A executer dans Supabase > SQL Editor.
--
-- Problème corrigé : la policy "Profiles: update own" (schema.sql) autorise
-- un utilisateur à modifier sa propre ligne, mais sans clause WITH CHECK
-- limitant les colonnes modifiables. En pratique, n'importe quel utilisateur
-- connecté pouvait donc s'attribuer is_admin = true (accès complet à /app/admin),
-- changer son propre email affiché, ou passer son propre plan à "entreprise"
-- gratuitement, directement via le client Supabase, sans passer par l'application.
--
-- Ce correctif ajoute un trigger qui bloque toute tentative de modification
-- de is_admin, email ou plan par quelqu'un qui n'est pas déjà administrateur.
-- Tant que le paiement n'est pas intégré, seul un administrateur peut donc
-- changer le plan d'un compte (y compris le sien). Seul full_name reste
-- librement modifiable par le propriétaire du profil.

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_admin(auth.uid()) then
    raise exception 'Seul un administrateur peut modifier ce champ.';
  end if;

  if new.email is distinct from old.email and not public.is_admin(auth.uid()) then
    raise exception 'L''email ne peut pas être modifié directement ici.';
  end if;

  if new.plan is distinct from old.plan and not public.is_admin(auth.uid()) then
    raise exception 'Le changement de plan doit passer par un administrateur pour le moment.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_profile_privilege_escalation on public.profiles;
create trigger trg_prevent_profile_privilege_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_privilege_escalation();
