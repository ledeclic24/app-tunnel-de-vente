import { useLayoutEffect, useState } from 'react';

// Calcule la position d'un panneau déroulant en coordonnées d'ÉCRAN
// (position: fixed), à partir du bouton qui le déclenche — recalculée à
// chaque ouverture. Un simple `absolute right-0` (ancien comportement)
// aligne le bord droit du panneau sur celui du bouton et garde une largeur
// fixe : dès que le bouton est proche du bord GAUCHE de l'écran (cas
// courant sur mobile, dans une rangée de plusieurs filtres), le panneau
// déborde hors de l'écran — invisible et inutilisable, pas juste inélégant.
// Ici la position (largeur ET hauteur) est bornée pour toujours rester
// entièrement visible : s'ouvre au-dessus du bouton plutôt qu'en dessous
// quand la place manque en bas (ex. filtre situé dans la moitié basse d'un
// écran de téléphone), avec une hauteur maximale calculée dynamiquement
// plutôt qu'un plafond fixe qui déborderait quand même parfois.
export function useAnchoredPosition(open, triggerRef, panelWidth) {
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const margin = 8;
    const gap = 6;
    const maxLeft = window.innerWidth - panelWidth - margin;
    const left = Math.max(margin, Math.min(rect.right - panelWidth, maxLeft));

    const spaceBelow = window.innerHeight - rect.bottom - margin - gap;
    const spaceAbove = rect.top - margin - gap;
    let top;
    let maxHeight;
    if (spaceBelow >= 150 || spaceBelow >= spaceAbove) {
      top = rect.bottom + gap;
      maxHeight = Math.max(100, spaceBelow);
    } else {
      maxHeight = Math.max(100, spaceAbove);
      top = Math.max(margin, rect.top - gap - maxHeight);
    }
    setPos({ top, left, maxHeight: Math.min(maxHeight, 480) });
  }, [open, triggerRef, panelWidth]);

  return pos;
}
