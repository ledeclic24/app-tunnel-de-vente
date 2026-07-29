import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wallet, UserPlus, Mail, Layers, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { fetchAnalyticsData, bucketByDay } from '../../../lib/analyticsApi';
import { getLivePlans } from '../../../lib/plansApi';
import { PLANS } from '../../../lib/plans';
import Spinner from '../../../components/app/Spinner';

const RANGES = [
  { key: 7, label: '7 jours' },
  { key: 30, label: '30 jours' },
  { key: 90, label: '90 jours' },
];

// Sans point de comparaison, "3 nouveaux utilisateurs" ne dit pas si c'est
// bien ou mal — la tendance vs la période équivalente précédente donne au
// moins un sens de direction, même avec très peu de données.
function Delta({ current, previous }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  if (diff === 0) {
    return <span className="inline-flex items-center gap-0.5 text-xs text-zinc-500"><Minus className="w-3 h-3" /> stable</span>;
  }
  const up = diff > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {up ? '+' : ''}{diff} vs période précédente
    </span>
  );
}

function StatCard({ icon: Icon, label, value, total, delta }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-mono font-bold text-zinc-50">{value}</p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">{label}</p>
        {(total !== undefined || delta) && (
          <p className="text-xs text-zinc-600 mt-1">
            {total !== undefined && <span>{total} au total</span>}
            {total !== undefined && delta && ' · '}
            {delta}
          </p>
        )}
      </div>
    </div>
  );
}

// Combien d'utilisateurs sur chaque plan — la MRR seule (un chiffre agrégé)
// ne dit pas D'OÙ vient le revenu ni où concentrer les efforts de conversion
// (ex. beaucoup de Starter jamais convertis en payant).
function PlanBreakdown({ profiles, livePlans }) {
  const counts = useMemo(() => {
    const map = new Map();
    for (const p of profiles) {
      const key = p.plan || 'starter';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [profiles]);

  const planKeys = Object.keys(PLANS);
  const total = profiles.length || 1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-zinc-300 mb-1 uppercase tracking-wider">Répartition par plan</h2>
      <p className="text-xs text-zinc-600 mb-4">D'où vient (ou pourrait venir) la MRR — utile pour savoir qui relancer vers un plan payant.</p>
      <div className="space-y-3">
        {planKeys.map((key) => {
          const count = counts.get(key) || 0;
          const pct = (count / total) * 100;
          const plan = livePlans[key] || PLANS[key];
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">{plan?.name || key}</span>
                <span className="font-mono text-xs text-zinc-500">{count} utilisateur{count > 1 ? 's' : ''} · {plan?.price ? `${plan.price.toLocaleString('fr-FR')} FCFA/mois` : 'gratuit'}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chart({ title, data }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #27272a', background: '#18181b', fontSize: 13, color: '#f4f4f5' }} />
          <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [livePlans, setLivePlans] = useState(PLANS);
  const [range, setRange] = useState(30);

  useEffect(() => {
    fetchAnalyticsData().then(setData);
    getLivePlans().then(setLivePlans).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!data) return null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return {
      profiles: data.profiles.filter((p) => new Date(p.created_at) >= cutoff),
      funnels: data.funnels.filter((f) => new Date(f.created_at) >= cutoff),
      leads: data.leads.filter((l) => new Date(l.created_at) >= cutoff),
      planEvents: data.planEvents.filter((e) => new Date(e.changed_at) >= cutoff),
    };
  }, [data, range]);

  // Période précédente de même longueur (ex. jours -60 à -30 pour une
  // fenêtre de 30j) — seul moyen de savoir si "3 nouveaux utilisateurs" est
  // une accélération ou un ralentissement, un chiffre brut isolé ne le dit pas.
  const previous = useMemo(() => {
    if (!data) return null;
    const start = new Date();
    start.setDate(start.getDate() - range * 2);
    const end = new Date();
    end.setDate(end.getDate() - range);
    const inRange = (dateStr) => {
      const t = new Date(dateStr).getTime();
      return t >= start.getTime() && t < end.getTime();
    };
    return {
      profiles: data.profiles.filter((p) => inRange(p.created_at)).length,
      funnels: data.funnels.filter((f) => inRange(f.created_at)).length,
      leads: data.leads.filter((l) => inRange(l.created_at)).length,
    };
  }, [data, range]);

  if (!data || !filtered) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" tone="admin" />
      </div>
    );
  }

  const mrr = data.profiles.reduce((sum, p) => sum + (livePlans[p.plan || 'starter']?.price || 0), 0);
  const signupsChart = bucketByDay(filtered.profiles, 'created_at', range);
  const leadsChart = bucketByDay(filtered.leads, 'created_at', range);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${range === r.key ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Wallet} label="MRR actuelle" value={`${mrr.toLocaleString('fr-FR')} FCFA`} />
        <StatCard
          icon={UserPlus}
          label={`Nouveaux utilisateurs (${range}j)`}
          value={filtered.profiles.length}
          total={data.profiles.length}
          delta={<Delta current={filtered.profiles.length} previous={previous.profiles} />}
        />
        <StatCard
          icon={Layers}
          label={`Tunnels créés (${range}j)`}
          value={filtered.funnels.length}
          total={data.funnels.length}
          delta={<Delta current={filtered.funnels.length} previous={previous.funnels} />}
        />
        <StatCard
          icon={Mail}
          label={`Leads capturés (${range}j)`}
          value={filtered.leads.length}
          total={data.leads.length}
          delta={<Delta current={filtered.leads.length} previous={previous.leads} />}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <PlanBreakdown profiles={data.profiles} livePlans={livePlans} />
        <div className="grid grid-rows-2 gap-6">
          <Chart title="Nouveaux utilisateurs par jour" data={signupsChart} />
          <Chart title="Leads capturés par jour" data={leadsChart} />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Changements de plan récents</h2>
        {filtered.planEvents.length === 0 ? (
          <p className="text-sm text-zinc-600">Aucun changement de plan sur cette période.</p>
        ) : (
          <div className="space-y-2">
            {filtered.planEvents.slice(0, 15).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-zinc-800/60 last:border-0">
                <span className="text-zinc-500">{new Date(e.changed_at).toLocaleString('fr-FR')}</span>
                <span className="text-zinc-100 font-medium">{e.old_plan || '—'} → {e.new_plan}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
