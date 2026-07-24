import { apiGet, apiPatch } from './apiClient';
import { PLANS, PLAN_ORDER } from './plans';

export async function fetchPlanPrices() {
  const rows = await apiGet('/plan-settings');
  const map = {};
  (rows || []).forEach((row) => { map[row.key] = row; });
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
  await apiPatch(`/plan-settings/${key}`, { price });
}

// Le journal des changements de plan est désormais tenu automatiquement
// côté serveur (voir AdminService.updateUserPlan / SubscriptionsService) —
// logPlanChange n'a plus besoin d'être appelé depuis le frontend.
