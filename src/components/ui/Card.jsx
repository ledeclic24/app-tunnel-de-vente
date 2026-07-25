import React from 'react';

// Carte standard du design system — remplace le pattern `bg-background
// border border-surface/10 rounded-2xl` recopié à la main dans ~15 pages.
// `interactive` ajoute l'effet de survol (utilisé pour les cartes cliquables,
// jamais pour un simple conteneur de section).
export default function Card({ children, interactive = false, className = '', ...props }) {
  return (
    <div
      className={`bg-background border border-surface/10 rounded-2xl shadow-soft ${
        interactive ? 'hover-card cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
