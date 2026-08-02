import { parsePriceAmount } from './checkoutApi';

// Évalue la qualité d'un tunnel à partir de son contenu réel (étapes + blocs),
// sans appel réseau : tout est déjà chargé côté éditeur au moment du calcul.
//
// Certains points vérifiés portent en plus `stepId`/`blockId`/`target`
// (voir HealthScoreCard.jsx) : la première occurrence en échec repérée
// pendant le parcours, pour qu'un clic sur ce point amène directement à
// l'endroit à corriger plutôt que de rester un simple constat. Un point
// sans `stepId` (ex. absence de témoignages) n'a pas d'endroit unique où
// naviguer — il ajouterait un bloc, pas en corriger un — et reste un
// simple indicateur, non cliquable.

function stepBlocks(blocksByStepId, stepId) {
  return blocksByStepId[stepId] || [];
}

export function computeHealthScore(steps, blocksByStepId, funnelDeliverable) {
  const allBlocks = steps.flatMap((s) => stepBlocks(blocksByStepId, s.id));
  const checks = [];

  const hasConversionPoint = allBlocks.some((b) => b.type === 'form' || b.type === 'cta');
  checks.push({
    id: 'conversion-point',
    label: hasConversionPoint ? 'Au moins un point de conversion (formulaire ou appel à l\'action)' : 'Aucun formulaire ni appel à l\'action dans ce tunnel',
    passed: hasConversionPoint,
  });

  const emptySteps = steps.filter((s) => stepBlocks(blocksByStepId, s.id).length === 0);
  checks.push({
    id: 'no-empty-steps',
    label: emptySteps.length === 0 ? 'Chaque étape contient au moins un bloc' : `${emptySteps.length} étape(s) sans aucun contenu`,
    passed: emptySteps.length === 0,
    stepId: emptySteps[0]?.id,
    target: 'step',
  });

  let heroHeadingStepId, heroHeadingBlockId;
  for (const s of steps) {
    const hero = stepBlocks(blocksByStepId, s.id).find((b) => b.type === 'hero' && !(b.content?.heading || '').trim());
    if (hero) { heroHeadingStepId = s.id; heroHeadingBlockId = hero.id; break; }
  }
  checks.push({
    id: 'hero-heading',
    label: !heroHeadingBlockId ? 'Le titre principal est renseigné' : 'Un bloc Hero a un titre vide',
    passed: !heroHeadingBlockId,
    stepId: heroHeadingStepId,
    blockId: heroHeadingBlockId,
    target: 'block',
  });

  let imageAltStepId, imageAltBlockId, imagesWithoutAltCount = 0;
  for (const s of steps) {
    for (const b of stepBlocks(blocksByStepId, s.id)) {
      if (b.type !== 'image' && b.type !== 'hero') continue;
      const hasImage = b.content?.url || b.content?.imageUrl;
      const hasAlt = (b.content?.alt || '').trim();
      if (hasImage && !hasAlt) {
        imagesWithoutAltCount += 1;
        if (!imageAltBlockId) { imageAltStepId = s.id; imageAltBlockId = b.id; }
      }
    }
  }
  checks.push({
    id: 'image-alt',
    label: imagesWithoutAltCount === 0 ? 'Toutes les images ont un texte alternatif' : `${imagesWithoutAltCount} image(s) sans texte alternatif`,
    passed: imagesWithoutAltCount === 0,
    stepId: imageAltStepId,
    blockId: imageAltBlockId,
    target: 'block',
  });

  let formCtaStepId, formCtaBlockId, formBlocksCount = 0, formsWithGenericButtonCount = 0;
  for (const s of steps) {
    for (const b of stepBlocks(blocksByStepId, s.id)) {
      if (b.type !== 'form') continue;
      formBlocksCount += 1;
      const txt = (b.content?.buttonText || '').trim().toLowerCase();
      if (!txt || txt === 'envoyer') {
        formsWithGenericButtonCount += 1;
        if (!formCtaBlockId) { formCtaStepId = s.id; formCtaBlockId = b.id; }
      }
    }
  }
  checks.push({
    id: 'form-cta-text',
    label: formsWithGenericButtonCount === 0 ? 'Les boutons de formulaire ont un texte personnalisé' : 'Un formulaire utilise encore le texte de bouton par défaut',
    passed: formBlocksCount === 0 || formsWithGenericButtonCount === 0,
    stepId: formCtaStepId,
    blockId: formCtaBlockId,
    target: 'block',
  });

  const overloadedStep = steps.find((s) => stepBlocks(blocksByStepId, s.id).filter((b) => b.type === 'cta').length > 2);
  checks.push({
    id: 'cta-not-overloaded',
    label: overloadedStep ? 'Une étape a plus de deux appels à l\'action — risque de diluer l\'attention' : 'Le nombre d\'appels à l\'action par étape reste raisonnable',
    passed: !overloadedStep,
    stepId: overloadedStep?.id,
    target: 'step',
  });

  const hasSocialProof = allBlocks.some((b) => b.type === 'testimonials');
  checks.push({
    id: 'social-proof',
    label: hasSocialProof ? 'Un bloc de témoignages renforce la confiance' : 'Aucun témoignage — envisagez d\'en ajouter un',
    passed: hasSocialProof,
  });

  const lastStep = steps[steps.length - 1];
  const lastStepHasThanks = lastStep ? stepBlocks(blocksByStepId, lastStep.id).some((b) => b.type === 'text' || b.type === 'cta') : false;
  checks.push({
    id: 'closing-step',
    label: lastStepHasThanks ? 'La dernière étape referme bien le parcours' : 'La dernière étape ne contient ni message de remerciement ni appel à l\'action',
    passed: steps.length === 0 || lastStepHasThanks,
    stepId: !lastStepHasThanks ? lastStep?.id : undefined,
    target: 'step',
  });

  // Critères de psychologie de vente — s'ajoutent aux vérifications
  // techniques ci-dessus, dans le même esprit "coach IA" : enseigner de
  // bonnes pratiques pendant la construction plutôt qu'après coup.
  const hasUrgency = steps.some((s) => s.chrome?.countdownBar?.enabled);
  checks.push({
    id: 'urgency',
    label: hasUrgency ? 'Un compte à rebours crée un sentiment d\'urgence' : 'Aucun élément d\'urgence (ex : compte à rebours) — envisagez d\'en ajouter un si votre offre est limitée dans le temps',
    passed: hasUrgency,
    // Réglage de page (voir PageSettingsPanel), pas un bloc à corriger —
    // amène à la dernière étape (souvent la page de vente/commande) plutôt
    // que de deviner laquelle parmi toutes.
    stepId: !hasUrgency ? lastStep?.id : undefined,
    target: 'page',
  });

  const hasFaq = allBlocks.some((b) => b.type === 'faq');
  checks.push({
    id: 'objection-handling',
    label: hasFaq ? 'Une FAQ répond aux objections avant l\'achat' : 'Aucune FAQ — les objections des visiteurs restent sans réponse',
    passed: hasFaq,
  });

  const hasTrustBadges = allBlocks.some((b) => b.type === 'trust-badges');
  checks.push({
    id: 'reassurance',
    label: hasTrustBadges ? 'Un bloc de réassurance renforce la confiance au moment de payer' : 'Aucun élément de réassurance (paiement sécurisé, garantie...) près du bouton d\'achat',
    passed: hasTrustBadges,
  });

  let ctaPersonalizedStepId, ctaPersonalizedBlockId, ctaBlocksCount = 0, ctaBlocksGenericCount = 0;
  for (const s of steps) {
    for (const b of stepBlocks(blocksByStepId, s.id)) {
      if (b.type !== 'cta') continue;
      ctaBlocksCount += 1;
      const txt = (b.content?.buttonText || '').trim().toLowerCase();
      if (!txt || txt === 'continuer') {
        ctaBlocksGenericCount += 1;
        if (!ctaPersonalizedBlockId) { ctaPersonalizedStepId = s.id; ctaPersonalizedBlockId = b.id; }
      }
    }
  }
  checks.push({
    id: 'cta-personalized',
    label: ctaBlocksGenericCount === 0 ? 'Les boutons d\'appel à l\'action sont personnalisés' : 'Un appel à l\'action utilise encore le texte par défaut ("Continuer") — un verbe d\'action à la première personne convertit mieux',
    passed: ctaBlocksCount === 0 || ctaBlocksGenericCount === 0,
    stepId: ctaPersonalizedStepId,
    blockId: ctaPersonalizedBlockId,
    target: 'block',
  });

  // Miroir du blocage serveur (FunnelsService.publish → findUnpayableOffers) :
  // signalé ici AVANT la tentative de publication plutôt que découvert
  // seulement au clic sur "Publier" — un vendeur débutant qui ne connaît pas
  // encore l'existence du bloc Tarifs n'a sinon aucune raison d'aller y
  // chercher un réglage de paiement (retour utilisateur réel).
  let paymentStepId, paymentBlockId, unpaidOfferName;
  for (const s of steps) {
    for (const b of stepBlocks(blocksByStepId, s.id)) {
      if (b.type !== 'pricing') continue;
      const unpaidPlan = (b.content?.plans || []).find(
        (p) => parsePriceAmount(p.price) > 0 && (p.paymentLinks || []).length === 0,
      );
      if (unpaidPlan) { paymentStepId = s.id; paymentBlockId = b.id; unpaidOfferName = unpaidPlan.name || 'Offre'; break; }
    }
    if (paymentBlockId) break;
  }
  checks.push({
    id: 'payment-method',
    label: !paymentBlockId ? 'Chaque offre payante a un moyen de paiement rattaché' : `L'offre "${unpaidOfferName}" a un prix mais aucun moyen de paiement rattaché`,
    passed: !paymentBlockId,
    stepId: paymentStepId,
    blockId: paymentBlockId,
    target: 'block',
  });

  // Miroir du second blocage serveur (FunnelsService.publish, juste après
  // findUnpayableOffers) : une offre payante sans ebook/fichier/instructions
  // rattaché ne livre rien au client après paiement. Même logique de
  // discoverability que "payment-method" ci-dessus — signalé avant la
  // tentative de publication. Pas de stepId/blockId : ce réglage vit au
  // niveau du tunnel (Réglages → Général → Livraison automatique), pas sur
  // une étape précise, d'où `target: 'settings'` plutôt que 'step'/'block'.
  const hasPricedPlan = allBlocks.some(
    (b) =>
      b.type === 'pricing' &&
      (b.content?.plans || []).some((p) => parsePriceAmount(p.price) > 0),
  );
  const hasDeliverable = Boolean(
    funnelDeliverable?.hasEbook ||
      funnelDeliverable?.hasFile ||
      funnelDeliverable?.hasInstructions,
  );
  checks.push({
    id: 'deliverable',
    label:
      !hasPricedPlan || hasDeliverable
        ? 'Un livrable est configuré pour toute offre payante'
        : "Ce tunnel vend une offre payante mais aucun livrable n'est configuré (ebook, fichier ou instructions)",
    passed: !hasPricedPlan || hasDeliverable,
    target: 'settings',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = checks.length === 0 ? 0 : Math.round((passedCount / checks.length) * 100);

  return { score, checks };
}
