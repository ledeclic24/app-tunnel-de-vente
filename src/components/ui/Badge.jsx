import React from 'react';
import { cx } from '../../lib/blockStyle';

const VARIANTS = {
  neutral: 'bg-surface/10 text-surface/50',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-green-500/10 text-green-600',
  warning: 'bg-amber-500/10 text-amber-600',
};

// Pastille de statut partagée (brouillon/publié, "Bientôt", plan
// requis...) — remplace les badges stylés à la main à chaque emplacement.
export default function Badge({ variant = 'neutral', className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
