import React from 'react';
import { Loader2 } from 'lucide-react';
import { parsePriceAmount } from '../../lib/checkoutApi';
import { formatPrice } from '../../lib/currency';

// Mini-formulaire nom + email affiché avant la redirection vers Moneroo —
// requis par leur API pour initialiser une transaction (voir
// PaymentsService côté backend), impossible de rediriger sans ces infos.
// Rendu une seule fois au niveau de la page publiée (voir
// PublishedFunnelPage.jsx) : n'importe quel bouton d'action (bloc Tarifs,
// Hero, CTA, pied de page collant) peut ouvrir cette même modale pour la
// même offre, via onOpenCheckout — jamais une instance par bloc.
// L'order bump (offre complémentaire optionnelle, jamais cochée par
// défaut) s'affiche ici, juste avant la redirection : c'est le seul moment
// où l'acheteur est déjà engagé dans l'achat sans avoir encore payé.
export default function CheckoutModal({ planName, orderBump, currency, initialName, initialEmail, onClose, onSubmit }) {
  // Pré-rempli quand ces infos sont déjà connues (ex. offre upsell juste
  // après un premier achat, voir checkoutPrefill/getCheckoutCustomer) —
  // jamais autre chose qu'un confort, le visiteur reste libre de modifier.
  const [name, setName] = React.useState(initialName || '');
  const [email, setEmail] = React.useState(initialEmail || '');
  const [bumpChecked, setBumpChecked] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const bumpAmount = orderBump?.enabled ? parsePriceAmount(orderBump.price) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ name, email, orderBumpTaken: bumpChecked, orderBumpAmount: bumpChecked ? bumpAmount : undefined });
    } catch {
      setError('Impossible de lancer le paiement pour le moment. Réessaie dans un instant.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-background text-surface rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-sans font-bold text-lg mb-1">{planName}</h3>
        <p className="text-sm text-surface/60 mb-4">Renseigne tes informations pour continuer vers le paiement sécurisé.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom"
            required
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          {orderBump?.enabled && (
            <label className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bumpChecked}
                onChange={(e) => setBumpChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-accent shrink-0"
              />
              <span className="text-sm">
                <span className="font-semibold block">{orderBump.heading || 'Ajouter une offre complémentaire'}</span>
                {orderBump.description && <span className="block text-surface/60 text-xs mt-0.5">{orderBump.description}</span>}
                <span className="block text-accent font-semibold mt-1">+ {formatPrice(parsePriceAmount(orderBump.price), currency)}</span>
              </span>
            </label>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="magnetic-btn btn-brand w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Redirection...' : 'Continuer vers le paiement'}
          </button>
        </form>
      </div>
    </div>
  );
}
