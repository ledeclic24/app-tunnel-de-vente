import React from 'react';

// État vide standard — remplace les traitements ad hoc (LeadsPage avait un
// bel état vide, EbooksPage n'avait qu'une ligne de texte flottante : même
// produit, deux traitements différents avant ce composant).
export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`text-center py-16 px-6 border border-dashed border-surface/20 rounded-[2rem] ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      )}
      {title && <p className="text-surface font-sans font-semibold mb-1">{title}</p>}
      {description && <p className="text-surface/60 text-sm max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
