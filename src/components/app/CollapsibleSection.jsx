import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

// Repli générique "Options avancées" — même geste que les cases à cocher
// dépliantes de PageSettingsPanel, pour ne pas surcharger un panneau de
// réglages secondaires peu utilisés au quotidien. `defaultOpen` permet de
// garder replié seulement les tunnels qui n'ont encore rien configuré dedans.
export default function CollapsibleSection({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="pt-6 border-t border-surface/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-semibold text-surface/70 hover:text-surface transition-colors"
      >
        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
        {title}
      </button>
      {open && <div className="space-y-8 mt-5">{children}</div>}
    </div>
  );
}
