// Détecte "l'offre principale" d'une page quand elle n'est pas ambiguë, pour
// permettre aux boutons Hero/CTA de déclencher le paiement directement sans
// réglage manuel supplémentaire — s'il y a plusieurs offres (ou aucune) sur
// la page, on reste volontairement sur le comportement "avancer à l'étape
// suivante" plutôt que de deviner laquelle choisir.
export function resolvePrimaryOffer(blocks) {
  const candidates = [];
  for (const block of blocks || []) {
    if (block.type !== 'pricing') continue;
    (block.content?.plans || []).forEach((plan, planIndex) => {
      const link = (plan.paymentLinks || [])[0];
      if (link) candidates.push({ blockId: block.id, planIndex, plan, link });
    });
  }
  return candidates.length === 1 ? candidates[0] : null;
}

// Même forme de retour que resolvePrimaryOffer, mais à partir de l'offre
// déjà choisie explicitement par le vendeur pour le pied de page collant
// (voir PageSettingsPanel.jsx, priceBlockId/planIndex) — jamais ambiguë par
// construction, contrairement à resolvePrimaryOffer.
export function resolveStickyFooterOffer(stickyFooterCta, allBlocks) {
  if (!stickyFooterCta?.priceBlockId) return null;
  const block = (allBlocks || []).find(
    (b) => b.id === stickyFooterCta.priceBlockId && b.type === 'pricing',
  );
  const plan = block?.content?.plans?.[stickyFooterCta.planIndex];
  const link = plan?.paymentLinks?.[0];
  if (!plan || !link) return null;
  return { blockId: block.id, planIndex: stickyFooterCta.planIndex, plan, link };
}
