import React from 'react';
import { cx } from '../../lib/blockStyle';

// En-tête de page partagé (titre + description + actions à droite) —
// standardise un pattern déjà présent sur presque toutes les pages du
// back-office mais jamais factorisé, avec des variations mineures.
export default function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cx('flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8', className)}>
      <div>
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-sans font-bold text-surface">{title}</h1>
        {description && <p className="text-surface/60 text-sm mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
