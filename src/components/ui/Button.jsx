import React from 'react';

const VARIANTS = {
  primary: 'bg-accent text-background hover:bg-accent/90',
  secondary: 'bg-transparent border border-surface/15 text-surface hover:border-surface/30 hover:bg-surface/5',
  ghost: 'bg-transparent text-surface/70 hover:text-surface hover:bg-surface/5',
  danger: 'bg-transparent text-red-500 hover:bg-red-500/10',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
};

// Bouton standard du design system — encapsule `magnetic-btn` (déjà défini
// dans index.css) pour ne pas avoir à le recopier à chaque emplacement.
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`magnetic-btn inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
