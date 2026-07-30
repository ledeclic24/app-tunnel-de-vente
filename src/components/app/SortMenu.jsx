import React, { useRef, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useClickOutside } from '../../lib/useClickOutside';
import { useAnchoredPosition } from '../../lib/useAnchoredPosition';

const PANEL_WIDTH = 240;

const TONE_CLASSES = {
  default: {
    button: 'bg-surface/5 border-surface/10 text-surface/70',
    menu: 'bg-background border-surface/10',
    item: 'text-surface/80 hover:bg-surface/5',
    itemActive: 'text-accent bg-accent/10',
  },
  admin: {
    button: 'bg-accent/10 border-background/10 text-background/70',
    menu: 'bg-admin-card border-background/10',
    item: 'text-background/80 hover:bg-accent/10',
    itemActive: 'text-accent bg-accent/15',
  },
};

// Menu de tri générique — bouton + liste déroulante, même schéma que le
// bouton "Réglages" de FunnelEditorPage.jsx (pas de nouvelle dépendance,
// pas de nouveau pattern d'interaction à apprendre). Le tri lui-même se
// fait côté appelant (liste déjà entièrement chargée en mémoire) : ce
// composant ne fait que piloter le choix. `tone="admin"` reprend la même
// palette dark premium que le reste du panneau admin (voir AdminShell.jsx).
export default function SortMenu({ value, onChange, options, tone = 'default' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside(open, () => setOpen(false));
  const triggerRef = useRef(null);
  const pos = useAnchoredPosition(open, triggerRef, PANEL_WIDTH);
  const current = options.find((o) => o.value === value) || options[0];
  const t = TONE_CLASSES[tone] || TONE_CLASSES.default;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${t.button}`}
      >
        <ArrowUpDown className="w-3.5 h-3.5 shrink-0" /> {current?.label}
      </button>
      {open && pos && (
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: PANEL_WIDTH, maxHeight: pos.maxHeight }}
          className={`dropdown-panel z-30 border rounded-2xl shadow-xl p-1.5 overflow-y-auto ${t.menu}`}
        >
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
