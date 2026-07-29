import { apiGet, apiPost } from './apiClient';

export async function fetchCreditsBalance() {
  return apiGet('/credits/balance');
}

export async function fetchCreditPacks() {
  return apiGet('/credits/packs');
}

export async function purchaseCreditPack(packKey) {
  const returnUrl = `${window.location.origin}/app/billing?payment=retour`;
  const { checkoutUrl } = await apiPost('/credits/packs/checkout', { packKey, returnUrl });
  return checkoutUrl;
}

// { TUNNEL_GENERATION: 10, BLOCK_REGENERATION: 3, ... } — mêmes clés que
// CREDIT_COSTS côté serveur, jamais dupliquées en dur ici pour ne pas
// désynchroniser l'affichage du coût réellement appliqué.
export async function fetchCreditCosts() {
  return apiGet('/credits/costs');
}

export async function fetchCreditTransactions({ limit, offset } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (offset) params.set('offset', offset);
  const query = params.toString();
  return apiGet(`/credits/transactions${query ? `?${query}` : ''}`);
}
