import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, Pencil, Trash2, Rocket, Mail, Eye, Layers, CheckCircle2, Circle, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels, deleteFunnel, fetchLeadsForUser, fetchFunnelStepsAnalytics } from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';
import { useConfirm } from '../../components/app/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

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
    <div className="bg-primary text-background rounded-[2rem] p-6 mb-8 shadow-soft">
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

function FunnelCard({ funnel, onDelete }) {
  return (
    <Card interactive className="p-5 flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <LayoutGrid className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans font-semibold text-surface truncate">{funnel.name}</h3>
          <p className="text-xs text-surface/40 font-mono truncate">/{funnel.slug}</p>
        </div>
        <Badge variant={funnel.is_published ? 'success' : 'neutral'}>
          {funnel.is_published ? 'Publié' : 'Brouillon'}
        </Badge>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4 border-t border-surface/10">
        <Button as={Link} to={`/app/funnels/${funnel.id}/edit`} variant="secondary" size="sm" className="flex-1">
          <Pencil className="w-3.5 h-3.5" /> Modifier
        </Button>
        {funnel.is_published && (
          <Button as="a" href={`/f/${funnel.slug}`} target="_blank" rel="noreferrer" variant="ghost" size="sm" className="px-2.5" aria-label="Voir la page publique">
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" className="px-2.5 text-surface/40 hover:text-red-500" onClick={() => onDelete(funnel)} aria-label="Supprimer">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
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
      <PageHeader
        title="Tes tunnels de vente"
        description={`Plan ${plan.name} — ${funnels ? funnels.length : '…'} / ${plan.maxFunnels === Infinity ? '∞' : plan.maxFunnels} tunnel(s) utilisé(s)`}
        actions={
          atLimit ? (
            <Button as={Link} to="/app/billing" variant="dark">
              <Rocket className="w-4 h-4" /> Passer au plan supérieur
            </Button>
          ) : (
            <Button as={Link} to="/app/funnels/new" variant="primary" className="btn-fill-slide group relative">
              <span className="relative z-10 flex items-center gap-2"><Plus className="w-4 h-4" /> Créer un tunnel</span>
              <div className="fill-layer bg-white/20 rounded-full"></div>
            </Button>
          )
        }
      />

      {funnels && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <KpiCard icon={Mail} label="Leads (7 derniers jours)" value={leads7d} />
          <KpiCard icon={Eye} label="Vues totales" value={totalViews} />
          <KpiCard icon={Layers} label="Tunnels actifs" value={`${publishedCount} / ${funnels.length}`} />
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
        <EmptyState
          icon={LayoutGrid}
          title="Aucun tunnel pour l'instant"
          description="Crée ton premier tunnel de vente pour commencer à capter des leads."
          action={<Button as={Link} to="/app/funnels/new" variant="primary">Créer ton premier tunnel</Button>}
        />
      )}

      {funnels && funnels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {funnels.map((funnel) => (
            <FunnelCard key={funnel.id} funnel={funnel} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
