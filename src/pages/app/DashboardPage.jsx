import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, ExternalLink, Pencil, Trash2, Rocket, Mail, Eye, Layers, CheckCircle2, Circle, LayoutDashboard, Wallet,
  MoreHorizontal, EyeOff, Copy, Store, Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchUserFunnels, deleteFunnel, fetchLeadsForUser, fetchTotalViewsForOwner,
  publishFunnel, unpublishFunnel, duplicateFunnel, fetchSteps, fetchAllBlocksForFunnel,
} from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';
import { formatPrice } from '../../lib/currency';
import { getCategory, CATEGORIES } from '../../lib/funnelTemplates';
import { useClickOutside } from '../../lib/useClickOutside';
import { useConfirm } from '../../components/app/ConfirmDialog';
import { useToast } from '../../components/app/Toast';
import GradientBanner from '../../components/ui/GradientBanner';
import Spinner from '../../components/app/Spinner';
import SortMenu from '../../components/app/SortMenu';
import DateRangeFilter, { resolveDateRange, filterByDateRange } from '../../components/app/DateRangeFilter';
import PublishTemplateModal from '../../components/app/PublishTemplateModal';
import FunnelPreviewModal from '../../components/app/FunnelPreviewModal';
import NouveautesBanner from '../../components/app/NouveautesBanner';

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Création (récent)' },
  { value: 'created_asc', label: 'Création (ancien)' },
  { value: 'updated_desc', label: 'Modification (récent)' },
  { value: 'updated_asc', label: 'Modification (ancien)' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Toutes les catégories' },
  ...CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'published', label: 'Publiés' },
  { value: 'draft', label: 'Brouillons' },
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
function FunnelCard({
  funnel, index, busy, isSelected, onToggleSelect, isMenuOpen, onOpenMenu, onCloseMenu,
  onDelete, onTogglePublish, onDuplicate, onPublishAsTemplate, onPreview,
}) {
  const category = getCategory(funnel.category);
  const menuRef = useClickOutside(isMenuOpen, onCloseMenu);

  return (
    // Pas de overflow-hidden ici : ça clipperait aussi le menu ⋯ en
    // position absolute (invisible bien que présent dans le DOM, cliquable
    // via l'automatisation mais rien à voir pour un vrai visiteur — bug
    // trouvé après coup). La barre de couleur se charge elle-même de
    // respecter l'arrondi du haut de la carte (rounded-t-[2rem]).
    <div className={`bg-background border rounded-[2rem] shadow-soft flex flex-col ${isSelected ? 'border-accent' : 'border-surface/10'}`}>
      <div className={`h-1.5 rounded-t-[2rem] ${['bg-accent', 'bg-primary', 'bg-surface/30'][index % 3]}`} />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start gap-2.5 mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(funnel.id)}
            className="w-4 h-4 mt-1 rounded cursor-pointer accent-accent shrink-0"
            aria-label="Sélectionner ce tunnel"
          />
          <h3 className="font-sans font-semibold text-surface pr-2 flex-1 min-w-0 truncate">{funnel.name}</h3>
          <span className={`shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${funnel.is_published ? 'bg-green-500/10 text-green-600' : 'bg-surface/10 text-surface/50'}`}>
            {funnel.is_published ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <p className="text-xs text-surface/40 font-mono mb-2 pl-[26px]">/{funnel.slug}</p>
        <div className="flex items-center gap-2 mb-6 text-xs text-surface/40 pl-[26px]">
          <span className="px-2 py-0.5 rounded-full bg-surface/5 text-surface/50">{category.label}</span>
          <span>Modifié {formatRelativeDate(funnel.updated_at)}</span>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Link to={`/app/funnels/${funnel.id}/edit`} className="hover-lift flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background text-sm font-medium">
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </Link>
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => (isMenuOpen ? onCloseMenu() : onOpenMenu(funnel.id))}
              className="hover-lift p-2.5 rounded-xl border border-surface/10 text-surface/60"
              aria-label="Plus d'actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <div className="absolute z-30 mt-2 right-0 w-56 bg-background border border-surface/10 rounded-2xl shadow-xl p-1.5">
                <button
                  type="button"
                  onClick={() => { onCloseMenu(); onPreview(funnel); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left"
                >
                  <Eye className="w-4 h-4 shrink-0" /> Aperçu
                </button>
                {funnel.is_published && (
                  <a
                    href={`/f/${funnel.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={onCloseMenu}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" /> Voir la page publique
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => { onCloseMenu(); onTogglePublish(funnel); }}
                  disabled={busy === 'publish'}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left disabled:opacity-50"
                >
                  {funnel.is_published ? <EyeOff className="w-4 h-4 shrink-0" /> : <Rocket className="w-4 h-4 shrink-0" />}
                  {busy === 'publish' ? 'En cours...' : funnel.is_published ? 'Dépublier' : 'Publier'}
                </button>
                <button
                  type="button"
                  onClick={() => { onCloseMenu(); onDuplicate(funnel); }}
                  disabled={busy === 'duplicate'}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left disabled:opacity-50"
                >
                  <Copy className="w-4 h-4 shrink-0" /> {busy === 'duplicate' ? 'Duplication...' : 'Dupliquer'}
                </button>
                <button
                  type="button"
                  onClick={() => { onCloseMenu(); onPublishAsTemplate(funnel); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface/80 hover:bg-surface/5 text-left"
                >
                  <Store className="w-4 h-4 shrink-0" /> Publier comme modèle
                </button>
                <div className="my-1 border-t border-surface/10" />
                <button
                  type="button"
                  onClick={() => { onCloseMenu(); onDelete(funnel); }}
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
  // Filtres persistés dans l'URL (?q=&sort=&date=&from=&to=&category=&status=)
  // plutôt qu'en simple état local : un lien copié ou un retour en arrière
  // navigateur retrouve exactement la même vue, au lieu de tout réinitialiser
  // silencieusement. Valeurs par défaut jamais écrites dans l'URL (gardée
  // propre) — voir l'effet de synchronisation plus bas.
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'created_desc');
  const [datePreset, setDatePreset] = useState(() => searchParams.get('date') || 'all');
  const [customStart, setCustomStart] = useState(() => searchParams.get('from') || '');
  const [customEnd, setCustomEnd] = useState(() => searchParams.get('to') || '');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || '');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [templateModalFunnel, setTemplateModalFunnel] = useState(null);
  // Un seul menu ⋯ ouvert à la fois (id du tunnel concerné, ou null) — avant,
  // chaque carte gérait son propre état local, donc ouvrir un second menu
  // laissait le premier ouvert (plusieurs menus superposés visibles à la fois).
  const [openMenuId, setOpenMenuId] = useState(null);
  const [previewFunnel, setPreviewFunnel] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
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

  useEffect(() => {
    const next = {};
    if (search.trim()) next.q = search.trim();
    if (sortBy !== 'created_desc') next.sort = sortBy;
    if (datePreset !== 'all') next.date = datePreset;
    if (customStart) next.from = customStart;
    if (customEnd) next.to = customEnd;
    if (categoryFilter) next.category = categoryFilter;
    if (statusFilter !== 'all') next.status = statusFilter;
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, datePreset, customStart, customEnd, categoryFilter, statusFilter]);

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

  const handlePreview = async (funnel) => {
    setPreviewFunnel(funnel);
    setPreviewData(null);
    try {
      const [steps, blocksByStepId] = await Promise.all([
        fetchSteps(funnel.id),
        fetchAllBlocksForFunnel(funnel.id),
      ]);
      setPreviewData({ steps, blocksByStepId });
    } catch {
      toast.error("Impossible de charger l'aperçu. Réessaie.");
      setPreviewFunnel(null);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!(await confirm(`Supprimer ${selectedIds.size} tunnel${selectedIds.size > 1 ? 's' : ''} ? Cette action est irréversible.`))) return;
    setBulkBusy(true);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteFunnel(id);
        setFunnels((prev) => prev.filter((f) => f.id !== id));
      } catch {
        toast.error('Une suppression a échoué. Les autres tunnels sélectionnés ont été traités.');
        break;
      }
    }
    setSelectedIds(new Set());
    setBulkBusy(false);
  };

  const handleBulkPublishToggle = async (publish) => {
    setBulkBusy(true);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const updated = publish ? await publishFunnel(id) : await unpublishFunnel(id);
        setFunnels((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
      } catch {
        toast.error('Une action a échoué. Les autres tunnels sélectionnés ont été traités.');
        break;
      }
    }
    setSelectedIds(new Set());
    setBulkBusy(false);
  };

  const dateRange = resolveDateRange(datePreset, customStart, customEnd);
  let visibleFunnels = funnels || [];
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    visibleFunnels = visibleFunnels.filter((f) => f.name.toLowerCase().includes(q));
  }
  if (categoryFilter) visibleFunnels = visibleFunnels.filter((f) => f.category === categoryFilter);
  if (statusFilter !== 'all') visibleFunnels = visibleFunnels.filter((f) => (statusFilter === 'published' ? f.is_published : !f.is_published));
  visibleFunnels = filterByDateRange(visibleFunnels, 'created_at', dateRange);
  const sortedFunnels = funnels ? sortFunnels(visibleFunnels, sortBy) : null;

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

      <NouveautesBanner profileId={profile?.id} />
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-sans font-semibold text-surface">Tes tunnels</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-surface/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un tunnel..."
                  className="bg-surface/5 border border-transparent rounded-full pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-accent/30 transition-colors text-surface w-40 focus:w-52"
                />
              </div>
              <div className="flex items-center gap-1 bg-surface/5 rounded-full p-1">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setStatusFilter(o.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === o.value ? 'bg-primary text-background' : 'text-surface/60'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <SortMenu value={categoryFilter} onChange={setCategoryFilter} options={CATEGORY_OPTIONS} />
              <DateRangeFilter
                preset={datePreset}
                onPresetChange={setDatePreset}
                customStart={customStart}
                customEnd={customEnd}
                onCustomChange={(start, end) => { setCustomStart(start); setCustomEnd(end); }}
              />
              <SortMenu value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 bg-accent/5 border border-accent/20 rounded-2xl px-4 py-3 mb-4">
              <span className="text-xs font-semibold text-surface/60">{selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}</span>
              <button onClick={() => handleBulkPublishToggle(true)} disabled={bulkBusy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent disabled:opacity-50">
                <Rocket className="w-3.5 h-3.5" /> Publier
              </button>
              <button onClick={() => handleBulkPublishToggle(false)} disabled={bulkBusy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface/60 disabled:opacity-50">
                <EyeOff className="w-3.5 h-3.5" /> Dépublier
              </button>
              <button onClick={handleBulkDelete} disabled={bulkBusy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-surface/50 hover:text-surface">
                Tout désélectionner
              </button>
            </div>
          )}

          {sortedFunnels.length === 0 && (
            <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
              <p className="text-surface/60">Aucun tunnel ne correspond à ces filtres.</p>
            </div>
          )}

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
                isSelected={selectedIds.has(funnel.id)}
                onToggleSelect={toggleSelect}
                isMenuOpen={openMenuId === funnel.id}
                onOpenMenu={setOpenMenuId}
                onCloseMenu={() => setOpenMenuId(null)}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
                onDuplicate={handleDuplicate}
                onPublishAsTemplate={setTemplateModalFunnel}
                onPreview={handlePreview}
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

      {previewFunnel && !previewData && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {previewFunnel && previewData && (
        <FunnelPreviewModal
          funnel={previewFunnel}
          steps={previewData.steps}
          blocksByStepId={previewData.blocksByStepId}
          onClose={() => { setPreviewFunnel(null); setPreviewData(null); }}
        />
      )}
    </div>
  );
}
