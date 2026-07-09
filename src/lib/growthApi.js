import { supabase } from './supabaseClient';

// ============ Webhooks ============
export async function fetchWebhooks(userId) {
  const { data, error } = await supabase.from('webhooks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createWebhook({ userId, label, url, funnelId = null }) {
  const { data, error } = await supabase.from('webhooks').insert({ user_id: userId, label, url, funnel_id: funnelId }).select().single();
  if (error) throw error;
  return data;
}

export async function toggleWebhook(id, active) {
  const { error } = await supabase.from('webhooks').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function deleteWebhook(id) {
  const { error } = await supabase.from('webhooks').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchWebhookLogs(webhookIds) {
  if (!webhookIds.length) return [];
  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .in('webhook_id', webhookIds)
    .order('dispatched_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

// ============ Bibliothèque de blocs réutilisables ============
export async function fetchReusableBlocks(userId) {
  const { data, error } = await supabase.from('reusable_blocks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveReusableBlock({ userId, name, type, content }) {
  const { data, error } = await supabase.from('reusable_blocks').insert({ user_id: userId, name, type, content }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteReusableBlock(id) {
  const { error } = await supabase.from('reusable_blocks').delete().eq('id', id);
  if (error) throw error;
}

export async function incrementReusableBlockUsage(id, currentCount) {
  const { error } = await supabase.from('reusable_blocks').update({ usage_count: currentCount + 1 }).eq('id', id);
  if (error) throw error;
}

// ============ Équipe ============
export async function fetchOrgMembers(ownerId) {
  const { data, error } = await supabase.from('org_members').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function inviteOrgMember({ ownerId, email }) {
  const { data, error } = await supabase.from('org_members').insert({ owner_id: ownerId, invited_email: email.trim().toLowerCase() }).select().single();
  if (error) throw error;

  // Envoie l'invitation via le système d'e-mail intégré de Supabase (même
  // mécanisme que la réinitialisation de mot de passe — aucun compte externe requis).
  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/inscription`,
  });
  return data;
}

export async function removeOrgMember(id) {
  const { error } = await supabase.from('org_members').delete().eq('id', id);
  if (error) throw error;
}

// Active la place d'un invité dès qu'il se connecte avec l'e-mail invité.
export async function activatePendingMembership(userId, email) {
  const { error } = await supabase
    .from('org_members')
    .update({ member_id: userId, status: 'active' })
    .eq('invited_email', email.trim().toLowerCase())
    .eq('status', 'pending');
  if (error) throw error;
}

// ============ Benchmark sectoriel ============
export async function fetchCategoryBenchmark(category) {
  const { data, error } = await supabase.rpc('category_benchmark', { p_category: category });
  if (error) throw error;
  return data?.[0] || { avg_conversion: 0, sample_size: 0 };
}

// ============ Journal d'audit ============
export async function logAuditEvent({ actorId, action, target, meta = {} }) {
  await supabase.from('audit_log').insert({ actor_id: actorId, action, target, meta });
}

export async function fetchAuditLog(limit = 50) {
  const { data, error } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}
