import { apiGet, apiPatch, apiDelete } from './apiClient';

// Traduit les champs camelCase du backend NestJS vers le format snake_case
// attendu par les pages admin existantes (même principe que normalizeFunnel
// dans funnelsApi.js).
function normalizeProfile(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    full_name: u.fullName,
    plan: u.plan,
    is_admin: u.isAdmin,
    created_at: u.createdAt,
  };
}

function normalizeFunnel(f) {
  if (!f) return null;
  return {
    id: f.id,
    user_id: f.userId,
    name: f.name,
    slug: f.slug,
    template: f.template,
    is_published: f.isPublished,
    created_at: f.createdAt,
  };
}

export async function fetchAllProfiles() {
  const rows = await apiGet('/admin/users');
  return rows.map(normalizeProfile);
}

export async function fetchAllFunnels() {
  const rows = await apiGet('/admin/funnels');
  return rows.map(normalizeFunnel);
}

export async function fetchAllLeadCounts() {
  return apiGet('/admin/leads/counts');
}

export async function updateUserPlanAsAdmin(userId, plan) {
  await apiPatch(`/admin/users/${userId}/plan`, { plan });
}

export async function setAdminStatus(userId, isAdmin) {
  await apiPatch(`/admin/users/${userId}/admin-status`, { isAdmin });
}

export async function deleteFunnelAsAdmin(funnelId) {
  await apiDelete(`/admin/funnels/${funnelId}`);
}
