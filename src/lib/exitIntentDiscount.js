// Mémorise, par tunnel, que la popup "capture à l'intention de sortie" a
// déjà été montrée à ce visiteur — dans localStorage (pas sessionStorage)
// pour que ça survive un rechargement de page ou un retour ultérieur : la
// popup (et la réduction qu'elle promet, le cas échéant) ne doit jamais se
// déclencher une seconde fois, peu importe combien de fois le visiteur
// quitte la page et revient. Le pourcentage réellement facturé est de
// toute façon toujours revalidé côté serveur (voir
// FunnelsService.resolveCheckoutAmount) à partir de discountStepId — ce qui
// est stocké ici ne sert qu'à l'affichage et à référencer QUELLE étape
// consulter, jamais une source de confiance pour le montant.
const KEY_PREFIX = 'vk_exit_intent_';

export function getExitIntentState(funnelId) {
  if (!funnelId) return null;
  try {
    const raw = globalThis.localStorage.getItem(KEY_PREFIX + funnelId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function markExitIntentShown(funnelId, { discountStepId, discountPercent } = {}) {
  if (!funnelId) return;
  try {
    globalThis.localStorage.setItem(
      KEY_PREFIX + funnelId,
      JSON.stringify({
        shown: true,
        discountStepId: discountStepId || null,
        discountPercent: discountPercent || null,
      }),
    );
  } catch {
    // localStorage indisponible (navigation privée stricte, quota plein...)
    // — tant pis, la popup pourra réapparaître : pas de risque de double
    // facturation puisque le serveur revalide toujours le pourcentage.
  }
}

// Même formule que côté serveur (FunnelsService.resolveCheckoutAmount) —
// gardée identique pour que le prix affiché corresponde exactement à ce
// qui sera réellement facturé.
export function applyDiscount(amount, discountPercent) {
  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(discountPercent) ||
    discountPercent <= 0 ||
    discountPercent >= 100
  ) {
    return amount;
  }
  return Math.round(amount * (1 - discountPercent / 100) * 100) / 100;
}
