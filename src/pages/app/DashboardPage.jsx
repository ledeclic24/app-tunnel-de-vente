import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, ExternalLink, Pencil, Trash2, Rocket, Mail, Eye, Layers, CheckCircle2, Circle, LayoutDashboard, Wallet,
  MoreHorizontal, EyeOff, Copy, Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchUserFunnels, deleteFunnel, fetchLeadsForUser, fetchTotalViewsForOwner,
  publishFunnel, unpublishFunnel, duplicateFunnel,
} from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';
import { formatPrice } from '../../lib/currency';
import { getCategory } from '../../lib/funnelTemplates';
import { useConfirm } from '../../components/app/ConfirmDialog';
import { useToast } from '../../components/app/Toast';
import GradientBanner from '../../components/ui/GradientBanner';
import Spinner from '../../components/app/Spinner';
import SortMenu from '../../components/app/SortMenu';
import PublishTemplateModal from '../../components/app/PublishTemplateModal';

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Création (récent)' },
  { value: 'created_asc', label: 'Création (ancien)' },
  { value: 'updated_desc', label: 'Modification (récent)' },
  { value: 'updated_asc', label: 'Modification (ancien)' },
];

// Tri entièrement côté client : la liste des tunnels est déjà chargée en
// entier (pas de pagination), donc rien à demander au serveur. La valeur
// par défaut ('created_desc') reproduit exactement l'ordre déjà renvoyé
// par l'API (voir FunnelsService.listOwn, order: createdAt DESC) — aucun
// changement visible tant que le vendeur ne touche pas au menu.
function sortFunnels(list, sortBy) {
  const key = sortBy.startsWith('created') ? 'created_at' : 'updated_at';
  const dir = sortBy.endsWith('desc') ? -1 : 1;
  return [...list].sort((a, b) => dir * (new Date(a[key]).getTime() - new Date(b[key]).getTime()));
}

function formatRelativeDate(iso) {
  if (!iso) return '';
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 30) return `il y a ${diffDays} j`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `il y a ${diffMonths} mois`;
  return `il y a ${Math.floor(diffMonths / 12)} an(s)`;
}

// Une carte est "mise en avant" (fond dégradé sombre, comme la bannière)
// plutôt que les autres (fond clair, icône dans un cercle teinté) — reprend
// le contraste vu sur le tableau de bord de référence, où le KPI le plus
// parlant (ici les leads récents, signal d'activité le plus direct) se
// détache visuellement des deux autres.
function KpiCard({ icon: Icon, label, value, highlight = false }) {
  if (highlight) {
    return (
      <div className="gradient-banner rounded-2xl p-5 text-background">
        <div className="w-9 h-9 rounded-full bg-background/15 flex items-center justify-center mb-3">
          <Icon className="w-4 h-4 text-background" />
        </div>
        <p className="text-2xl font-sans font-bold text-background">{value}</p>
        <p className="text-xs text-background/60 mt-1">{label}</p>
      </div>
    );
  }
  return (
    <div className="bg-background border border-surface/10 rounded-2xl shadow-soft p-5">
      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className="text-2xl font-sans font-bold text-surface">{value}</p>
      <p className="text-xs text-surface/50 mt-1">{label}</p>
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
      <h2 className="font-sans font-semibold text-lg mb-1">Bien démarrer avec TonTunnel</h2>
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

// Auparavant : "Modifier" + un lien externe + supprimer, en boutons
// séparés. Regrouper les actions moins fréquentes (publier/dépublier,
// dupliquer, publier comme modèle, supprimer) sous un seul bouton ⋯ évite
// de surcharger la carte à mesure que ses possibilités augmentent — même
// principe que le menu "Réglages" de l'éditeur, consolidé plus tôt cette
// session pour la même raison.
function FunnelCard({ funnel, index, busy, onDelete, onTogglePublish, onDuplicate, onPublishAsTemplate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const category = getCategory(funnel.category);

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] overflow-hidden shadow-soft flex flex-col">
      <div className={`h-1.5 ${['bg-accent', 'bg-primary', 'bg-surface/30'][index % 3]}`} />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-sans font-semibold text-surface pr-2">{funnel.name}</h3>
          <span className={`shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${funnel.is_published ? 'bg-green-500/10 text-green-600' : 'bg-surface/10 text-surface/50'}`}>
            {funnel.is_published ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <p className="text-xs text-surface/40 font-mono mb-2">/{funnel.slug}</p>
        <div className="flex items-center gap-2 mb-6 text-xs text-surface/40">
          <span className="px-2 py-0.5 rounded-full bg-surface/5 text-surface/50">{category.label}</span>
          <span>Modifié {formatRelativeDate(funnel.updated_at)}</span>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Link to={`/app/funnels/${funnel.id}/edit`} className="hover-lift flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background text-sm font-medium">
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </Link>
          <div className="relative shrink-0">
            <button type="button" onClick={() => setMenuOpen((v) => !v)} className="hover-lift p-2.5 rounded-xl border border-surface/10 text-surface/60" aria-label="Plus d'actions">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute z-30 mt-2 right-0 w-56 bg-background border border-surface/10 rounded-2xl shadow-xl p-1.5">
                {funnel.is_published && (
                  <a
                    href={`/f/${funnel.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" /> Voir la page publique
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onTogglePublish(funnel); }}
                  disabled={busy === 'publish'}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left disabled:opacity-50"
                >
                  {funnel.is_published ? <EyeOff className="w-4 h-4 shrink-0" /> : <Rocket className="w-4 h-4 shrink-0" />}
                  {busy === 'publish' ? 'En cours...' : funnel.is_published ? 'Dépublier' : 'Publier'}
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDuplicate(funnel); }}
                  disabled={busy === 'duplicate'}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left disabled:opacity-50"
                >
                  <Copy className="w-4 h-4 shrink-0" /> {busy === 'duplicate' ? 'Duplication...' : 'Dupliquer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onPublishAsTemplate(funnel); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left"
                >
                  <Store className="w-4 h-4 shrink-0" /> Publier comme modèle
                </button>
                <div className="my-1 border-t border-surface/10" />
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(funnel); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/5 text-left"
                >
                  <Trash2 className="w-4 h-4 shrink-0" /> Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, effectiveOwnerId, effectiveProfile } = useAuth();
  const [funnels, setFunnels] = useState(null);
  const [leads7d, setLeads7d] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [revenue30d, setRevenue30d] = useState([]);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [templateModalFunnel, setTemplateModalFunnel] = useState(null);
  const confirm = useConfirm();
  const toast = useToast();

  const plan = getPlan(effectiveProfile?.plan);
  const atLimit = funnels && funnels.length >= plan.maxFunnels;
  const publishedCount = funnels ? funnels.filter((f) => f.is_published).length : 0;

  const load = async () => {
    try {
      // Les 3 appels ne dépendent que de effectiveOwnerId (déjà connu) —
      // aucun n'a besoin du résultat d'un autre, donc tous en parallèle
      // plutôt qu'un chargement des tunnels suivi d'un aller-retour de plus.
      const [data, leadsData, totalViewsData] = await Promise.all([
        fetchUserFunnels(effectiveOwnerId),
        fetchLeadsForUser(effectiveOwnerId),
        fetchTotalViewsForOwner(),
      ]);
      setFunnels(data);

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      setLeads7d(leadsData.filter((l) => new Date(l.created_at).getTime() >= sevenDaysAgo).length);
      setTotalViews(totalViewsData);

      // Regroupé par devise (plutôt qu'un seul total) : un vendeur pourrait
      // en théorie avoir des ventes dans plusieurs devises selon ses moyens
      // de paiement, additionner directement n'aurait aucun sens.
      const revenueTotals = new Map();
      for (const l of leadsData) {
        if (l.payment_status !== 'paid' || !l.paid_amount || l.refunded_at) continue;
        if (new Date(l.created_at).getTime() < thirtyDaysAgo) continue;
        const currency = l.paid_currency || 'XOF';
        revenueTotals.set(currency, (revenueTotals.get(currency) || 0) + (Number(l.paid_amount) || 0));
      }
      setRevenue30d(Array.from(revenueTotals.entries()));
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

  const handleTogglePublish = async (funnel) => {
    setBusyId(funnel.id);
    setBusyAction('publish');
    try {
      const updated = funnel.is_published ? await unpublishFunnel(funnel.id) : await publishFunnel(funnel.id);
      setFunnels((prev) => prev.map((f) => (f.id === funnel.id ? { ...f, ...updated } : f)));
    } catch (err) {
      toast.error(err.message || "L'action a échoué. Réessaie.");
    }
    setBusyId(null);
    setBusyAction(null);
  };

  const handleDuplicate = async (funnel) => {
    setBusyId(funnel.id);
    setBusyAction('duplicate');
    try {
      const created = await duplicateFunnel(funnel.id);
      setFunnels((prev) => [created, ...prev]);
      toast.success(`"${funnel.name}" dupliqué.`);
    } catch (err) {
      toast.error(err.message || 'La duplication a échoué. Réessaie.');
    }
    setBusyId(null);
    setBusyAction(null);
  };

  const sortedFunnels = funnels ? sortFunnels(funnels, sortBy) : null;

  return (
    <div>
      <GradientBanner
        icon={LayoutDashboard}
        title={`Bonjour, ${(profile?.full_name || profile?.email || '').split(/[\s@]/)[0] || ''} 👋`}
        description={`Plan ${plan.name} — ${funnels ? funnels.length : '…'} / ${plan.maxFunnels === Infinity ? '∞' : plan.maxFunnels} tunnel(s) utilisé(s)`}
        actions={
          atLimit ? (
            <Link to="/app/billing" className="magnetic-btn inline-flex items-center gap-2 bg-background text-primary px-5 py-3 rounded-full text-sm font-semibold">
              <Rocket className="w-4 h-4" /> Passer au plan supérieur
            </Link>
          ) : (
            <Link to="/app/funnels/new" className="magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-5 py-3 rounded-full text-sm font-semibold">
              <span className="relative z-10 flex items-center gap-2"><Plus className="w-4 h-4" /> Créer un tunnel</span>
              <div className="fill-layer bg-white/20 rounded-full"></div>
            </Link>
          )
        }
      />

      {funnels && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            icon={Wallet}
            label="Revenu (30 derniers jours)"
            value={revenue30d.length > 0 ? revenue30d.map(([currency, total]) => formatPrice(total, currency)).join(' + ') : formatPrice(0, effectiveProfile?.currency || 'XOF')}
            highlight
          />
          <KpiCard icon={Mail} label="Leads (7 derniers jours)" value={leads7d} />
          <KpiCard icon={Eye} label="Vues totales" value={totalViews} />
          <KpiCard icon={Layers} label="Tunnels actifs" value={`${publishedCount} / ${funnels.length}`} />
        </div>
      )}

      <OnboardingChecklist funnels={funnels} profileId={profile?.id} />

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {funnels === null && !error && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {funnels && funnels.length === 0 && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
          <p className="text-surface/60 mb-4">Tu n'as pas encore de tunnel de vente.</p>
          <Link to="/app/funnels/new" className="text-accent font-semibold hover:underline">Crée ton premier tunnel →</Link>
        </div>
      )}

      {funnels && funnels.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-semibold text-surface">Tes tunnels</h2>
            <SortMenu value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedFunnels.map((funnel, i) => (
              // Une fine barre de couleur en tête de carte, alternée entre
              // accent/primary/surface selon l'index — repère visuel rapide
              // dans une grille de plusieurs tunnels, mêmes couleurs de marque.
              <FunnelCard
                key={funnel.id}
                funnel={funnel}
                index={i}
                busy={busyId === funnel.id ? busyAction : null}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
                onDuplicate={handleDuplicate}
                onPublishAsTemplate={setTemplateModalFunnel}
              />
            ))}
          </div>
        </>
      )}

      {templateModalFunnel && (
        <PublishTemplateModal
          funnelId={templateModalFunnel.id}
          defaultName={templateModalFunnel.name}
          defaultCategory={templateModalFunnel.category}
          onClose={() => setTemplateModalFunnel(null)}
        />
      )}
    </div>
  );
}
