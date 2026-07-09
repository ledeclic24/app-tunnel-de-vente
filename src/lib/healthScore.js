// Évalue la qualité d'un tunnel à partir de son contenu réel (étapes + blocs),
// sans appel réseau : tout est déjà chargé côté éditeur au moment du calcul.

function stepBlocks(blocksByStepId, stepId) {
  return blocksByStepId[stepId] || [];
}

export function computeHealthScore(steps, blocksByStepId) {
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
  });

  const heroBlocks = allBlocks.filter((b) => b.type === 'hero');
  const heroHasHeading = heroBlocks.length === 0 || heroBlocks.every((b) => (b.content?.heading || '').trim().length > 0);
  checks.push({
    id: 'hero-heading',
    label: heroHasHeading ? 'Le titre principal est renseigné' : 'Un bloc Hero a un titre vide',
    passed: heroHasHeading,
  });

  const imageBlocks = allBlocks.filter((b) => b.type === 'image' || b.type === 'hero');
  const imagesWithoutAlt = imageBlocks.filter((b) => b.content?.url || b.content?.imageUrl ? !(b.content?.alt || '').trim() : false);
  checks.push({
    id: 'image-alt',
    label: imagesWithoutAlt.length === 0 ? 'Toutes les images ont un texte alternatif' : `${imagesWithoutAlt.length} image(s) sans texte alternatif`,
    passed: imagesWithoutAlt.length === 0,
  });

  const formBlocks = allBlocks.filter((b) => b.type === 'form');
  const formsWithGenericButton = formBlocks.filter((b) => {
    const txt = (b.content?.buttonText || '').trim().toLowerCase();
    return !txt || txt === 'envoyer';
  });
  checks.push({
    id: 'form-cta-text',
    label: formsWithGenericButton.length === 0 ? 'Les boutons de formulaire ont un texte personnalisé' : 'Un formulaire utilise encore le texte de bouton par défaut',
    passed: formBlocks.length === 0 || formsWithGenericButton.length === 0,
  });

  const ctaPerStepOverloaded = steps.some((s) => stepBlocks(blocksByStepId, s.id).filter((b) => b.type === 'cta').length > 2);
  checks.push({
    id: 'cta-not-overloaded',
    label: ctaPerStepOverloaded ? 'Une étape a plus de deux appels à l\'action — risque de diluer l\'attention' : 'Le nombre d\'appels à l\'action par étape reste raisonnable',
    passed: !ctaPerStepOverloaded,
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
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = checks.length === 0 ? 0 : Math.round((passedCount / checks.length) * 100);

  return { score, checks };
}
