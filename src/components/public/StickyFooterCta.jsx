import React from 'react';
import { ArrowRight } from 'lucide-react';

// Pied de page collant (cahier des charges "tunnel standard") — fixe en
// bas de chaque page où il est activé. `offer` (voir resolveStickyFooterOffer)
// vient de l'offre déjà choisie explicitement par le créateur pour afficher
// le prix (priceBlockId/planIndex) — quand elle résout vers un lien de
// paiement valide, cliquer mène directement au paiement de CETTE offre au
// lieu de simplement naviguer. Sinon, cible : soit l'étape "page de
// commande" désignée une fois par le créateur (targetStepSlug), soit une
// URL externe, soit — à défaut de tout — l'étape suivante du tunnel (repli).
export default function StickyFooterCta({ config, offer, onOpenCheckout, onNavigateToStep, onAdvance, editMode }) {
  if (!config?.enabled) return null;

  // Une offre a été choisie (priceBlockId) mais son prix ne se résout plus
  // (bloc Tarifs supprimé ou modifié depuis) — le bouton reste fonctionnel
  // (repli sur targetStepSlug/étape suivante), mais côté CRÉATEUR seulement
  // (editMode) on signale clairement le problème plutôt que de laisser un
  // vide silencieux qui ressemble à un bug d'affichage.
  const brokenOffer = editMode && config.priceBlockId && !config.price;

  const handleClick = () => {
    if (offer) {
      if (offer.link.provider === 'moneroo') {
        onOpenCheckout?.(offer.blockId, offer.planIndex, offer.link, offer.plan.name);
        return;
      }
      if (offer.link.url) {
        window.open(offer.link.url, '_blank', 'noreferrer');
        return;
      }
    }
    if (config.externalUrl) {
      window.open(config.externalUrl, '_blank', 'noreferrer');
    } else if (config.targetStepSlug) {
      onNavigateToStep?.(config.targetStepSlug);
    } else {
      onAdvance?.();
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-surface/10 px-4 py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        {config.price && <p className="font-sans font-bold text-lg text-surface truncate">{config.price}</p>}
        {brokenOffer && (
          <p className="text-xs text-red-500 truncate">
            Offre introuvable — vérifie la sélection dans Réglages → Page
          </p>
        )}
      </div>
      <button
        onClick={handleClick}
        className="magnetic-btn shrink-0 inline-flex items-center gap-2 bg-accent text-background px-6 py-3 rounded-full text-sm font-semibold"
      >
        {config.buttonText || 'Commander'} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
