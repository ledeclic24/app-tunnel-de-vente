import React from 'react';
import Card from './Card';

// Extrait de DashboardPage.jsx pour être réutilisable ailleurs
// (Analytique...) — même rendu qu'avant, juste factorisé.
export default function KpiCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-surface/40 mb-2">
        {Icon && <Icon className="w-4 h-4" />}
        <p className="text-[10px] uppercase tracking-wider font-mono">{label}</p>
      </div>
      <p className="text-2xl font-sans font-bold text-surface">{value}</p>
    </Card>
  );
}
