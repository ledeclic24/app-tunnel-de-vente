import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Gift, Rocket, Crown, Layers } from 'lucide-react';
import { PLANS } from '../../../lib/plans';

export const PLAN_KEYS = ['starter', 'createur', 'entreprise'];
// Le plan gratuit doit rester lisible sur les fonds sombres des cartes
// admin — un blanc translucide (cohérent avec le reste de la palette
// "neutre") s'y fond quasiment jusqu'à disparaître visuellement.
export const PLAN_COLORS = {
  starter: 'rgb(148,163,184)',
  createur: 'rgb(34,197,94)',
  entreprise: 'rgb(251,191,36)',
};
export const PLAN_ICONS = { starter: Gift, createur: Rocket, entreprise: Crown };

const TOOLTIP_STYLE = { borderRadius: 12, border: '1px solid rgba(246,249,247,0.15)', background: 'rgb(11,40,24)', fontSize: 13, color: 'rgb(246,249,247)' };

// Donut plutôt que barres horizontales pour la répartition par plan — même
// information (compte + %), présentation plus dense et plus lisible d'un
// coup d'œil, avec le total rappelé au centre. Partagé entre la Vue
// d'ensemble et Analytique pour que les deux pages admin restent cohérentes.
export default function PlanDonut({ profiles, livePlans = PLANS, title = 'Répartition par plan', subtitle = "D'où vient (ou pourrait venir) la MRR — tous les utilisateurs, plan gratuit inclus." }) {
  const data = useMemo(() => {
    const counts = new Map();
    for (const p of profiles) {
      const key = p.plan || 'starter';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return PLAN_KEYS.map((key) => ({
      key,
      name: (livePlans[key] || PLANS[key])?.name || key,
      value: counts.get(key) || 0,
    }));
  }, [profiles, livePlans]);

  const total = profiles.length || 1;

  return (
    <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-background mb-1 uppercase tracking-wider">{title}</h2>
      {subtitle && <p className="text-xs text-background/55 mb-4">{subtitle}</p>}
      <div className="flex items-center gap-6">
        <div className="w-[130px] h-[130px] shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={3} strokeWidth={0}>
                {data.map((d) => <Cell key={d.key} fill={PLAN_COLORS[d.key]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-mono font-bold text-background">{total}</span>
            <span className="text-[10px] text-background/55 uppercase tracking-wide">total</span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5 min-w-0">
          {data.map((d) => {
            const Icon = PLAN_ICONS[d.key] || Layers;
            const pct = Math.round((d.value / total) * 100);
            const plan = livePlans[d.key] || PLANS[d.key];
            return (
              <div key={d.key} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PLAN_COLORS[d.key] }} />
                <Icon className="w-3.5 h-3.5 text-background/55 shrink-0" />
                <span className="text-background/85 truncate flex-1">{d.name}</span>
                <span className="font-mono text-xs text-background/65 shrink-0">{d.value} · {pct}% · {plan?.price ? `${plan.price.toLocaleString('fr-FR')} FCFA` : 'gratuit'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
