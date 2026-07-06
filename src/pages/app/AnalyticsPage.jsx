import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels, fetchFunnelStepsAnalytics } from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';

function FunnelBreakdown({ funnel }) {
  const [steps, setSteps] = useState(null);

  useEffect(() => {
    fetchFunnelStepsAnalytics(funnel.id).then(setSteps).catch(() => setSteps([]));
  }, [funnel.id]);

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans font-semibold text-surface">{funnel.name}</h3>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${funnel.is_published ? 'bg-accent/10 text-accent' : 'bg-surface/10 text-surface/50'}`}>
          {funnel.is_published ? 'Publié' : 'Brouillon'}
        </span>
      </div>

      {!steps && <div className="h-16 flex items-center justify-center"><div className="w-5 h-5 border-2 border-surface/20 border-t-accent rounded-full animate-spin" /></div>}

      {steps && steps.length > 0 && (
        <div className="space-y-4">
          {steps.map((step) => {
            const rate = step.views > 0 ? Math.round((step.leadCount / step.views) * 100) : 0;
            return (
              <div key={step.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-surface/80">{step.name}</span>
                  <span className="font-mono text-xs text-surface/50">{step.views} vue(s) · {step.leadCount} lead(s) · {rate}%</span>
                </div>
                <div className="h-2 bg-surface/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(rate, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [funnels, setFunnels] = useState(null);
  const plan = getPlan(profile?.plan);

  useEffect(() => {
    if (!profile) return;
    fetchUserFunnels(profile.id).then(setFunnels).catch(() => setFunnels([]));
  }, [profile]);

  if (!plan.analytics) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-10 h-10 text-surface/30 mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Statistiques réservées au plan Entreprise</h1>
        <p className="text-surface/60 mb-6">
          Suis le taux de conversion de chacune de tes pages, tunnel par tunnel, avec le plan Entreprise.
        </p>
        <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-6 py-3 rounded-full font-semibold">
          Voir les offres
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-sans font-bold text-surface">Analytique</h1>
      </div>
      <p className="text-surface/60 mb-8">Le taux de conversion de chaque page, pour chacun de tes tunnels.</p>

      {funnels === null && (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-surface/20 border-t-accent rounded-full animate-spin" /></div>
      )}

      {funnels && funnels.length === 0 && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
          <p className="text-surface/60">Crée un tunnel pour voir apparaître ses statistiques ici.</p>
        </div>
      )}

      <div className="space-y-6">
        {funnels && funnels.map((funnel) => <FunnelBreakdown key={funnel.id} funnel={funnel} />)}
      </div>
    </div>
  );
}
