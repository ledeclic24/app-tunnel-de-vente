import React, { useEffect, useMemo, useState } from 'react';
import { Search, Shield, ShieldOff } from 'lucide-react';
import { fetchAllProfiles, updateUserPlanAsAdmin, setAdminStatus } from '../../../lib/adminApi';
import { useAuth } from '../../../context/AuthContext';
import { PLAN_ORDER, getPlan } from '../../../lib/plans';

export default function AdminUsersPage() {
  const { user, refreshProfile } = useAuth();
  const [profiles, setProfiles] = useState(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => setProfiles(await fetchAllProfiles());

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!profiles) return [];
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => p.email.toLowerCase().includes(q) || (p.full_name || '').toLowerCase().includes(q));
  }, [profiles, query]);

  const handlePlanChange = async (profileId, plan) => {
    setBusyId(profileId);
    // Le changement de plan et son journal d'audit sont désormais gérés
    // automatiquement côté serveur (voir AdminService.updateUserPlan).
    await updateUserPlanAsAdmin(profileId, plan);
    await load();
    setBusyId(null);
  };

  const handleToggleAdmin = async (p) => {
    setBusyId(p.id);
    try {
      await setAdminStatus(p.id, !p.is_admin);
      await load();
      if (p.id === user?.id) await refreshProfile();
    } finally {
      setBusyId(null);
    }
  };

  if (!profiles) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par email ou nom..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Inscrit le</th>
                <th className="px-6 py-4 font-medium">Admin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/60 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-zinc-100">{p.full_name || '—'}</p>
                    <p className="text-zinc-500 text-xs">{p.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={p.plan || 'starter'}
                      onChange={(e) => handlePlanChange(p.id, e.target.value)}
                      disabled={busyId === p.id}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                    >
                      {PLAN_ORDER.map((key) => (
                        <option key={key} value={key}>{getPlan(key).name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAdmin(p)}
                      disabled={busyId === p.id || p.id === user?.id}
                      title={p.id === user?.id ? 'Tu ne peux pas modifier ton propre statut' : undefined}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                        ${p.is_admin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800'}`}
                    >
                      {p.is_admin ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                      {p.is_admin ? 'Administrateur' : 'Utilisateur'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-600">Aucun utilisateur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
