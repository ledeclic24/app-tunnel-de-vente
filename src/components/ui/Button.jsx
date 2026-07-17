import React from 'react';
import { cx } from '../../lib/blockStyle';

const VARIANTS = {
  primary: 'bg-accent text-background hover:bg-accent/90',
  dark: 'bg-primary text-background hover:bg-primary/90',
  secondary: 'bg-transparent border border-surface/15 text-surface hover:border-accent hover:text-accent',
  ghost: 'bg-transparent text-surface/70 hover:text-surface hover:bg-surface/5',
  danger: 'bg-transparent border border-surface/15 text-surface/50 hover:text-red-500 hover:border-red-500/30',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-3 text-sm gap-2 rounded-xl',
};

// Bouton partagé de tout le back-office. Polymorphe via `as` (Link de
// react-router-dom, "a", ou "button" par défaut) pour couvrir aussi bien
// les actions que la navigation, sans dupliquer les classes à chaque
// emplacement.
export default function Button({
  as: Tag = 'button', variant = 'secondary', size = 'md', className, children, ...props
}) {
  return (
    <Tag
      className={cx(
        'magnetic-btn inline-flex items-center justify-center font-semibold whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none transition-colors',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
