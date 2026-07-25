import { apiPost } from './apiClient';

// Facturation de l'abonnement TonTunnel lui-même (Pro/Entreprise), via le
// backend NestJS — distinct de checkoutApi.js, qui gère le paiement des
// tunnels (chaque vendeur avec son propre compte Moneroo).
export async function createPayment(planKey) {
  // BillingPage détecte le retour de paiement via ?payment=retour (voir son
  // useEffect) — Moneroo ajoute paymentId/paymentStatus par-dessus cette URL.
  const returnUrl = `${window.location.origin}/app/billing?payment=retour`;
  const { checkoutUrl } = await apiPost('/subscriptions/moneroo/checkout', {
    planKey,
    returnUrl,
  });
  return checkoutUrl;
}
