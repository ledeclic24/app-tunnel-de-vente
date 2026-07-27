import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { getExitIntentState, markExitIntentShown } from '../../lib/exitIntentDiscount';

// Capture à l'intention de sortie — se déclenche quand le curseur quitte la
// fenêtre par le haut (mouseleave avec clientY <= 0), le seul signal fiable
// d'intention de sortie côté desktop. Uniquement sur pointeur fin (souris) :
// l'événement n'a pas d'équivalent fiable au toucher, donc désactivé sur
// mobile plutôt que de se déclencher de façon erratique. Ne se montre
// qu'une fois par visiteur — mémorisé dans localStorage (funnelId), donc
// ça survit un rechargement de page ou un retour ultérieur, pas seulement
// la session React en cours. La réduction éventuelle (config.
// discountPercent) est verrouillée au même moment, pour la même raison :
// jamais réappliquée à une nouvelle tentative de sortie.
export default function ExitIntentPopup({ config, funnelId, stepId, onNavigateToStep, onAdvance, onDiscountApplied }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!config?.enabled) return undefined;
    if (getExitIntentState(funnelId)?.shown) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const handleMouseLeave = (e) => {
      if (e.clientY > 0) return;
      markExitIntentShown(funnelId, {
        discountStepId: config.discountPercent ? stepId : null,
        discountPercent: config.discountPercent || null,
      });
      onDiscountApplied?.();
      setVisible(true);
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [config?.enabled, config?.discountPercent, funnelId, stepId, onDiscountApplied]);

  if (!config?.enabled || !visible) return null;

  const handleClick = () => {
    setVisible(false);
    if (config.externalUrl) {
      window.open(config.externalUrl, '_blank', 'noreferrer');
    } else if (config.targetStepSlug) {
      onNavigateToStep?.(config.targetStepSlug);
    } else {
      onAdvance?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-primary/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setVisible(false)}
    >
      <div className="bg-background rounded-[2rem] shadow-2xl max-w-md w-full p-6 md:p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setVisible(false)} className="absolute top-4 right-4 text-surface/40 hover:text-surface" aria-label="Fermer">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-xl font-sans font-bold text-surface mb-2 pr-6">{config.heading || "Attends, une dernière chose..."}</h3>
        {config.description && <p className="text-sm text-surface/60 mb-6">{config.description}</p>}
        <button
          onClick={handleClick}
          className="magnetic-btn w-full inline-flex items-center justify-center gap-2 bg-accent text-background px-6 py-3 rounded-full text-sm font-semibold"
        >
          {config.buttonText || "J'en profite"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
