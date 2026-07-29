// Le contenu d'un modèle est un instantané JSON sans id persisté (voir
// TemplatesService.publishFromFunnel) — FunnelPreviewModal a besoin d'un id
// stable par étape/bloc pour sa navigation interne : générés ici, jamais
// envoyés au serveur. Aucune palette de marque n'est capturée à la
// publication du modèle, l'aperçu retombe donc sur les couleurs par défaut
// plutôt que sur celles du tunnel d'origine. Utilisé à la fois par le
// panneau admin (modération) et le marketplace public (avant clonage).
export function buildTemplatePreviewData(template) {
  const rawSteps = template.content?.steps || [];
  const steps = rawSteps.map((s, i) => ({ id: `s${i}`, name: s.name, slug: s.slug, stepType: s.stepType, chrome: null }));
  const blocksByStepId = {};
  rawSteps.forEach((s, i) => {
    blocksByStepId[`s${i}`] = (s.blocks || []).map((b, j) => ({ id: `s${i}-b${j}`, type: b.type, content: b.content }));
  });
  return { funnel: { name: template.name, brand: {} }, steps, blocksByStepId };
}
