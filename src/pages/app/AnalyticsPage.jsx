import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, TrendingUp, ArrowRight, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels, fetchFunnelStepsAnalytics, fetchUpsellAnalytics } from '../../lib/funnelsApi';
import { fetchCategoryBenchmark } from '../../lib/growthApi';
import { getPlan } from '../../lib/plans';
import { getCategory } from '../../lib/funnelTemplates';
import { formatPrice } from '../../lib/currency';
import GradientBanner from '../../components/ui/GradientBanner';
import Spinner, { CenteredSpinner } from '../../components/app/Spinner';

function LockedSection({ title, description }) {
  return (
    <div className="text-center py-12 border border-dashed border-surface/20 rounded-[2rem]">
      <Lock className="w-9 h-9 text-surface/30 mx-auto mb-4" />
      <h3 className="text-lg font-sans font-bold text-surface mb-2">{title}</h3>
      <p className="text-surface/60 mb-6 max-w-md mx-auto text-sm">{description}</p>
      <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-6 py-3 rounded-full font-semibold">
        Voir les offres
      </Link>
    </div>
  );
}

function StepNode({ step }) {
  return (
    <div className="flex-shrink-0 w-44 bg-surface/[0.03] border border-surface/10 rounded-2xl p-4 text-center">
      <p className="text-sm font-medium text-surface truncate" title={step.name}>{step.name}</p>
      <p className="text-xs text-surface/50 mt-1.5 font-mono">
        {step.views} vue{step.views > 1 ? 's' : ''}
      </p>
      <p className="text-[11px] text-surface/40 font-mono">
        {step.leadCount} lead{step.leadCount > 1 ? 's' : ''}
      </p>
    </div>
  );
}

function StepArrow({ fromViews, toViews }) {
  const hasData = fromViews > 0;
  const dropPct = hasData ? Math.round((1 - toViews / fromViews) * 100) : null;
  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 px-1">
      {hasData && (
        <span className={`text-[10px] font-mono mb-1 whitespace-nowrap ${dropPct > 0 ? 'text-surface/50' : 'text-accent'}`}>
          {dropPct > 0 ? `-${dropPct}%` : 'stable'}
        </span>
      )}
      <ArrowRight className="w-5 h-5 text-surface/20" />
    </div>
  );
}

function UpsellSection({ funnelId, currency }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let active = true;
    fetchUpsellAnalytics(funnelId)
      .then((data) => { if (active) setRows(data); })
      .catch(() => { if (active) setRows([]); });
    return () => { active = false; };
  }, [funnelId]);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-surface/10 space-y-4">
      <p className="text-xs font-mono uppercase tracking-wider text-surface/40">Acceptation upsell</p>
      {rows.map((r) => (
        <div key={r.stepId} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-surface/80 truncate">{r.stepName}</span>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-surface/50 text-xs font-mono">
              {r.accepted}/{r.views} vue{r.views > 1 ? 's' : ''}
            </span>
            <span className="font-mono text-xs text-accent w-12 text-right">
              {r.views > 0 ? `${(r.acceptanceRate * 100).toFixed(0)}%` : '—'}
            </span>
            {r.revenue > 0 && (
              <span className="text-surface/50 text-xs">{formatPrice(r.revenue, currency)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function FunnelJourney({ funnel }) {
  const [steps, setSteps] = useState(null);

  useEffect(() => {
    let active = true;
    fetchFunnelStepsAnalytics(funnel.id)
      .then((data) => { if (active) setSteps(data); })
      .catch(() => { if (active) setSteps([]); });
    return () => { active = false; };
  }, [funnel.id]);

  const totalViews = steps ? steps.reduce((sum, s) => sum + s.views, 0) : 0;

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans font-semibold text-surface">{funnel.name}</h3>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${funnel.is_published ? 'bg-accent/10 text-accent' : 'bg-surface/10 text-surface/50'}`}>
          {funnel.is_published ? 'Publié' : 'Brouillon'}
        </span>
      </div>

      {steps === null && (
        <div className="h-16 flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}

      {steps && steps.length === 0 && (
        <p className="text-surface/60 text-sm">Ce tunnel n'a pas encore d'étape.</p>
      )}

      {steps && steps.length > 0 && totalViews === 0 && (
        <p className="text-surface/60 text-sm">
          Ce tunnel n'a pas encore reçu de visite. Reviens ici une fois que tu auras partagé son lien.
        </p>
      )}

      {steps && steps.length > 0 && totalViews > 0 && (
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center w-max">
            {steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <StepNode step={step} />
                {i < steps.length - 1 && <StepArrow fromViews={step.views} toViews={steps[i + 1].views} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {steps && steps.length > 0 && <UpsellSection funnelId={funnel.id} currency={funnel.currency} />}
    </div>
  );
}

function BenchmarkCard({ funnel }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const category = getCategory(funnel.category);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        // Indépendants (l'un a besoin de l'id du tunnel, l'autre seulement
        // de sa catégorie) — en parallèle plutôt qu'en série.
        const [steps, benchmark] = await Promise.all([
          fetchFunnelStepsAnalytics(funnel.id),
          fetchCategoryBenchmark(funnel.category),
        ]);
        const totalViews = steps.reduce((sum, s) => sum + s.views, 0);
        const totalLeads = steps.reduce((sum, s) => sum + s.leadCount, 0);
        if (active) {
          setData({
            ownRate: totalViews > 0 ? totalLeads / totalViews : null,
            benchmark,
          });
        }
      } catch {
        if (active) setError(true);
      }
    }
    load();
    return () => { active = false; };
  }, [funnel.id, funnel.category]);

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans font-semibold text-surface">{funnel.name}</h3>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-surface/10 text-surface/50">
          {category.label}
        </span>
      </div>

      {!data && !error && (
        <div className="h-16 flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}

      {error && (
        <p className="text-surface/60 text-sm">Impossible de charger le comparatif pour ce tunnel.</p>
      )}

      {data && data.ownRate === null && (
        <p className="text-surface/60 text-sm">
          Ce tunnel n'a pas encore reçu de visite : pas assez de données pour calculer un taux de conversion.
        </p>
      )}

      {data && data.ownRate !== null && (
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-surface/80">Votre tunnel</span>
              <span className="font-mono text-xs text-accent">{(data.ownRate * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2.5 bg-surface/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(data.ownRate * 100, 100)}%` }} />
            </div>
          </div>

          {data.benchmark.sample_size < 3 ? (
            <p className="text-xs text-surface/40">
              Pas encore assez de données dans la catégorie « {category.label} » pour un comparatif fiable.
            </p>
          ) : (
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-surface/80">Moyenne du secteur « {category.label} »</span>
                <span className="font-mono text-xs text-surface/50">{(data.benchmark.avg_conversion * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2.5 bg-surface/5 rounded-full overflow-hidden">
                <div className="h-full bg-surface/30 rounded-full transition-all" style={{ width: `${Math.min(data.benchmark.avg_conversion * 100, 100)}%` }} />
              </div>
              <p className="text-[11px] text-surface/40 mt-1.5">
                Basé sur {data.benchmark.sample_size} tunnel(s) publié(s) de cette catégorie.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Choix du tunnel AVANT tout affichage de statistiques — l'ancienne version
// chargeait et affichait le parcours + benchmark de TOUS les tunnels d'un
// coup (jusqu'à un appel réseau par tunnel, rendu simultanément) : avec
// quelques dizaines de tunnels la page devenait illisible, et avec des
// centaines, quasi inutilisable pour retrouver un tunnel précis. La
// recherche filtre côté client (liste déjà chargée en entier, même
// principe que le tableau de bord).
function FunnelPicker({ funnels, selectedId, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = search.trim()
    ? funnels.filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase()))
    : funnels;

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-3 shadow-soft lg:sticky lg:top-24">
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 text-surface/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un tunnel..."
          className="w-full bg-surface/5 border border-transparent rounded-full pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-accent/30 transition-colors text-surface"
        />
      </div>
      <div className="max-h-[28rem] overflow-y-auto divide-y divide-surface/5">
        {filtered.length === 0 && (
          <p className="text-sm text-surface/40 text-center py-6">Aucun tunnel ne correspond à cette recherche.</p>
        )}
        {filtered.map((f) => {
          const cat = getCategory(f.category);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-3 text-left rounded-xl transition-colors ${selectedId === f.id ? 'bg-accent/10' : 'hover:bg-surface/5'}`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${selectedId === f.id ? 'text-accent' : 'text-surface'}`}>{f.name}</p>
                <p className="text-xs text-surface/40">{cat.label}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${f.is_published ? 'bg-green-500/10 text-green-600' : 'bg-surface/10 text-surface/50'}`}>
                {f.is_published ? 'Publié' : 'Brouillon'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { effectiveOwnerId, effectiveProfile } = useAuth();
  const [funnels, setFunnels] = useState(null);
  const plan = getPlan(effectiveProfile?.plan);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('tunnel') || '';

  useEffect(() => {
    if (!effectiveOwnerId) return;
    fetchUserFunnels(effectiveOwnerId).then(setFunnels).catch(() => setFunnels([]));
  }, [effectiveOwnerId]);

  const handleSelect = (id) => setSearchParams(id ? { tunnel: id } : {}, { replace: true });
  const selectedFunnel = funnels ? funnels.find((f) => f.id === selectedId) || null : null;
  const hasAccess = plan.analytics || plan.benchmark;

  return (
    <div>
      <GradientBanner
        icon={TrendingUp}
        title="Analytique"
        description="Sélectionne un tunnel pour voir son parcours client et sa performance comparée à son secteur."
        className="mb-10"
      />

      {!hasAccess && (
        <LockedSection
          title="Statistiques réservées aux plans Pro et Entreprise"
          description="Suis le taux de conversion de chacune de tes pages et compare-le à la moyenne de ton secteur, à partir du plan Pro."
        />
      )}

      {hasAccess && funnels === null && <CenteredSpinner />}

      {hasAccess && funnels && funnels.length === 0 && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
          <p className="text-surface/60">Crée un tunnel pour voir apparaître ses statistiques ici.</p>
        </div>
      )}

      {hasAccess && funnels && funnels.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          <FunnelPicker funnels={funnels} selectedId={selectedId} onSelect={handleSelect} />

          {!selectedFunnel && (
            <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
              <p className="text-surface/60">Sélectionne un tunnel dans la liste pour voir ses statistiques.</p>
            </div>
          )}

          {selectedFunnel && (
            <div key={selectedFunnel.id} className="space-y-6">
              {plan.analytics ? (
                <FunnelJourney funnel={selectedFunnel} />
              ) : (
                <LockedSection
                  title="Parcours client réservé au plan Entreprise"
                  description="Suis le taux de conversion de chacune des pages de ce tunnel avec le plan Entreprise."
                />
              )}

              {plan.benchmark && (
                selectedFunnel.is_published ? (
                  <BenchmarkCard funnel={selectedFunnel} />
                ) : (
                  <div className="text-center py-10 border border-dashed border-surface/20 rounded-[2rem]">
                    <p className="text-surface/60 text-sm">Publie ce tunnel pour comparer sa conversion à la moyenne de son secteur.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
