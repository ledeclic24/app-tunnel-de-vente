import { apiPost } from './apiClient';

// Facturation de l'abonnement Vendeko lui-même (Pro/Entreprise), via le
// backend NestJS — distinct de checkoutApi.js, qui gère le paiement des
// tunnels (chaque vendeur avec son propre compte Moneroo).
export async function createPayment(planKey) {
  const { checkoutUrl } = await apiPost('/subscriptions/moneroo/checkout', { planKey });
  return checkoutUrl;
}
