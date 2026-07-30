import React from 'react';

const SIZE_CLASSES = {
  sm: 'w-5 h-5 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
};

const TONE_CLASSES = {
  default: 'border-surface/20 border-t-accent',
  admin: 'border-background/20 border-t-accent',
};

// Indicateur de chargement animé unique, réutilisé partout au lieu d'un
// <div animate-spin> recopié à la main dans chaque page (~29 occurrences
// avant ce composant). Ne s'affiche que pendant la durée réelle d'un
// chargement — aucun délai artificiel n'est ajouté ici ni par les pages
// qui l'utilisent.
export default function Spinner({ size = 'md', tone = 'default', className = '' }) {
  return (
    <div
      className={`${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${TONE_CLASSES[tone] || TONE_CLASSES.default} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}

// Variante centrée pleine page/section — remplace le pattern répété
// `<div className="flex justify-center py-N"><div .../></div>`.
export function CenteredSpinner({ size = 'md', tone = 'default', className = '', wrapperClassName = 'flex justify-center py-16' }) {
  return (
    <div className={wrapperClassName}>
      <Spinner size={size} tone={tone} className={className} />
    </div>
  );
}
