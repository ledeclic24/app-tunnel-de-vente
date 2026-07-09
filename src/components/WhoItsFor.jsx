import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CATEGORIES } from '../lib/funnelTemplates';
import ReactiveDotGrid from './ReactiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

const FEATURED_KEYS = ['vente', 'ecommerce'];

export default function WhoItsFor() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.who-header > *',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.who-header', start: 'top 80%' } }
      );

      gsap.fromTo(
        '.who-tag',
        { y: 16, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.04,
          duration: 0.5,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative overflow-hidden py-20 md:py-28 px-6 md:px-10 bg-background border-t border-surface/5">
      <ReactiveDotGrid color="34,197,94" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="who-header max-w-2xl mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Pour qui ?</p>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-surface tracking-tight">
            C'est pour toi si tu vends <span className="font-serif italic text-accent">l'un de ces types d'offres.</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full">
          {CATEGORIES.map((cat) => {
            const featured = FEATURED_KEYS.includes(cat.key);
            return (
              <div key={cat.key} className="who-tag">
                <div
                  className={`inline-flex items-center gap-2 rounded-full transition-all duration-300 cursor-default ${
                    featured
                      ? 'bg-accent text-background px-6 py-3.5 text-lg font-bold hover:scale-105'
                      : 'bg-background border border-surface/12 text-surface/70 px-4 py-2.5 text-sm font-semibold hover:border-accent hover:text-surface hover:-translate-y-0.5'
                  }`}
                >
                  <cat.icon className={`shrink-0 ${featured ? 'w-5 h-5' : 'w-3.5 h-3.5'}`} />
                  {cat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
