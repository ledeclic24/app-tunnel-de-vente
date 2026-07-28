// Mémorise, par tunnel (clé = slug, connu avant même le premier chargement
// du snapshot), l'identifiant du lead dont le paiement Moneroo vient d'être
// confirmé — seule "preuve" que ce navigateur a réellement payé. Envoyée à
// chaque appel de fetchPublishedSnapshot pour débloquer le contenu des
// étapes protégées (voir FunnelsService.getPublicSnapshot côté serveur, qui
// revalide toujours que ce lead est bien payé pour CE tunnel avant de
// renvoyer quoi que ce soit — ce stockage local ne sert qu'à re-présenter
// la preuve, jamais une source de confiance en lui-même).
const KEY_PREFIX = 'vk_paid_';

export function getPaidProof(funnelSlug) {
  if (!funnelSlug) return null;
  try {
    return globalThis.localStorage.getItem(KEY_PREFIX + funnelSlug);
  } catch {
    return null;
  }
}

export function setPaidProof(funnelSlug, leadId) {
  if (!funnelSlug || !leadId) return;
  try {
    globalThis.localStorage.setItem(KEY_PREFIX + funnelSlug, leadId);
  } catch {
    // localStorage indisponible — tant pis, le contenu protégé restera
    // masqué pour ce visiteur (repli sûr, jamais l'inverse).
  }
}
