import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';
import { getTemplate } from './funnelTemplates';
import { generateFunnelSlug } from './slug';

// Le backend NestJS/TypeORM renvoie des champs camelCase (fullName,
// isPublished...) là où Supabase/Postgres renvoyait du snake_case
// (full_name, is_published...). On traduit ici pour que les pages/composants
// déjà écrits contre l'ancien format n'aient rien à changer.
function normalizeFunnel(f) {
  if (!f) return null;
  return {
    id: f.id,
    user_id: f.userId,
    name: f.name,
    slug: f.slug,
    template: f.template,
    is_published: f.isPublished,
    has_unpublished_changes: f.hasUnpublishedChanges,
    last_published_at: f.lastPublishedAt,
    show_branding: f.showBranding,
    brand: f.brand,
    category: f.category,
    is_gallery_opt_in: f.isGalleryOptIn,
    seo_title: f.seoTitle,
    seo_description: f.seoDescription,
    seo_image_url: f.seoImageUrl,
    publish_at: f.publishAt,
    unpublish_at: f.unpublishAt,
    deliverable_ebook_id: f.deliverableEbookId,
    post_purchase_instructions: f.postPurchaseInstructions,
    created_at: f.createdAt,
    updated_at: f.updatedAt,
  };
}

function normalizeLead(l) {
  if (!l) return null;
  return {
    id: l.id,
    funnel_id: l.funnelId,
    step_id: l.stepId,
    email: l.email,
    name: l.name,
    created_at: l.createdAt,
    funnelName: l.funnelName,
    email_status: l.emailStatus,
    email_error: l.emailError,
    payment_status: l.paymentStatus,
    paid_amount: l.paidAmount,
    paid_currency: l.paidCurrency,
    order_bump_taken: l.orderBumpTaken,
    order_bump_amount: l.orderBumpAmount,
    refunded_at: l.refundedAt,
    parent_lead_id: l.parentLeadId,
  };
}

const FUNNEL_PATCH_KEY_MAP = {
  name: 'name',
  show_branding: 'showBranding',
  brand: 'brand',
  category: 'category',
  is_gallery_opt_in: 'isGalleryOptIn',
  seo_title: 'seoTitle',
  seo_description: 'seoDescription',
  seo_image_url: 'seoImageUrl',
  publish_at: 'publishAt',
  unpublish_at: 'unpublishAt',
  deliverable_ebook_id: 'deliverableEbookId',
  post_purchase_instructions: 'postPurchaseInstructions',
};

function buildStepsPayload(steps) {
  return steps.map((step) => ({
    name: step.name,
    slug: step.slug,
    stepType: step.step_type || step.stepType || 'custom',
    blocks: (step.blocks || []).map((b) => ({ type: b.type, content: b.content || {} })),
  }));
}

export async function fetchUserFunnels(_userId) {
  const rows = await apiGet('/funnels');
  return rows.map(normalizeFunnel);
}

export async function fetchGalleryFunnels(category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const rows = await apiGet(`/funnels/gallery${query}`);
  return rows.map((f) => ({ id: f.id, name: f.name, slug: f.slug, category: f.category, brand: f.brand || {} }));
}

export async function createFunnelFromTemplate({ name, templateKey, showBranding = true }) {
  const template = getTemplate(templateKey);
  const slug = generateFunnelSlug(name);
  const funnel = await apiPost('/funnels', {
    name,
    slug,
    template: templateKey,
    showBranding,
    category: template.categoryKey || 'personnalise',
    steps: buildStepsPayload(template.steps),
  });
  return normalizeFunnel(funnel);
}

export async function createFunnelFromAI({ name, generatedFunnel, showBranding = true, category = 'personnalise' }) {
  const slug = generateFunnelSlug(name);
  const funnel = await apiPost('/funnels', {
    name,
    slug,
    template: 'ia',
    showBranding,
    category,
    brand: generatedFunnel.brand || {},
    steps: buildStepsPayload(generatedFunnel.steps),
  });
  return normalizeFunnel(funnel);
}

export async function fetchFunnel(funnelId) {
  const funnel = await apiGet(`/funnels/${funnelId}`);
  return normalizeFunnel(funnel);
}

export async function fetchFunnelBySlug(slug) {
  const funnel = await apiGet(`/funnels/slug/${encodeURIComponent(slug)}`);
  return normalizeFunnel(funnel);
}

export async function updateFunnel(funnelId, patch) {
  const body = {};
  for (const [key, value] of Object.entries(patch)) {
    const mapped = FUNNEL_PATCH_KEY_MAP[key];
    if (mapped) body[mapped] = value;
  }
  await apiPatch(`/funnels/${funnelId}`, body);
}

// Fige un nouveau snapshot public à partir de l'état actuel de l'éditeur —
// seul moyen de rendre un tunnel visible publiquement (voir FunnelsService.
// publish côté backend). unpublishFunnel n'efface pas le snapshot, il
// masque juste la page publique.
export async function publishFunnel(funnelId) {
  const funnel = await apiPost(`/funnels/${funnelId}/publish`, undefined);
  return normalizeFunnel(funnel);
}

export async function unpublishFunnel(funnelId) {
  const funnel = await apiPost(`/funnels/${funnelId}/unpublish`, undefined);
  return normalizeFunnel(funnel);
}

// Aucun endpoint dédié côté serveur : même principe que le clonage d'un
// modèle de la marketplace (cloneTemplate ci-dessous) — on relit le
// contenu live (étapes + blocs, en un seul appel groupé grâce à
// fetchAllBlocksForFunnel) puis on le repasse tel quel à la création
// normale d'un tunnel, qui applique déjà limites de plan, blocs
// autorisés et unicité du slug. Contrairement au clonage marketplace,
// les liens de paiement sont conservés : même propriétaire, pas un tiers.
export async function duplicateFunnel(funnelId) {
  const [original, steps, blocksByStep] = await Promise.all([
    fetchFunnel(funnelId),
    fetchSteps(funnelId),
    fetchAllBlocksForFunnel(funnelId),
  ]);
  const name = `${original.name} (copie)`;
  const slug = generateFunnelSlug(name);
  const funnel = await apiPost('/funnels', {
    name,
    slug,
    template: original.template,
    showBranding: original.show_branding,
    category: original.category,
    brand: original.brand,
    steps: steps.map((s) => ({
      name: s.name,
      slug: s.slug,
      stepType: s.stepType,
      blocks: (blocksByStep[s.id] || []).map((b) => ({ type: b.type, content: b.content })),
    })),
  });
  return normalizeFunnel(funnel);
}

// Utilisé exclusivement par PublishedFunnelPage.jsx (visiteurs publics) :
// renvoie {id,name,slug,brand,show_branding,seo*,steps:[{...,blocks}]} déjà
// figé au dernier "Publier" — jamais les tables live steps/blocks.
// paidLeadId : preuve de paiement pour débloquer le contenu des étapes
// protégées (voir gated ci-dessous) — le serveur, pas juste l'affichage,
// vide le contenu de ces étapes sans une preuve valide (voir
// FunnelsService.getPublicSnapshot).
export async function fetchPublishedSnapshot(slug, paidLeadId) {
  const query = paidLeadId ? `?paid=${encodeURIComponent(paidLeadId)}` : '';
  const data = await apiGet(`/funnels/public/${encodeURIComponent(slug)}${query}`);
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    brand: data.brand || {},
    currency: data.currency || 'XOF',
    show_branding: data.showBranding,
    seo_title: data.seoTitle,
    seo_description: data.seoDescription,
    seo_image_url: data.seoImageUrl,
    steps: (data.steps || []).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      step_type: s.stepType,
      chrome: s.chrome || {},
      gated: Boolean(s.gated),
      blocks: s.blocks || [],
    })),
  };
}

export async function deleteFunnel(funnelId) {
  await apiDelete(`/funnels/${funnelId}`);
}

export async function updateBrandingForUser(_userId, showBranding) {
  await apiPatch('/funnels/branding', { showBranding });
}

export async function fetchSteps(funnelId) {
  return apiGet(`/funnels/${funnelId}/steps`);
}

export async function addStep(funnelId, { name, slug, position }) {
  return apiPost(`/funnels/${funnelId}/steps`, { name, slug, position });
}

export async function updateStep(stepId, patch) {
  await apiPatch(`/steps/${stepId}`, patch);
}

export async function deleteStep(stepId) {
  await apiDelete(`/steps/${stepId}`);
}

export async function fetchBlocks(stepId) {
  return apiGet(`/steps/${stepId}/blocks`);
}

// Remplace un appel par étape (fetchBlocks ci-dessus, en boucle) par un
// seul appel ramenant les blocs de TOUTES les étapes du tunnel, déjà
// regroupés par stepId — utilisé par l'éditeur à l'ouverture.
export async function fetchAllBlocksForFunnel(funnelId) {
  return apiGet(`/funnels/${funnelId}/blocks`);
}

export async function addBlock(stepId, type, content, position) {
  return apiPost(`/steps/${stepId}/blocks`, { type, content, position });
}

export async function updateBlock(blockId, content) {
  await apiPatch(`/blocks/${blockId}`, { content });
}

export async function toggleBlockLock(blockId, locked) {
  return apiPatch(`/blocks/${blockId}`, { locked });
}

export async function deleteBlock(blockId) {
  await apiDelete(`/blocks/${blockId}`);
}

export async function reorderBlocks(blockIdsInOrder) {
  await apiPost('/blocks/reorder', { blockIds: blockIdsInOrder });
}

export async function reorderSteps(stepIdsInOrder) {
  await apiPost('/steps/reorder', { stepIds: stepIdsInOrder });
}

export async function insertLead({ funnelId, stepId, name, email }) {
  await apiPost('/leads', { funnelId, stepId, name, email });
}

export async function countLeads(funnelId) {
  const { count } = await apiGet(`/funnels/${funnelId}/leads/count`);
  return count || 0;
}

// Remplace un appel par tunnel (fetchFunnelStepsAnalytics, en boucle) par
// un seul total déjà agrégé côté serveur — utilisé par le tableau de bord.
export async function fetchTotalViewsForOwner() {
  const { totalViews } = await apiGet('/leads/views-summary');
  return totalViews || 0;
}

export async function incrementStepView(stepId) {
  await apiPost(`/steps/${stepId}/view`);
}

// Utilisé au retour de Moneroo (voir PublishedFunnelPage.jsx) pour afficher
// une vraie confirmation seulement une fois le paiement réellement validé
// par le webhook, jamais en se fiant seul au simple retour de navigation.
export async function fetchLeadStatus(leadId) {
  return apiGet(`/leads/${leadId}/status`);
}

export async function fetchLeadsForUser(_userId) {
  const rows = await apiGet('/leads/mine');
  return rows.map(normalizeLead);
}

export async function resendLeadEmail(leadId) {
  const { sent } = await apiPost(`/leads/${leadId}/resend-email`);
  return sent;
}

// Purement déclaratif pour la comptabilité du vendeur — Moneroo ne
// notifie jamais TonTunnel d'un remboursement (l'argent ne transite
// jamais par nous), ceci enregistre juste ce que le vendeur a constaté
// de son côté.
export async function setLeadRefunded(leadId, refunded) {
  await apiPatch(`/leads/${leadId}/refund`, { refunded });
}

export async function fetchFunnelStepsAnalytics(funnelId) {
  return apiGet(`/funnels/${funnelId}/analytics`);
}
