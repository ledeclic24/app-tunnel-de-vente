import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FUNNEL_TEMPLATES } from '../lib/funnelTemplates';
import ReactiveDotGrid from './ReactiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

// Sélection volontairement restreinte parmi les 37 modèles réels (une seule
// source de vérité : FUNNEL_TEMPLATES) — assez large pour montrer la
// diversité des catégories, sans noyer la section dans une longue liste.
const CURATED_KEYS = [
  'capture', 'vente-simple', 'vente-flash', 'lancement-formation',
  'webinaire', 'masterclass-vsl', 'coaching', 'accompagnement-signature',
  'ecommerce', 'bundle-promo', 'evenement', 'quiz',
  'communaute', 'mastermind-premium', 'marque-perso', 'page-liens',
];

const TEMPLATES = CURATED_KEYS
  .map((key) => FUNNEL_TEMPLATES.find((t) => t.key === key))
  .filter(Boolean);

function TemplateCard({ t }) {
  const isFree = t.tier === 'starter';
  return (
    <div className="w-[260px] md:w-[280px] shrink-0 bg-primary border border-background/10 rounded-2xl p-6 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl bg-background/5 flex items-center justify-center">
          <t.icon className="w-5 h-5 text-accent" />
        </div>
        <span
          className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${
            isFree ? 'bg-accent/15 text-accent' : 'bg-background/5 text-background/45'
          }`}
        >
          {isFree ? 'Gratuit' : 'Pro'}
        </span>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-background/35 mb-2">{t.category}</p>
      <h3 className="text-base font-sans font-semibold text-background mb-2 leading-snug">{t.name}</h3>
      <p className="text-sm text-background/55 leading-relaxed">{t.description}</p>
    </div>
  );
}

export default function TemplateShowcase() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.templates-header > *',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.templates-header', start: 'top 80%' } }
      );
      gsap.fromTo(
        '.templates-row',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="modeles" ref={containerRef} className="relative overflow-hidden py-20 md:py-28 px-6 md:px-10 bg-background border-t border-surface/5">
      <ReactiveDotGrid color="34,197,94" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="templates-header max-w-2xl mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">37 modèles, 10 catégories</p>
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-surface tracking-tight">
              Un point de départ <span className="font-serif italic text-accent">pour chaque offre.</span>
            </h2>
          </div>
          <p className="text-sm text-surface/55 max-w-sm">
            De la simple page de capture au tunnel de lancement complet avec paliers de prix — choisis un modèle, l'IA et toi faites le reste.
          </p>
        </div>
      </div>

      <div className="templates-row bg-primary rounded-[2rem] py-10 relative z-10">
        <div className="marquee-mask overflow-hidden">
          <div className="template-marquee-track gap-5">
            {[...TEMPLATES, ...TEMPLATES].map((t, i) => (
              <TemplateCard key={`${t.key}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
