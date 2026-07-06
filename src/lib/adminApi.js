import { supabase } from './supabaseClient';

export async function fetchAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAllFunnels() {
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAllLeadCounts() {
  const { data, error } = await supabase.from('leads').select('funnel_id');
  if (error) throw error;
  const counts = {};
  for (const row of data) {
    counts[row.funnel_id] = (counts[row.funnel_id] || 0) + 1;
  }
  return counts;
}

export async function updateUserPlanAsAdmin(userId, plan) {
  const { error } = await supabase.from('profiles').update({ plan }).eq('id', userId);
  if (error) throw error;
}

export async function setAdminByEmail(email, isAdmin) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('email', email)
    .select();
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('NOT_FOUND');
  }
  return data[0];
}

export async function deleteFunnelAsAdmin(funnelId) {
  const { error } = await supabase.from('funnels').delete().eq('id', funnelId);
  if (error) throw error;
}
