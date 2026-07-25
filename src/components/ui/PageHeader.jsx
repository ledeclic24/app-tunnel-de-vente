import React from 'react';

// En-tête de page standard (titre + description + actions à droite) —
// standardise un pattern déjà présent partout mais jamais factorisé.
export default function PageHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-2xl font-sans font-bold text-surface">{title}</h1>
        {description && <p className="text-surface/60 text-sm mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
