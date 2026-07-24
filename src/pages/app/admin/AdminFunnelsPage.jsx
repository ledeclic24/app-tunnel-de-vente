import React, { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink, Trash2 } from 'lucide-react';
import { fetchAllProfiles, fetchAllFunnels, fetchAllLeadCounts, deleteFunnelAsAdmin } from '../../../lib/adminApi';
import { useConfirm } from '../../../components/app/ConfirmDialog';

export default function AdminFunnelsPage() {
  const [profiles, setProfiles] = useState(null);
  const [funnels, setFunnels] = useState(null);
  const [leadCounts, setLeadCounts] = useState(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const confirm = useConfirm();

  const load = async () => {
    const [p, f, l] = await Promise.all([fetchAllProfiles(), fetchAllFunnels(), fetchAllLeadCounts()]);
    setProfiles(p);
    setFunnels(f);
    setLeadCounts(l);
  };

  useEffect(() => {
    load();
  }, []);

  const profileById = useMemo(() => {
    const map = new Map();
    (profiles || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [profiles]);

  const filtered = useMemo(() => {
    if (!funnels) return [];
    const q = query.trim().toLowerCase();
    if (!q) return funnels;
    return funnels.filter((f) => {
      const owner = profileById.get(f.user_id);
      return f.name.toLowerCase().includes(q) || (owner?.email || '').toLowerCase().includes(q);
    });
  }, [funnels, query, profileById]);

  const handleDelete = async (funnel) => {
    if (!(await confirm(`Supprimer définitivement "${funnel.name}" ? Cette action est irréversible.`))) return;
    setBusyId(funnel.id);
    // Le journal d'audit est désormais géré automatiquement côté serveur
    // (voir AdminService.deleteFunnel).
    await deleteFunnelAsAdmin(funnel.id);
    await load();
    setBusyId(null);
  };

  if (!profiles || !funnels || !leadCounts) {
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
          placeholder="Rechercher par nom ou email propriétaire..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Tunnel</th>
                <th className="px-6 py-4 font-medium">Propriétaire</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Leads</th>
                <th className="px-6 py-4 font-medium">Créé le</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const owner = profileById.get(f.user_id);
                return (
                  <tr key={f.id} className="border-b border-zinc-800/60 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-100">{f.name}</p>
                      <p className="text-zinc-500 text-xs font-mono">{f.template}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{owner?.email || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${f.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {f.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{leadCounts[f.id] || 0}</td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(f.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {f.is_published && (
                          <a
                            href={`/f/${f.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-emerald-400 transition-colors"
                            title="Voir la page publique"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(f)}
                          disabled={busyId === f.id}
                          className="p-2 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-600">Aucun tunnel trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
