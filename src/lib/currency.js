import { parsePriceAmount } from './checkoutApi';

// Devises supportées pour la devise de compte d'un vendeur (User.currency
// côté backend) — mêmes codes déjà proposés pour les moyens de paiement
// Moneroo (voir OrganisationPage.jsx, qui réutilise désormais cette liste
// au lieu de la dupliquer).
export const CURRENCY_OPTIONS = [
  { code: 'XOF', label: 'XOF (Franc CFA)' },
  { code: 'USD', label: 'USD (Dollar)' },
  { code: 'EUR', label: 'EUR (Euro)' },
  { code: 'GHS', label: 'GHS (Cedi ghanéen)' },
  { code: 'NGN', label: 'NGN (Naira)' },
];

// Formate un montant numérique avec la devise du compte ("29 000 F CFA") —
// à utiliser partout où un prix est AFFICHÉ (jamais dans les champs de
// saisie, qui restent du texte libre pour ne pas casser l'édition
// contenteditable existante). GHS/NGN retombent sur leur code ISO plutôt
// que sur des glyphes (₵/₦) peu connus des utilisateurs francophones —
// comportement par défaut de currencyDisplay: 'symbol' avec ces codes.
export function formatPrice(amount, currency) {
  if (!Number.isFinite(amount)) return '';
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XOF',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

// Résout le prix affiché par le pied de page collant à partir de l'offre
// qu'il référence (priceBlockId + planIndex, même pattern que les liens de
// paiement Moneroo) — utilisé à la fois dans l'aperçu éditeur
// (FunnelEditorPage.jsx, à partir de blocksByStepId) et sur la page
// publique (PublishedFunnelPage.jsx, à partir du snapshot). `allBlocks`
// est une liste PLATE de blocs {id, type, content, ...}, peu importe leur
// page d'origine puisque blockId est unique dans tout le tunnel. Ne
// retourne jamais rien si l'offre référencée a été supprimée entre-temps
// (même tolérance de panne que les liens de paiement Moneroo orphelins).
export function resolveStickyFooterPrice(stickyFooterCta, allBlocks, currency) {
  if (!stickyFooterCta?.priceBlockId) return '';
  const block = (allBlocks || []).find(
    (b) => b.id === stickyFooterCta.priceBlockId && b.type === 'pricing',
  );
  const plan = block?.content?.plans?.[stickyFooterCta.planIndex];
  if (!plan) return '';
  return formatPrice(parsePriceAmount(plan.price), currency);
}
