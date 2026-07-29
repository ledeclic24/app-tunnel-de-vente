import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useClickOutside } from '../../lib/useClickOutside';

const TONE_CLASSES = {
  default: {
    button: 'bg-surface/5 border-surface/10 text-surface/70',
    menu: 'bg-background border-surface/10',
    item: 'text-surface/80 hover:bg-surface/5',
    itemActive: 'text-accent bg-accent/10',
  },
  admin: {
    button: 'bg-zinc-900 border-zinc-800 text-zinc-300',
    menu: 'bg-zinc-900 border-zinc-800',
    item: 'text-zinc-300 hover:bg-zinc-800',
    itemActive: 'text-emerald-400 bg-emerald-500/10',
  },
};

// Menu de tri générique — bouton + liste déroulante, même schéma que le
// bouton "Réglages" de FunnelEditorPage.jsx (pas de nouvelle dépendance,
// pas de nouveau pattern d'interaction à apprendre). Le tri lui-même se
// fait côté appelant (liste déjà entièrement chargée en mémoire) : ce
// composant ne fait que piloter le choix. `tone="admin"` reprend la
// palette zinc/emerald déjà utilisée par les pages admin (voir Spinner.jsx
// pour le même principe).
export default function SortMenu({ value, onChange, options, tone = 'default' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside(open, () => setOpen(false));
  const current = options.find((o) => o.value === value) || options[0];
  const t = TONE_CLASSES[tone] || TONE_CLASSES.default;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${t.button}`}
      >
        <ArrowUpDown className="w-3.5 h-3.5 shrink-0" /> {current?.label}
      </button>
      {open && (
        <div className={`absolute z-30 mt-2 right-0 w-60 border rounded-2xl shadow-xl p-1.5 ${t.menu}`}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${o.value === value ? t.itemActive : t.item}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
