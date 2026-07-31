import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AreaChart, Area, ComposedChart, Line, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Wallet, UserPlus, Mail, Layers, ArrowUp, ArrowDown, Minus, Eye, Users } from 'lucide-react';
import { fetchAnalyticsData, bucketByDay, bucketByDayMultiSeries, bucketUniqueByDay } from '../../../lib/analyticsApi';
import { getLivePlans } from '../../../lib/plansApi';
import { PLANS } from '../../../lib/plans';
import Spinner from '../../../components/app/Spinner';
import PlanDonut, { PLAN_KEYS, PLAN_COLORS, PLAN_ICONS } from '../../../components/app/admin/PlanDonut';

const RANGES = [
  { key: 7, label: '7 jours' },
  { key: 30, label: '30 jours' },
  { key: 90, label: '90 jours' },
];

const TOOLTIP_STYLE = { borderRadius: 12, border: '1px solid rgba(246,249,247,0.15)', background: 'rgb(11,40,24)', fontSize: 13, color: 'rgb(246,249,247)' };
// 0.4 d'opacité se fondait dans le fond animé des cartes admin (dégradé
// vert profond → vert accent) au point d'être signalé illisible — 0.6 reste
// discret mais garde un contraste correct sur tout le cycle du dégradé.
const AXIS_TICK = { fontSize: 11, fill: 'rgba(246,249,247,0.6)' };

// Sans point de comparaison, "3 nouveaux utilisateurs" ne dit pas si c'est
// bien ou mal — la tendance vs la période équivalente précédente donne au
// moins un sens de direction, même avec très peu de données.
function Delta({ current, previous }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  if (diff === 0) {
    return <span className="inline-flex items-center gap-0.5 text-xs text-background/55"><Minus className="w-3 h-3" /> stable</span>;
  }
  const up = diff > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${up ? 'text-accent' : 'text-red-400'}`}>
      {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {up ? '+' : ''}{diff} vs période précédente
    </span>
  );
}

// Anime un nombre affiché vers sa nouvelle valeur au lieu de le faire sauter
// d'un coup — c'est ce qui donne au tableau de bord une sensation "vivante"
// à chaque changement de plage ou rechargement des données.
function useCountUp(value, duration = 700) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = typeof value === 'number' && Number.isFinite(value) ? value : 0;
    if (from === to) {
      setDisplay(to);
      return undefined;
    }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

function Sparkline({ data, color, id }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="w-16 h-8 shrink-0 hidden sm:block">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.55} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="count" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, formatValue, total, delta, note, spark, sparkId, sparkColor = 'rgb(34,197,94)', delayMs = 0 }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? (formatValue ? formatValue(animated) : animated.toLocaleString('fr-FR')) : value;
  return (
    <div
      className="hover-card fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6 flex items-center gap-4"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-mono font-bold text-background tabular-nums">{display}</p>
        <p className="text-xs text-background/65 uppercase tracking-wider font-mono">{label}</p>
        {(total !== undefined || delta) && (
          <p className="text-xs text-background/55 mt-1">
            {total !== undefined && <span>{total.toLocaleString('fr-FR')} au total</span>}
            {total !== undefined && delta && ' · '}
            {delta}
          </p>
        )}
        {note && <p className="text-xs text-background/55 mt-0.5">{note}</p>}
      </div>
      <Sparkline data={spark} id={sparkId} color={sparkColor} />
    </div>
  );
}

// Aire empilée (gratuit + Pro + Entreprise) par jour — le point central de
// cette page : rendre visible d'un coup d'œil que la majorité des
// inscriptions restent sur le plan Starter (gratuit), pas seulement le
// total agrégé "nouveaux utilisateurs" du haut de page.
function SignupsByPlanChart({ data, totals, livePlans, range }) {
  return (
    <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-background uppercase tracking-wider">Inscriptions par plan</h2>
          <p className="text-xs text-background/55 mt-1">Y compris les inscriptions gratuites (Starter) — {range} derniers jours.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {PLAN_KEYS.map((key) => {
            const Icon = PLAN_ICONS[key];
            const name = (livePlans[key] || PLANS[key])?.name || key;
            return (
              <span key={key} className="inline-flex items-center gap-1.5 text-xs font-mono text-background/60">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PLAN_COLORS[key] }} />
                <Icon className="w-3.5 h-3.5" />
                {name} <b className="text-background">{totals[key] || 0}</b>
              </span>
            );
          })}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            {PLAN_KEYS.map((key) => (
              <linearGradient key={key} id={`gradSignup-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PLAN_COLORS[key]} stopOpacity={0.55} />
                <stop offset="95%" stopColor={PLAN_COLORS[key]} stopOpacity={0.04} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,249,247,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {PLAN_KEYS.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="signups"
              stroke={PLAN_COLORS[key]}
              strokeWidth={1.5}
              fill={`url(#gradSignup-${key})`}
              name={(livePlans[key] || PLANS[key])?.name || key}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Le funnel de croissance de TonTunnel lui-même — visiteurs uniques,
// inscriptions, puis clients payants — un diagramme en entonnoir a le mérite
// d'être immédiatement lisible pour ce type de métrique (et cohérent avec le
// produit : un "tunnel" pour visualiser son propre tunnel).
function ConversionFunnel({ visits, signups, paid, range }) {
  const data = [
    { name: 'Visiteurs uniques', value: visits, fill: 'rgb(148,163,184)' },
    { name: 'Inscriptions', value: signups, fill: 'rgb(34,197,94)' },
    { name: 'Clients payants', value: paid, fill: 'rgb(251,191,36)' },
  ];
  const hasData = visits > 0 || signups > 0;

  return (
    <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-background mb-1 uppercase tracking-wider">Tunnel de conversion</h2>
      <p className="text-xs text-background/55 mb-4">Visiteurs → inscrits → clients payants, sur {range} jours.</p>
      {!hasData ? (
        <p className="text-sm text-background/55 py-14 text-center">Pas assez de données sur cette période.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <FunnelChart>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Funnel dataKey="value" data={data} isAnimationActive>
              <LabelList position="right" dataKey="name" fill="rgba(246,249,247,0.7)" stroke="none" fontSize={12} />
              <LabelList position="center" dataKey="value" fill="rgb(11,40,24)" stroke="none" fontSize={13} fontWeight={700} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function AreaTrendChart({ title, data, color, id }) {
  return (
    <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.45} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,249,247,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: color, strokeOpacity: 0.2 }} />
          <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2.5} fill={`url(#${id})`} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Visites totales (aire) et visiteurs uniques (ligne pointillée) superposés
// — la comparaison des deux courbes dit si le trafic vient de nouvelles
// personnes ou de visites répétées, ce qu'aucune des deux mesures seules
// ne montre.
function TrafficChart({ data }) {
  return (
    <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">Visites par jour</h2>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="gradVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(34,197,94)" stopOpacity={0.45} />
              <stop offset="95%" stopColor="rgb(34,197,94)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(246,249,247,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(246,249,247,0.5)' }} />
          <Area type="monotone" dataKey="visites" stroke="rgb(34,197,94)" strokeWidth={2.5} fill="url(#gradVisits)" name="Visites" />
          <Line type="monotone" dataKey="uniques" stroke="rgb(251,191,36)" strokeWidth={2} strokeDasharray="4 3" dot={false} name="Visiteurs uniques" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

const PAGE_LABELS = {
  '/': 'Landing page',
  '/inscription': 'Inscription',
  '/connexion': 'Connexion',
  '/mot-de-passe-oublie': 'Mot de passe oublié',
  '/mentions-legales': 'Mentions légales',
  '/cgu': 'CGU',
  '/cgv': 'CGV',
  '/confidentialite': 'Confidentialité',
};

const ACTION_LABELS = {
  cta_click_hero: 'Clic CTA — Hero',
  cta_click_navbar: 'Clic CTA — Barre de navigation',
  cta_click_banner: 'Clic CTA — Bannière finale',
  signup_started: 'Inscription démarrée',
  signup_completed: 'Inscription terminée',
  checkout_started: 'Paiement démarré',
};

function actionLabel(name) {
  if (ACTION_LABELS[name]) return ACTION_LABELS[name];
  if (name.startsWith('cta_click_pricing_')) return `Clic CTA — Tarifs (${name.replace('cta_click_pricing_', '')})`;
  return name;
}

// Regroupe et trie par fréquence — même logique pour les pages vues et les
// actions, seul le libellé affiché change.
function topCounts(rows, labelFn) {
  const map = new Map();
  for (const row of rows) {
    map.set(row.name, (map.get(row.name) || 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, label: labelFn(name), count }));
}

function TopList({ title, items, emptyLabel }) {
  const max = items[0]?.count || 1;
  return (
    <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-background/55">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-background/80 truncate">{item.label}</span>
                <span className="font-mono text-xs text-background/65 shrink-0 ml-2">{item.count}</span>
              </div>
              <div className="h-1.5 bg-background/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent/50 to-accent rounded-full transition-all duration-500" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
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
      pageviews: data.pageviews.filter((p) => new Date(p.created_at) >= cutoff),
      actions: data.actions.filter((a) => new Date(a.created_at) >= cutoff),
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
    const prevPageviews = data.pageviews.filter((p) => inRange(p.created_at));
    return {
      profiles: data.profiles.filter((p) => inRange(p.created_at)).length,
      funnels: data.funnels.filter((f) => inRange(f.created_at)).length,
      leads: data.leads.filter((l) => inRange(l.created_at)).length,
      pageviews: prevPageviews.length,
      uniqueVisitors: new Set(prevPageviews.map((p) => p.visitor_id)).size,
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
  const signupsByPlanChart = bucketByDayMultiSeries(filtered.profiles, 'created_at', 'plan', PLAN_KEYS, range);
  const signupsByPlanTotals = filtered.profiles.reduce((acc, p) => {
    const key = p.plan || 'starter';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const funnelsChart = bucketByDay(filtered.funnels, 'created_at', range);
  const leadsChart = bucketByDay(filtered.leads, 'created_at', range);
  const pageviewsChart = bucketByDay(filtered.pageviews, 'created_at', range);
  const uniqueVisitorsChart = bucketUniqueByDay(filtered.pageviews, 'created_at', 'visitor_id', range);
  const trafficChart = pageviewsChart.map((d, i) => ({ label: d.label, visites: d.count, uniques: uniqueVisitorsChart[i]?.count || 0 }));
  const uniqueVisitors = new Set(filtered.pageviews.map((p) => p.visitor_id)).size;
  const topPages = topCounts(filtered.pageviews, (name) => PAGE_LABELS[name] || name);
  const topActions = topCounts(filtered.actions, actionLabel);
  const paidSignups = filtered.profiles.filter((p) => (p.plan || 'starter') !== 'starter').length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`magnetic-btn px-4 py-2 rounded-full text-sm font-medium transition-colors ${range === r.key ? 'bg-accent text-primary' : 'bg-admin-card border border-background/10 text-background/60 hover:text-background'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Wallet} label="MRR actuelle" value={mrr} formatValue={(v) => `${v.toLocaleString('fr-FR')} FCFA`} delayMs={0} />
        <StatCard
          icon={UserPlus}
          label={`Nouveaux utilisateurs (${range}j)`}
          value={filtered.profiles.length}
          total={data.profiles.length}
          delta={<Delta current={filtered.profiles.length} previous={previous.profiles} />}
          note={`dont ${signupsByPlanTotals.starter || 0} gratuites (Starter)`}
          spark={signupsChart}
          sparkId="spark-users"
          delayMs={60}
        />
        <StatCard
          icon={Layers}
          label={`Tunnels créés (${range}j)`}
          value={filtered.funnels.length}
          total={data.funnels.length}
          delta={<Delta current={filtered.funnels.length} previous={previous.funnels} />}
          spark={funnelsChart}
          sparkId="spark-funnels"
          sparkColor="rgb(96,165,250)"
          delayMs={120}
        />
        <StatCard
          icon={Mail}
          label={`Leads capturés (${range}j)`}
          value={filtered.leads.length}
          total={data.leads.length}
          delta={<Delta current={filtered.leads.length} previous={previous.leads} />}
          spark={leadsChart}
          sparkId="spark-leads"
          sparkColor="rgb(251,191,36)"
          delayMs={180}
        />
      </div>

      <div className="mb-8">
        <SignupsByPlanChart data={signupsByPlanChart} totals={signupsByPlanTotals} livePlans={livePlans} range={range} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <PlanDonut profiles={data.profiles} livePlans={livePlans} />
        <ConversionFunnel visits={uniqueVisitors} signups={filtered.profiles.length} paid={paidSignups} range={range} />
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-background/55 mb-3">Activité</p>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <AreaTrendChart title="Tunnels créés par jour" data={funnelsChart} color="rgb(96,165,250)" id="gradFunnels" />
        <AreaTrendChart title="Leads capturés par jour" data={leadsChart} color="rgb(251,191,36)" id="gradLeads" />
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-background/55 mb-3">Trafic (pages publiques)</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={Eye}
          label={`Visites (${range}j)`}
          value={filtered.pageviews.length}
          total={data.pageviews.length}
          delta={<Delta current={filtered.pageviews.length} previous={previous.pageviews} />}
          spark={pageviewsChart}
          sparkId="spark-visits"
          delayMs={0}
        />
        <StatCard
          icon={Users}
          label={`Visiteurs uniques (${range}j)`}
          value={uniqueVisitors}
          delta={<Delta current={uniqueVisitors} previous={previous.uniqueVisitors} />}
          spark={uniqueVisitorsChart}
          sparkId="spark-uniques"
          sparkColor="rgb(251,191,36)"
          delayMs={60}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <TrafficChart data={trafficChart} />
        <div className="grid md:grid-cols-2 gap-6">
          <TopList title="Pages les plus visitées" items={topPages} emptyLabel="Aucune visite sur cette période." />
          <TopList title="Actions des visiteurs" items={topActions} emptyLabel="Aucune action enregistrée sur cette période." />
        </div>
      </div>

      <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">Changements de plan récents</h2>
        {filtered.planEvents.length === 0 ? (
          <p className="text-sm text-background/55">Aucun changement de plan sur cette période.</p>
        ) : (
          <div className="space-y-2">
            {filtered.planEvents.slice(0, 15).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-background/5 last:border-0">
                <span className="text-background/65">{new Date(e.changed_at).toLocaleString('fr-FR')}</span>
                <span className="text-background font-medium">{e.old_plan || '—'} → {e.new_plan}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
