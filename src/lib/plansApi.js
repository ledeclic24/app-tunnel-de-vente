import { supabase } from './supabaseClient';
import { PLANS, PLAN_ORDER } from './plans';

export async function fetchPlanPrices() {
  const { data, error } = await supabase.from('plan_settings').select('*');
  if (error) throw error;
  const map = {};
  (data || []).forEach((row) => { map[row.key] = row; });
  return map;
}

export async function getLivePlans() {
  const prices = await fetchPlanPrices();
  const merged = {};
  for (const key of PLAN_ORDER) {
    merged[key] = { ...PLANS[key], price: prices[key]?.price ?? PLANS[key].price };
  }
  return merged;
}

export async function updatePlanPrice(key, price) {
  const { error } = await supabase.from('plan_settings').update({ price, updated_at: new Date().toISOString() }).eq('key', key);
  if (error) throw error;
}

export async function logPlanChange(userId, oldPlan, newPlan) {
  if (oldPlan === newPlan) return;
  const { error } = await supabase.from('plan_change_events').insert({ user_id: userId, old_plan: oldPlan, new_plan: newPlan });
  if (error) throw error;
}
