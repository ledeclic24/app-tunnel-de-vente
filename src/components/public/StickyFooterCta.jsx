import React from 'react';
import { ArrowRight } from 'lucide-react';

// Pied de page collant (cahier des charges "tunnel standard") — fixe en
// bas de chaque page où il est activé. Cible : soit l'étape "page de
// commande" désignée une fois par le créateur (targetStepSlug), soit une
// URL externe, soit — à défaut des deux — l'étape suivante du tunnel
// (repli, décision actée).
export default function StickyFooterCta({ config, onNavigateToStep, onAdvance }) {
  if (!config?.enabled) return null;

  const handleClick = () => {
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
