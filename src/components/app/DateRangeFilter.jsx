import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useClickOutside } from '../../lib/useClickOutside';

export const DATE_PRESETS = [
  { key: 'all', label: 'Toute la période' },
  { key: 'today', label: "Aujourd'hui" },
  { key: 'yesterday', label: 'Hier' },
  { key: 'last7', label: '7 derniers jours' },
  { key: 'month', label: 'Ce mois' },
  { key: 'custom', label: 'Période personnalisée' },
];

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }

// Traduit un préréglage (+ dates personnalisées le cas échéant) en bornes
// {start, end} réellement comparables — aucune borne (null) signifie
// "pas de limite de ce côté", pas "aujourd'hui" par défaut.
export function resolveDateRange(preset, customStart, customEnd) {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'last7': {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { start: startOfDay(from), end: endOfDay(now) };
    }
    case 'month':
      return { start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), end: endOfDay(now) };
    case 'custom':
      return {
        start: customStart ? startOfDay(new Date(customStart)) : null,
        end: customEnd ? endOfDay(new Date(customEnd)) : null,
      };
    default:
      return { start: null, end: null };
  }
}

// Filtre générique côté client, réutilisé par chaque page : la liste est
// déjà entièrement chargée en mémoire, pas besoin d'aller-retour serveur
// pour une simple restriction de période.
export function filterByDateRange(list, dateField, range) {
  if (!range.start && !range.end) return list;
  return list.filter((item) => {
    const t = new Date(item[dateField]).getTime();
    if (range.start && t < range.start.getTime()) return false;
    if (range.end && t > range.end.getTime()) return false;
    return true;
  });
}

const TONE_CLASSES = {
  default: {
    button: 'bg-surface/5 border-surface/10 text-surface/70',
    menu: 'bg-background border-surface/10',
    item: 'text-surface/80 hover:bg-surface/5',
    itemActive: 'text-accent bg-accent/10',
    input: 'bg-primary/5 border-surface/10 text-surface focus:border-accent',
  },
  admin: {
    button: 'bg-zinc-900 border-zinc-800 text-zinc-300',
    menu: 'bg-zinc-900 border-zinc-800',
    item: 'text-zinc-300 hover:bg-zinc-800',
    itemActive: 'text-emerald-400 bg-emerald-500/10',
    input: 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-emerald-500',
  },
};

// Bouton + menu déroulant (même schéma que SortMenu.jsx) proposant des
// périodes prédéfinies, plus une plage personnalisée via deux sélecteurs
// de date natifs du navigateur (aucune dépendance calendrier à ajouter).
export default function DateRangeFilter({ preset, onPresetChange, customStart, customEnd, onCustomChange, tone = 'default' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside(open, () => setOpen(false));
  const current = DATE_PRESETS.find((p) => p.key === preset) || DATE_PRESETS[0];
  const t = TONE_CLASSES[tone] || TONE_CLASSES.default;
  const label = preset === 'custom' && customStart && customEnd
    ? `${new Date(customStart).toLocaleDateString('fr-FR')} → ${new Date(customEnd).toLocaleDateString('fr-FR')}`
    : current.label;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${t.button}`}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" /> {label}
      </button>
      {open && (
        <div className={`absolute z-30 mt-2 right-0 w-64 border rounded-2xl shadow-xl p-1.5 ${t.menu}`}>
          {DATE_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => { onPresetChange(p.key); if (p.key !== 'custom') setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${p.key === preset ? t.itemActive : t.item}`}
            >
              {p.label}
            </button>
          ))}
          {preset === 'custom' && (
            <div className="p-2 space-y-2 border-t border-surface/10 mt-1 pt-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1">Du</label>
                <input
                  type="date"
                  value={customStart || ''}
                  onChange={(e) => onCustomChange(e.target.value, customEnd)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${t.input}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1">Au</label>
                <input
                  type="date"
                  value={customEnd || ''}
                  onChange={(e) => onCustomChange(customStart, e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${t.input}`}
                />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={!customStart || !customEnd}
                className="w-full text-center px-3 py-2 rounded-lg text-sm font-semibold bg-accent text-background disabled:opacity-40"
              >
                Appliquer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
