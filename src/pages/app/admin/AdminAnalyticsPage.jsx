import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wallet, UserPlus, Mail, Layers } from 'lucide-react';
import { fetchAnalyticsData, bucketByDay } from '../../../lib/analyticsApi';
import { getLivePlans } from '../../../lib/plansApi';
import { PLANS } from '../../../lib/plans';

const RANGES = [
  { key: 7, label: '7 jours' },
  { key: 30, label: '30 jours' },
  { key: 90, label: '90 jours' },
];

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <div>
        <p className="text-2xl font-mono font-bold text-zinc-50">{value}</p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">{label}</p>
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

  if (!data || !filtered) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin" />
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
        <StatCard icon={UserPlus} label={`Nouveaux utilisateurs (${range}j)`} value={filtered.profiles.length} />
        <StatCard icon={Layers} label={`Tunnels créés (${range}j)`} value={filtered.funnels.length} />
        <StatCard icon={Mail} label={`Leads capturés (${range}j)`} value={filtered.leads.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Chart title="Nouveaux utilisateurs par jour" data={signupsChart} />
        <Chart title="Leads capturés par jour" data={leadsChart} />
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
