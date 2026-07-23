import { apiPost } from './apiClient';

// Distinct de paymentsApi.js (facturation de l'abonnement Vendeko lui-même,
// encore sur Supabase) : ceci concerne le paiement d'un client sur un
// tunnel de vente, via le backend NestJS.
export async function createMonerooCheckout(payload) {
  return apiPost('/payments/moneroo/checkout', payload);
}

// Nettoie un texte de prix ("17 900", "9,99", "€9.99") en nombre exploitable
// par l'API de paiement — ne garde qu'un éventuel séparateur décimal final
// (. ou , suivi d'exactement 1 ou 2 chiffres), tout le reste (espaces,
// devises, séparateurs de milliers) est retiré.
export function parsePriceAmount(price) {
  const raw = String(price ?? '').trim();
  const decimalMatch = raw.match(/[.,](\d{1,2})$/);
  if (decimalMatch) {
    const wholePart = raw.slice(0, raw.length - decimalMatch[0].length).replace(/[^\d]/g, '');
    return Number(`${wholePart}.${decimalMatch[1]}`);
  }
  return Number(raw.replace(/[^\d]/g, ''));
}
