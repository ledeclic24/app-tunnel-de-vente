import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { CHANGELOG } from '../../lib/changelog';

// Même schéma de persistance que OnboardingChecklist (DashboardPage.jsx) :
// une clé localStorage par vendeur, comparée ici à l'id de la DERNIÈRE
// entrée du changelog (pas un simple booléen) — une nouvelle entrée fait
// automatiquement réapparaître la bannière, sans rien à réinitialiser côté
// code au prochain changement notable.
export default function NouveautesBanner({ profileId }) {
  const latest = CHANGELOG[0];
  const dismissedKey = profileId ? `vendeko_changelog_seen_${profileId}` : null;
  const [dismissed, setDismissed] = useState(() => {
    if (!dismissedKey) return false;
    try {
      return window.localStorage.getItem(dismissedKey) === latest.id;
    } catch {
      return false;
    }
  });

  if (!latest || dismissed) return null;

  const handleDismiss = () => {
    if (dismissedKey) {
      try {
        window.localStorage.setItem(dismissedKey, latest.id);
      } catch {
        // stockage indisponible, tant pis pour la persistance
      }
    }
    setDismissed(true);
  };

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-[2rem] p-5 mb-8">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-surface text-sm mb-2">Nouveautés</p>
          <ul className="space-y-1.5">
            {latest.items.map((item) => (
              <li key={item} className="text-sm text-surface/70 flex gap-2">
                <span className="text-accent shrink-0">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-surface/40 hover:text-surface shrink-0"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
