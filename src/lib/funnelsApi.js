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
    show_branding: f.showBranding,
    brand: f.brand,
    category: f.category,
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
  };
}

const FUNNEL_PATCH_KEY_MAP = {
  name: 'name',
  is_published: 'isPublished',
  show_branding: 'showBranding',
  brand: 'brand',
  category: 'category',
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

export async function incrementStepView(stepId) {
  await apiPost(`/steps/${stepId}/view`);
}

export async function fetchLeadsForUser(_userId) {
  const rows = await apiGet('/leads/mine');
  return rows.map(normalizeLead);
}

export async function fetchFunnelStepsAnalytics(funnelId) {
  return apiGet(`/funnels/${funnelId}/analytics`);
}
