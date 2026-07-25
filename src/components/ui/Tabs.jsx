import React from 'react';

// Switcher d'onglets — extrait du pattern d'OrganisationPage.jsx pour être
// réutilisable ailleurs. `tabs` : [{ key, label, icon? }]. Contrôlé par le
// parent (value/onChange), pas d'état interne.
export default function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex bg-surface/5 rounded-xl p-1 ${className}`}>
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            value === key ? 'bg-background text-surface shadow-sm' : 'text-surface/50 hover:text-surface/80'
          }`}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </button>
      ))}
    </div>
  );
}
