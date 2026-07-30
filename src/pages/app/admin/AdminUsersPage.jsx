import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Shield, ShieldOff, Coins } from 'lucide-react';
import { fetchAllProfiles, updateUserPlanAsAdmin, setAdminStatus, grantCreditsAsAdmin } from '../../../lib/adminApi';
import { useAuth } from '../../../context/AuthContext';
import { PLAN_ORDER, getPlan } from '../../../lib/plans';
import { useToast } from '../../../components/app/Toast';
import { useClickOutside } from '../../../lib/useClickOutside';
import { useAnchoredPosition } from '../../../lib/useAnchoredPosition';
import Spinner from '../../../components/app/Spinner';
import SortMenu from '../../../components/app/SortMenu';

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Plus récent' },
  { value: 'created_asc', label: 'Plus ancien' },
];

const GRANT_PANEL_WIDTH = 220;

// Tri côté client (liste déjà entièrement chargée) — 'created_desc' par
// défaut reproduit l'ordre déjà renvoyé par l'API (order: createdAt DESC).
function sortProfiles(list, sortBy) {
  const dir = sortBy === 'created_desc' ? -1 : 1;
  return [...list].sort((a, b) => dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
}

// Bouton + panneau ancré (même mécanique que SortMenu/DateRangeFilter —
// useAnchoredPosition, déjà éprouvée contre le débordement mobile) pour
// ajouter des crédits IA sans construire une nouvelle brique de modale.
function GrantCreditsMenu({ onGrant, busy }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const containerRef = useClickOutside(open, () => setOpen(false));
  const triggerRef = useRef(null);
  const pos = useAnchoredPosition(open, triggerRef, GRANT_PANEL_WIDTH);

  const submit = async (e) => {
    e.preventDefault();
    const value = Math.floor(Number(amount));
    if (!value || value <= 0) return;
    await onGrant(value);
    setAmount('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        title="Ajouter des crédits IA"
        className="hover-lift p-2 rounded-lg text-background/50 hover:bg-background/10 hover:text-accent transition-colors disabled:opacity-40"
      >
        <Coins className="w-4 h-4" />
      </button>
      {open && pos && (
        <form
          onSubmit={submit}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: GRANT_PANEL_WIDTH }}
          className="dropdown-panel z-30 bg-block-card border border-background/10 rounded-2xl shadow-xl p-3"
        >
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-background/50 mb-1.5">Crédits à ajouter</label>
          <input
            type="number"
            min="1"
            step="1"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="ex. 500"
            className="w-full bg-primary/40 border border-background/10 rounded-lg px-3 py-2 text-sm text-background focus:outline-none focus:border-accent transition-colors mb-2"
          />
          <button
            type="submit"
            disabled={busy || !amount}
            className="w-full text-center px-3 py-2 rounded-lg text-sm font-semibold bg-accent text-primary disabled:opacity-40"
          >
            Ajouter
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const toast = useToast();
  const { user, refreshProfile } = useAuth();
  const [profiles, setProfiles] = useState(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [sortBy, setSortBy] = useState('created_desc');

  const load = async () => setProfiles(await fetchAllProfiles());

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!profiles) return [];
    const q = query.trim().toLowerCase();
    const base = q ? profiles.filter((p) => p.email.toLowerCase().includes(q) || (p.full_name || '').toLowerCase().includes(q)) : profiles;
    return sortProfiles(base, sortBy);
  }, [profiles, query, sortBy]);

  const handlePlanChange = async (profileId, plan) => {
    setBusyId(profileId);
    try {
      // Le changement de plan et son journal d'audit sont désormais gérés
      // automatiquement côté serveur (voir AdminService.updateUserPlan).
      await updateUserPlanAsAdmin(profileId, plan);
      await load();
    } catch (err) {
      toast.error(err.message || 'Impossible de changer ce plan.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleAdmin = async (p) => {
    setBusyId(p.id);
    try {
      await setAdminStatus(p.id, !p.is_admin);
      await load();
      if (p.id === user?.id) await refreshProfile();
    } catch (err) {
      toast.error(err.message || 'Impossible de modifier ce statut.');
    } finally {
      setBusyId(null);
    }
  };

  const handleGrantCredits = async (profileId, amount) => {
    setBusyId(profileId);
    try {
      // Le journal d'audit ("credits.grant") est géré automatiquement côté
      // serveur (voir AdminService.grantCredits).
      await grantCreditsAsAdmin(profileId, amount);
      toast.success(`${amount.toLocaleString('fr-FR')} crédits ajoutés.`);
      await load();
    } catch (err) {
      toast.error(err.message || "Impossible d'ajouter des crédits.");
    } finally {
      setBusyId(null);
    }
  };

  if (!profiles) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" tone="admin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-background/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par email ou nom..."
            className="w-full bg-block-card border border-background/10 rounded-xl pl-10 pr-4 py-3 text-sm text-background focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <SortMenu value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} tone="admin" />
      </div>

      <div className="fade-in-up bg-block-card border border-background/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background/10 text-left text-background/50 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Crédits IA</th>
                <th className="px-6 py-4 font-medium">Inscrit le</th>
                <th className="px-6 py-4 font-medium">Admin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-background/5 last:border-0 hover:bg-background/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-background">{p.full_name || '—'}</p>
                    <p className="text-background/50 text-xs">{p.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={p.plan || 'starter'}
                      onChange={(e) => handlePlanChange(p.id, e.target.value)}
                      disabled={busyId === p.id}
                      className="bg-primary/40 border border-background/10 rounded-lg px-3 py-2 text-sm text-background focus:outline-none focus:border-accent disabled:opacity-60"
                    >
                      {PLAN_ORDER.map((key) => (
                        <option key={key} value={key}>{getPlan(key).name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-background/80 font-mono text-sm">{(p.ai_credits_balance ?? 0).toLocaleString('fr-FR')}</span>
                      <GrantCreditsMenu busy={busyId === p.id} onGrant={(amount) => handleGrantCredits(p.id, amount)} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-background/50">
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAdmin(p)}
                      disabled={busyId === p.id || p.id === user?.id}
                      title={p.id === user?.id ? 'Tu ne peux pas modifier ton propre statut' : undefined}
                      className={`hover-lift flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                        ${p.is_admin ? 'bg-accent/10 text-accent' : 'bg-background/10 text-background/50 hover:bg-background/15'}`}
                    >
                      {p.is_admin ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                      {p.is_admin ? 'Administrateur' : 'Utilisateur'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-background/40">Aucun utilisateur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
