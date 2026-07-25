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
