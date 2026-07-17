import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../lib/blockStyle';

// Tiroir latéral droit partagé — remplace les panneaux qui s'inséraient
// dans le flux du document (poussant tout le contenu vers le bas) dans
// l'éditeur de tunnel. Toujours monté (pour l'animation de sortie), piloté
// par `open`.
export default function Drawer({ open, onClose, title, icon: Icon, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cx(
          'fixed inset-0 bg-primary/30 backdrop-blur-[2px] z-40 transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <div
        className={cx(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background shadow-medium z-50 flex flex-col transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface/10 shrink-0">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-accent" />}
            <h2 className="font-sans font-semibold text-surface text-sm">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-surface/40 hover:text-surface hover:bg-surface/5" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
