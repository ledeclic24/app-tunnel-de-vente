import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, Pencil, Trash2, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels, deleteFunnel } from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [funnels, setFunnels] = useState(null);
  const [error, setError] = useState('');

  const plan = getPlan(profile?.plan);
  const atLimit = funnels && funnels.length >= plan.maxFunnels;

  const load = async () => {
    try {
      const data = await fetchUserFunnels(profile.id);
      setFunnels(data);
    } catch (err) {
      setError("Impossible de charger tes tunnels.");
    }
  };

  useEffect(() => {
    if (profile) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleDelete = async (funnel) => {
    if (!window.confirm(`Supprimer le tunnel "${funnel.name}" ? Cette action est irréversible.`)) return;
    try {
      await deleteFunnel(funnel.id);
      setFunnels((prev) => prev.filter((f) => f.id !== funnel.id));
    } catch (err) {
      setError("Impossible de supprimer ce tunnel. Réessaie.");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold text-surface">Tes tunnels de vente</h1>
          <p className="text-surface/60 text-sm mt-1">
            Plan {plan.name} — {funnels ? funnels.length : '…'} / {plan.maxFunnels === Infinity ? '∞' : plan.maxFunnels} tunnel(s) utilisé(s)
          </p>
        </div>
        {atLimit ? (
          <Link to="/app/billing" className="magnetic-btn inline-flex items-center gap-2 bg-primary text-background px-5 py-3 rounded-full text-sm font-semibold">
            <Rocket className="w-4 h-4" /> Passer au plan supérieur
          </Link>
        ) : (
          <Link to="/app/funnels/new" className="magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-5 py-3 rounded-full text-sm font-semibold">
            <span className="relative z-10 flex items-center gap-2"><Plus className="w-4 h-4" /> Créer un tunnel</span>
            <div className="fill-layer bg-white/20 rounded-full"></div>
          </Link>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {funnels === null && !error && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {funnels && funnels.length === 0 && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
          <p className="text-surface/60 mb-4">Tu n'as pas encore de tunnel de vente.</p>
          <Link to="/app/funnels/new" className="text-accent font-semibold hover:underline">Crée ton premier tunnel →</Link>
        </div>
      )}

      {funnels && funnels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {funnels.map((funnel) => (
            <div key={funnel.id} className="bg-background border border-surface/10 rounded-[2rem] p-6 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-sans font-semibold text-surface pr-2">{funnel.name}</h3>
                <span className={`shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${funnel.is_published ? 'bg-green-500/10 text-green-600' : 'bg-surface/10 text-surface/50'}`}>
                  {funnel.is_published ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <p className="text-xs text-surface/40 font-mono mb-6">/{funnel.slug}</p>

              <div className="mt-auto flex items-center gap-2">
                <Link to={`/app/funnels/${funnel.id}/edit`} className="hover-lift flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background text-sm font-medium">
                  <Pencil className="w-3.5 h-3.5" /> Modifier
                </Link>
                {funnel.is_published && (
                  <a href={`/f/${funnel.slug}`} target="_blank" rel="noreferrer" className="hover-lift p-2.5 rounded-xl border border-surface/10 text-surface/60" aria-label="Voir la page publique">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => handleDelete(funnel)} className="hover-lift p-2.5 rounded-xl border border-surface/10 text-surface/40 hover:text-red-500" aria-label="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
