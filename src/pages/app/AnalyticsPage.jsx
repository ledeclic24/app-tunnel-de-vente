import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels, fetchFunnelStepsAnalytics } from '../../lib/funnelsApi';
import { fetchCategoryBenchmark } from '../../lib/growthApi';
import { getPlan } from '../../lib/plans';
import { getCategory } from '../../lib/funnelTemplates';

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

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
    <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans font-semibold text-surface">{funnel.name}</h3>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${funnel.is_published ? 'bg-accent/10 text-accent' : 'bg-surface/10 text-surface/50'}`}>
          {funnel.is_published ? 'Publié' : 'Brouillon'}
        </span>
      </div>

      {steps === null && (
        <div className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
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
        const steps = await fetchFunnelStepsAnalytics(funnel.id);
        const totalViews = steps.reduce((sum, s) => sum + s.views, 0);
        const totalLeads = steps.reduce((sum, s) => sum + s.leadCount, 0);
        const benchmark = await fetchCategoryBenchmark(funnel.category);
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
    <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans font-semibold text-surface">{funnel.name}</h3>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-surface/10 text-surface/50">
          {category.label}
        </span>
      </div>

      {!data && !error && (
        <div className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
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

export default function AnalyticsPage() {
  const { effectiveOwnerId, effectiveProfile } = useAuth();
  const [funnels, setFunnels] = useState(null);
  const plan = getPlan(effectiveProfile?.plan);

  useEffect(() => {
    if (!effectiveOwnerId) return;
    fetchUserFunnels(effectiveOwnerId).then(setFunnels).catch(() => setFunnels([]));
  }, [effectiveOwnerId]);

  const publishedFunnels = funnels ? funnels.filter((f) => f.is_published) : null;

  return (
    <div>
      <PageHeader
        title="Analytique"
        description="Le parcours de tes visiteurs à travers chaque tunnel, et la performance de tes tunnels publiés comparée à leur secteur."
        className="mb-10"
      />

      <section className="mb-12">
        <h2 className="text-lg font-sans font-bold text-surface mb-1">Parcours client</h2>
        <p className="text-surface/50 text-sm mb-6">
          Le nombre de vues à chaque étape, et le pourcentage de visiteurs perdus d'une étape à l'autre.
        </p>

        {!plan.analytics && (
          <LockedSection
            title="Statistiques réservées au plan Entreprise"
            description="Suis le taux de conversion de chacune de tes pages, tunnel par tunnel, avec le plan Entreprise."
          />
        )}

        {plan.analytics && funnels === null && <Spinner />}

        {plan.analytics && funnels && funnels.length === 0 && (
          <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
            <p className="text-surface/60">Crée un tunnel pour voir apparaître ses statistiques ici.</p>
          </div>
        )}

        {plan.analytics && funnels && funnels.length > 0 && (
          <div className="space-y-6">
            {funnels.map((funnel) => <FunnelJourney key={funnel.id} funnel={funnel} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-sans font-bold text-surface mb-1">Benchmark sectoriel</h2>
        <p className="text-surface/50 text-sm mb-6">
          Compare le taux de conversion de tes tunnels publiés à la moyenne anonymisée de leur catégorie.
        </p>

        {!plan.benchmark && (
          <LockedSection
            title="Benchmark réservé aux plans Pro et Entreprise"
            description="Compare la conversion de tes tunnels à la moyenne anonymisée de leur catégorie, avec le plan Pro ou Entreprise."
          />
        )}

        {plan.benchmark && funnels === null && <Spinner />}

        {plan.benchmark && publishedFunnels && publishedFunnels.length === 0 && (
          <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
            <p className="text-surface/60">Publie un tunnel pour comparer sa conversion à la moyenne du secteur.</p>
          </div>
        )}

        {plan.benchmark && publishedFunnels && publishedFunnels.length > 0 && (
          <div className="space-y-6">
            {publishedFunnels.map((funnel) => <BenchmarkCard key={funnel.id} funnel={funnel} />)}
          </div>
        )}
      </section>
    </div>
  );
}
