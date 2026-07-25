import React from 'react';

const VARIANTS = {
  neutral: 'bg-surface/10 text-surface/60',
  success: 'bg-accent/10 text-accent',
  warning: 'bg-amber-500/10 text-amber-600',
};

// Pastille de statut — remplace les badges "BROUILLON"/"BIENTÔT" stylés à la
// main à chaque emplacement (Dashboard, nav, etc.).
export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
