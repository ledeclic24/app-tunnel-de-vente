import React from 'react';
import { cx } from '../../lib/blockStyle';

// Extrait du switcher d'onglets d'OrganisationPage.jsx pour être
// réutilisable ailleurs — même rendu qu'avant, juste factorisé.
// `tabs`: [{ key, label, icon? }]
export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cx('inline-flex bg-surface/5 rounded-xl p-1 mb-8', className)}>
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
            active === key ? 'bg-background text-surface shadow-soft' : 'text-surface/50 hover:text-surface/80',
          )}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </button>
      ))}
    </div>
  );
}
