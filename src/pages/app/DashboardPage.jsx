import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, Pencil, Trash2, Rocket, Mail, Eye, Layers, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels, deleteFunnel, fetchLeadsForUser, fetchFunnelStepsAnalytics } from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';
import { useConfirm } from '../../components/app/ConfirmDialog';

// Chaque KPI a sa propre teinte (toujours les couleurs de marque existantes,
// juste à faible opacité) plutôt qu'un fond blanc uniforme pour les trois —
// permet de les distinguer d'un coup d'œil et de rythmer la rangée.
const KPI_TINTS = {
  accent: { bg: 'bg-accent/5', border: 'border-accent/15', icon: 'text-accent' },
  primary: { bg: 'bg-primary/5', border: 'border-primary/15', icon: 'text-primary' },
  surface: { bg: 'bg-surface/5', border: 'border-surface/10', icon: 'text-surface/50' },
};

function KpiCard({ icon: Icon, label, value, tint = 'surface' }) {
  const t = KPI_TINTS[tint];
  return (
    <div className={`${t.bg} border ${t.border} rounded-xl p-4`}>
      <div className={`flex items-center gap-2 ${t.icon} mb-2`}>
        <Icon className="w-4 h-4" />
        <p className="text-[10px] uppercase tracking-wider font-mono">{label}</p>
      </div>
      <p className="text-2xl font-sans font-bold text-surface">{value}</p>
    </div>
  );
}

function OnboardingChecklist({ funnels, profileId }) {
  const dismissedKey = profileId ? `vendeko_onboarding_dismissed_${profileId}` : null;
  const [dismissed, setDismissed] = useState(() => {
    if (!dismissedKey) return false;
    try {
      return window.localStorage.getItem(dismissedKey) === '1';
    } catch {
      return false;
    }
  });

  const hasFunnel = !!funnels && funnels.length > 0;
  // Heuristique : un tunnel est considéré "modifié" si sa dernière mise à jour a eu lieu
  // plus d'une minute après sa création (signe probable d'un ajout de bloc/étape).
  const hasModified = hasFunnel && funnels.some((f) => new Date(f.updated_at).getTime() - new Date(f.created_at).getTime() > 60000);
  const hasPublished = hasFunnel && funnels.some((f) => f.is_published === true);

  const steps = [
    { label: 'Créer un tunnel', done: hasFunnel },
    { label: 'Ajouter un bloc', done: hasModified },
    { label: 'Publier', done: hasPublished },
  ];
  const allDone = steps.every((s) => s.done);

  useEffect(() => {
    if (!allDone || !dismissedKey || dismissed) return;
    try {
      window.localStorage.setItem(dismissedKey, '1');
    } catch {
      // stockage indisponible, tant pis pour la persistance
    }
    setDismissed(true);
  }, [allDone, dismissedKey, dismissed]);

  if (!funnels || dismissed || allDone) return null;

  return (
    <div className="bg-primary text-background rounded-[2rem] p-6 mb-8">
      <h2 className="font-sans font-semibold text-lg mb-1">Bien démarrer avec Vendeko</h2>
      <p className="text-sm text-background/60 mb-5">Trois étapes pour lancer ton premier tunnel de vente.</p>
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            {step.done ? (
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-background/30 shrink-0" />
            )}
            <span className={`text-sm ${step.done ? 'text-background/50 line-through' : 'text-background'}`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, effectiveOwnerId, effectiveProfile } = useAuth();
  const [funnels, setFunnels] = useState(null);
  const [leads7d, setLeads7d] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [error, setError] = useState('');
  const confirm = useConfirm();

  const plan = getPlan(effectiveProfile?.plan);
  const atLimit = funnels && funnels.length >= plan.maxFunnels;
  const publishedCount = funnels ? funnels.filter((f) => f.is_published).length : 0;

  const load = async () => {
    try {
      const data = await fetchUserFunnels(effectiveOwnerId);
      setFunnels(data);

      const [leadsData, viewsPerFunnel] = await Promise.all([
        fetchLeadsForUser(effectiveOwnerId),
        Promise.all(data.map((f) => fetchFunnelStepsAnalytics(f.id))),
      ]);

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      setLeads7d(leadsData.filter((l) => new Date(l.created_at).getTime() >= sevenDaysAgo).length);
      setTotalViews(viewsPerFunnel.flat().reduce((sum, step) => sum + (step.views || 0), 0));
    } catch (err) {
      setError("Impossible de charger tes tunnels.");
    }
  };

  useEffect(() => {
    if (effectiveOwnerId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveOwnerId]);

  const handleDelete = async (funnel) => {
    if (!(await confirm(`Supprimer le tunnel "${funnel.name}" ? Cette action est irréversible.`))) return;
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

      {funnels && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <KpiCard icon={Mail} label="Leads (7 derniers jours)" value={leads7d} tint="accent" />
          <KpiCard icon={Eye} label="Vues totales" value={totalViews} tint="primary" />
          <KpiCard icon={Layers} label="Tunnels actifs" value={`${publishedCount} / ${funnels.length}`} tint="surface" />
        </div>
      )}

      <OnboardingChecklist funnels={funnels} profileId={profile?.id} />

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
          {funnels.map((funnel, i) => (
            // Une fine barre de couleur en tête de carte, alternée entre
            // accent/primary/surface selon l'index — repère visuel rapide
            // dans une grille de plusieurs tunnels, mêmes couleurs de marque.
            <div key={funnel.id} className="bg-background border border-surface/10 rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
              <div className={`h-1.5 ${['bg-accent', 'bg-primary', 'bg-surface/30'][i % 3]}`} />
              <div className="p-6 flex flex-col flex-1">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
