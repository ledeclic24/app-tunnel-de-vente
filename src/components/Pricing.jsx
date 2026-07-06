import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { PLANS, PLAN_ORDER, formatPrice } from '../lib/plans';
import { getLivePlans } from '../lib/plansApi';

const DESCRIPTIONS = {
  starter: "Pour découvrir Vendeko et publier ton premier tunnel.",
  createur: "Pour vendre sérieusement, sans jamais toucher au code.",
  entreprise: "Statistiques avancées et accompagnement pour les équipes.",
};

export default function Pricing() {
  const [livePlans, setLivePlans] = useState(PLANS);

  useEffect(() => {
    getLivePlans().then(setLivePlans).catch(() => setLivePlans(PLANS));
  }, []);

  const plans = PLAN_ORDER.map((key) => ({
    name: livePlans[key].name,
    price: formatPrice(livePlans[key].price),
    period: livePlans[key].period,
    desc: DESCRIPTIONS[key],
    features: livePlans[key].features,
    highlight: key === 'createur',
  }));

  return (
    <section id="pricing" className="py-24 md:py-32 px-6 md:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-surface mb-6">
            Vends <span className="font-serif italic font-normal text-accent">sans barrière</span>
          </h2>
          <p className="text-lg text-surface/70 max-w-2xl mx-auto">
            Des plans simples, pensés pour les débutants comme pour ceux qui veulent passer à l'échelle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`
                relative p-8 md:p-10 rounded-[3rem] transition-all duration-300
                ${plan.highlight
                  ? 'bg-primary text-background shadow-2xl scale-100 md:scale-105 z-10 border border-accent/20'
                  : 'bg-background text-surface border border-surface/10 shadow-lg'}
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-background font-mono text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Recommandé
                </div>
              )}

              <h3 className={`text-2xl font-sans mb-2 ${plan.highlight ? 'text-background' : 'text-surface'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-8 ${plan.highlight ? 'text-background/70' : 'text-surface/60'}`}>
                {plan.desc}
              </p>

              <div className="mb-8 flex items-baseline gap-2">
                <span className={`text-5xl font-sans font-bold ${plan.highlight ? 'text-background' : 'text-surface'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? 'text-background/60' : 'text-surface/60'}`}>
                  {plan.period}
                </span>
              </div>

              <Link to="/inscription" className={`
                magnetic-btn w-full py-4 rounded-full font-semibold transition-colors duration-300 flex items-center justify-center gap-2 group
                ${plan.highlight
                  ? 'bg-accent text-background hover:bg-white'
                  : 'bg-primary text-background hover:bg-surface'}
              `}>
                Essayer gratuitement
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="mt-8 space-y-4">
                {plan.features.map((feat, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Check className={`w-5 h-5 ${plan.highlight ? 'text-accent' : 'text-surface/40'}`} />
                    <span className={`text-sm ${plan.highlight ? 'text-background/90' : 'text-surface/80'}`}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
