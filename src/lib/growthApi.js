import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';

// Le backend NestJS renvoie du camelCase (userId, funnelId, createdAt...)
// là où Supabase renvoyait du snake_case — on traduit ici pour que les
// pages déjà écrites contre l'ancien format n'aient rien à changer (même
// principe que normalizeFunnel dans funnelsApi.js).

// ============ Webhooks ============
function normalizeWebhook(w) {
  if (!w) return null;
  return {
    id: w.id,
    user_id: w.userId,
    label: w.label,
    url: w.url,
    funnel_id: w.funnelId,
    active: w.active,
    created_at: w.createdAt,
  };
}

function normalizeWebhookLog(l) {
  if (!l) return null;
  return {
    id: l.id,
    webhook_id: l.webhookId,
    status_code: l.statusCode,
    success: l.success,
    dispatched_at: l.dispatchedAt,
  };
}

export async function fetchWebhooks() {
  const rows = await apiGet('/webhooks');
  return rows.map(normalizeWebhook);
}

export async function createWebhook({ label, url, funnelId = null }) {
  const row = await apiPost('/webhooks', { label, url, funnelId: funnelId || undefined });
  return normalizeWebhook(row);
}

export async function toggleWebhook(id, active) {
  await apiPatch(`/webhooks/${id}`, { active });
}

export async function deleteWebhook(id) {
  await apiDelete(`/webhooks/${id}`);
}

export async function fetchWebhookLogs(webhookIds) {
  if (!webhookIds.length) return [];
  const rows = await apiGet(`/webhook-logs?webhookIds=${webhookIds.join(',')}`);
  return rows.map(normalizeWebhookLog);
}

// ============ Bibliothèque de blocs réutilisables ============
function normalizeReusableBlock(b) {
  if (!b) return null;
  return {
    id: b.id,
    user_id: b.userId,
    name: b.name,
    type: b.type,
    content: b.content,
    usage_count: b.usageCount,
    created_at: b.createdAt,
  };
}

export async function fetchReusableBlocks() {
  const rows = await apiGet('/reusable-blocks');
  return rows.map(normalizeReusableBlock);
}

export async function saveReusableBlock({ name, type, content }) {
  const row = await apiPost('/reusable-blocks', { name, type, content });
  return normalizeReusableBlock(row);
}

export async function deleteReusableBlock(id) {
  await apiDelete(`/reusable-blocks/${id}`);
}

// Le compteur d'usage est incrémenté côté serveur (jamais recalculé côté
// client) — currentCount n'est plus utilisé, gardé en paramètre pour ne
// pas devoir retoucher les appelants existants.
export async function incrementReusableBlockUsage(id) {
  await apiPost(`/reusable-blocks/${id}/increment-usage`, {});
}

// ============ Équipe ============
function normalizeOrgMember(m) {
  if (!m) return null;
  return {
    id: m.id,
    owner_id: m.ownerId,
    member_id: m.memberId,
    invited_email: m.invitedEmail,
    status: m.status,
    created_at: m.createdAt,
  };
}

export async function fetchOrgMembers() {
  const rows = await apiGet('/org-members');
  return rows.map(normalizeOrgMember);
}

export async function inviteOrgMember({ email }) {
  const row = await apiPost('/org-members', { email: email.trim().toLowerCase() });
  return normalizeOrgMember(row);
}

export async function removeOrgMember(id) {
  await apiDelete(`/org-members/${id}`);
}

// L'activation d'une invitation en attente se fait désormais automatiquement
// côté serveur à la connexion/inscription (voir AuthService) — cette
// fonction n'a plus besoin d'être appelée depuis le frontend.

// ============ Benchmark sectoriel ============
export async function fetchCategoryBenchmark(category) {
  return apiGet(`/analytics/category-benchmark?category=${encodeURIComponent(category)}`);
}

// ============ Journal d'audit ============
// La création d'événements d'audit se fait désormais automatiquement côté
// serveur, au moment de l'action elle-même (voir AdminService) — plus
// besoin de logAuditEvent depuis le frontend.
export async function fetchAuditLog(limit = 50) {
  const rows = await apiGet(`/audit-log?limit=${limit}`);
  return rows.map((e) => ({
    id: e.id,
    actor_id: e.actorId,
    action: e.action,
    target: e.target,
    meta: e.meta,
    created_at: e.createdAt,
  }));
}
