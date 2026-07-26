import React from 'react';

// Bannière en tête de page — icône, titre, description sur fond dégradé
// sombre (voir .gradient-banner dans index.css). Remplace le simple
// <h1> texte utilisé jusque-là sur chaque page du back-office.
export default function GradientBanner({ icon: Icon, title, description, actions, className = '' }) {
  return (
    <div className={`gradient-banner rounded-[2rem] p-6 md:p-8 mb-8 text-background ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="shrink-0 w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-background" />
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-sans font-bold text-background">{title}</h1>
            {description && <p className="text-background/60 text-sm mt-1">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
