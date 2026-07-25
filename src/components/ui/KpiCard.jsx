import React from 'react';

// Chaque KPI a sa propre teinte (toujours les couleurs de marque existantes,
// juste à faible opacité) plutôt qu'un fond uniforme pour tous — permet de
// les distinguer d'un coup d'œil et de rythmer la rangée. Extrait de
// DashboardPage.jsx pour être réutilisable (ex. AnalyticsPage).
const TINTS = {
  accent: { bg: 'bg-accent/5', border: 'border-accent/15', icon: 'text-accent' },
  primary: { bg: 'bg-primary/5', border: 'border-primary/15', icon: 'text-primary' },
  surface: { bg: 'bg-surface/5', border: 'border-surface/10', icon: 'text-surface/50' },
};

export default function KpiCard({ icon: Icon, label, value, tint = 'surface' }) {
  const t = TINTS[tint];
  return (
    <div className={`${t.bg} border ${t.border} rounded-xl p-4`}>
      <div className={`flex items-center gap-2 ${t.icon} mb-2`}>
        <Icon className="w-4 h-4" />
        <p className="text-[10px] uppercase tracking-wider font-mono">{label}</p>
      </div>
      <p className="text-2xl font-sans font-bold text-surface">{value}</p>
    </div>
  );
}
