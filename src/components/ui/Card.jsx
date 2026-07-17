import React from 'react';
import { cx } from '../../lib/blockStyle';

// Surface de base réutilisée par toutes les pages du back-office —
// remplace le pattern "bg-background border border-surface/10
// rounded-2rem" recopié à la main dans ~15 fichiers. `interactive`
// ajoute le lift + l'ombre au survol (cartes cliquables : tunnel,
// ebook...) ; les cartes de section statiques n'en ont pas besoin.
export default function Card({ as: Tag = 'div', interactive = false, className, children, ...props }) {
  return (
    <Tag
      className={cx(
        'bg-background border border-surface/10 rounded-2xl shadow-soft',
        interactive && 'hover-card cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
