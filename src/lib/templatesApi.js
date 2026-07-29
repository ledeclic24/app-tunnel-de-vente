import { apiGet, apiPost, apiPatch } from './apiClient';
import { generateFunnelSlug } from './slug';

function normalizeTemplate(t) {
  if (!t) return null;
  return {
    id: t.id,
    author_id: t.authorId,
    name: t.name,
    description: t.description,
    category: t.category,
    preview_image_url: t.previewImageUrl,
    content: t.content,
    status: t.status,
    rejection_reason: t.rejectionReason,
    usage_count: t.usageCount,
    featured: !!t.featured,
    created_at: t.createdAt,
  };
}

export async function publishTemplate({ funnelId, name, description, category }) {
  const row = await apiPost('/templates', { funnelId, name, description, category });
  return normalizeTemplate(row);
}

export async function fetchTemplates({ category, search } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  const query = params.toString();
  const rows = await apiGet(`/templates${query ? `?${query}` : ''}`);
  return rows.map(normalizeTemplate);
}

export async function fetchTemplate(id) {
  const row = await apiGet(`/templates/${id}`);
  return normalizeTemplate(row);
}

export async function incrementTemplateUsage(id) {
  await apiPost(`/templates/${id}/increment-usage`, {});
}

// Le contenu stocké (template.content.steps, voir TemplatesService.
// publishFromFunnel) est déjà dans le format {name, slug, stepType,
// blocks:[{type, content}]} attendu par POST /funnels — aucune
// retranscription nécessaire, contrairement à createFunnelFromTemplate
// (modèles statiques) qui part d'une forme différente.
export async function cloneTemplate(templateId, name, showBranding = true) {
  const template = await fetchTemplate(templateId);
  const slug = generateFunnelSlug(name);
  const funnel = await apiPost('/funnels', {
    name,
    slug,
    template: 'modele',
    showBranding,
    category: template.category,
    steps: template.content?.steps || [],
  });
  await incrementTemplateUsage(templateId);
  return funnel;
}

export async function fetchPendingTemplates() {
  const rows = await apiGet('/admin/templates');
  return rows.map((t) => ({ ...normalizeTemplate(t), author: t.author ? { email: t.author.email, full_name: t.author.fullName } : null }));
}

export async function reviewTemplate(id, { status, rejectionReason }) {
  const row = await apiPatch(`/admin/templates/${id}`, { status, rejectionReason });
  return normalizeTemplate(row);
}

export async function fetchApprovedTemplatesForAdmin() {
  const rows = await apiGet('/admin/templates/approved');
  return rows.map(normalizeTemplate);
}

export async function setTemplateFeatured(id, featured) {
  const row = await apiPatch(`/admin/templates/${id}/featured`, { featured });
  return normalizeTemplate(row);
}
