import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Megaphone, Plug, Trash2, Wallet, Users, Target } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import {
  startMetaAdsConnect, fetchMetaAdAccounts, disconnectMetaAdAccount,
  fetchMetaAdCampaigns, fetchMetaAdsSummary,
} from '../../lib/metaAdsApi';

const DATE_PRESETS = [
  { key: 'last_7d', label: '7 derniers jours' },
  { key: 'last_30d', label: '30 derniers jours' },
  { key: 'this_month', label: 'Ce mois' },
  { key: 'last_month', label: 'Mois dernier' },
];

const STATUS_LABEL = { ACTIVE: 'Active', PAUSED: 'En pause', DELETED: 'Supprimée', ARCHIVED: 'Archivée' };
const STATUS_CLASS = {
  ACTIVE: 'bg-accent/10 text-accent',
  PAUSED: 'bg-orange-500/10 text-orange-500',
  DELETED: 'bg-red-500/10 text-red-500',
  ARCHIVED: 'bg-surface/10 text-surface/50',
};

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-background border border-surface/10 rounded-xl p-4">
      <div className="flex items-center gap-2 text-surface/40 mb-2">
        <Icon className="w-4 h-4" />
        <p className="text-[10px] uppercase tracking-wider font-mono">{label}</p>
      </div>
      <p className="text-2xl font-sans font-bold text-surface">{value}</p>
    </div>
  );
}

function formatCurrency(amount, currency) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || ''}`;
  }
}

function CampaignsTable({ campaigns, currency }) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-surface/20 rounded-[2rem]">
        <p className="text-surface/60 text-sm">Aucune campagne sur ce compte publicitaire.</p>
      </div>
    );
  }
  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-surface/40 text-[10px] uppercase tracking-wider font-mono border-b border-surface/10">
            <th className="px-6 py-3 font-normal">Campagne</th>
            <th className="px-6 py-3 font-normal">Statut</th>
            <th className="px-6 py-3 font-normal">Budget/jour</th>
            <th className="px-6 py-3 font-normal">Objectif</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface/5">
          {campaigns.map((c) => (
            <tr key={c.id}>
              <td className="px-6 py-4 text-surface font-medium">{c.name}</td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_CLASS[c.status] || 'bg-surface/10 text-surface/50'}`}>
                  {STATUS_LABEL[c.status] || c.status}
                </span>
              </td>
              <td className="px-6 py-4 text-surface/70 font-mono text-xs">
                {c.daily_budget ? formatCurrency(Number(c.daily_budget) / 100, currency) : '—'}
              </td>
              <td className="px-6 py-4 text-surface/50 text-xs">{c.objective || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpendLeadsChart({ byDay }) {
  if (!byDay || byDay.length === 0) return null;
  const data = byDay.map((d) => ({ ...d, label: d.date.slice(5) }));
  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 mb-8">
      <h3 className="font-sans font-semibold text-surface mb-4">Dépenses vs leads captés</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="spend" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={40} />
          <YAxis yAxisId="leads" orientation="right" allowDecimals={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #27272a', background: '#18181b', fontSize: 13, color: '#f4f4f5' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="spend" type="monotone" dataKey="spend" name="Dépenses" stroke="#f87171" strokeWidth={2} dot={false} />
          <Line yAxisId="leads" type="monotone" dataKey="leads" name="Leads" stroke="#34d399" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdsPage() {
  const { effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);
  const [searchParams, setSearchParams] = useSearchParams();

  const [accounts, setAccounts] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [summary, setSummary] = useState(null);
  const [datePreset, setDatePreset] = useState('last_30d');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const justConnected = searchParams.get('connected');
  const oauthError = searchParams.get('error');

  const loadAccounts = useCallback(async () => {
    try {
      const data = await fetchMetaAdAccounts();
      setAccounts(data);
      setSelectedAccountId((current) => current || data[0]?.id || null);
    } catch {
      setAccounts([]);
    }
  }, []);

  useEffect(() => {
    if (!plan.adsManagement) return;
    loadAccounts();
  }, [plan.adsManagement, loadAccounts]);

  useEffect(() => {
    if (justConnected || oauthError) setSearchParams({}, { replace: true });
  }, [justConnected, oauthError, setSearchParams]);

  useEffect(() => {
    if (!selectedAccountId) return;
    setCampaigns(null);
    setSummary(null);
    setError('');
    Promise.all([
      fetchMetaAdCampaigns(selectedAccountId),
      fetchMetaAdsSummary(selectedAccountId, datePreset),
    ])
      .then(([c, s]) => { setCampaigns(c); setSummary(s); })
      .catch((err) => setError(err?.message || 'Impossible de charger les données Meta Ads.'));
  }, [selectedAccountId, datePreset]);

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    try {
      const url = await startMetaAdsConnect();
      window.location.href = url;
    } catch (err) {
      setError(err?.message || 'Impossible de démarrer la connexion Facebook.');
      setConnecting(false);
    }
  };

  const handleDisconnect = async (accountId) => {
    if (!window.confirm('Déconnecter ce compte publicitaire ?')) return;
    try {
      await disconnectMetaAdAccount(accountId);
      if (selectedAccountId === accountId) setSelectedAccountId(null);
      await loadAccounts();
    } catch {
      setError('Impossible de déconnecter ce compte, réessaie.');
    }
  };

  if (!plan.adsManagement) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-10 h-10 text-surface/30 mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Publicité réservée au plan Entreprise</h1>
        <p className="text-surface/60 mb-6">
          Connecte ton compte Meta Ads et suis tes dépenses publicitaires croisées avec tes leads Vendeko, avec le plan Entreprise.
        </p>
        <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-6 py-3 rounded-full font-semibold">
          Voir les offres
        </Link>
      </div>
    );
  }

  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId) || null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Megaphone className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-sans font-bold text-surface">Publicité</h1>
      </div>
      <p className="text-surface/60 mb-8 max-w-2xl">
        Connecte ton compte Meta Ads pour suivre tes dépenses publicitaires et les croiser avec les leads captés sur tes tunnels Vendeko.
      </p>

      {justConnected && <p className="text-sm text-accent mb-6">Compte Meta Ads connecté avec succès.</p>}
      {oauthError && <p className="text-sm text-red-500 mb-6">La connexion à Facebook a échoué, réessaie.</p>}
      {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

      {accounts === null && <Spinner />}

      {accounts && accounts.length === 0 && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
          <Plug className="w-9 h-9 text-surface/30 mx-auto mb-4" />
          <p className="text-surface/60 mb-6 max-w-md mx-auto">Aucun compte Meta Ads connecté pour l'instant.</p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="magnetic-btn inline-flex bg-accent text-background px-6 py-3 rounded-full font-semibold disabled:opacity-60"
          >
            {connecting ? 'Connexion...' : 'Connecter Meta Ads'}
          </button>
        </div>
      )}

      {accounts && accounts.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedAccountId === account.id
                    ? 'bg-accent text-background border-accent'
                    : 'border-surface/15 text-surface/70 hover:border-surface/30'
                }`}
              >
                {account.adAccountName}
              </button>
            ))}
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-4 py-2 rounded-full text-sm font-medium text-surface/50 hover:text-surface border border-dashed border-surface/20"
            >
              + Connecter un autre compte
            </button>
            {selectedAccountId && (
              <button
                onClick={() => handleDisconnect(selectedAccountId)}
                className="ml-auto p-2 text-surface/40 hover:text-red-500"
                aria-label="Déconnecter ce compte"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setDatePreset(p.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider ${
                  datePreset === p.key ? 'bg-surface text-background' : 'text-surface/50 hover:text-surface bg-surface/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {summary === null && <Spinner />}

          {summary && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <KpiCard icon={Wallet} label="Dépenses" value={formatCurrency(summary.totalSpend, selectedAccount?.currency)} />
                <KpiCard icon={Users} label="Leads captés" value={summary.totalLeads} />
                <KpiCard
                  icon={Target}
                  label="Coût par lead"
                  value={summary.costPerLead !== null ? formatCurrency(summary.costPerLead, selectedAccount?.currency) : '—'}
                />
              </div>

              <SpendLeadsChart byDay={summary.byDay} />
            </>
          )}

          {campaigns === null && <Spinner />}
          {campaigns && <CampaignsTable campaigns={campaigns} currency={selectedAccount?.currency} />}
        </>
      )}
    </div>
  );
}
