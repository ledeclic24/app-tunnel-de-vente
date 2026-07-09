import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageSquareText, LayoutTemplate, Rocket } from 'lucide-react';
import ReactiveDotGrid from './ReactiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { id: '01', icon: MessageSquareText, title: 'Décris ton offre', desc: "En langage naturel, sans configuration ni jargon. Vendeko comprend ce que tu vends." },
  { id: '02', icon: LayoutTemplate, title: 'Choisis ton tunnel', desc: 'Vendeko assemble automatiquement pages, textes et mise en page pour toi.' },
  { id: '03', icon: Rocket, title: 'Lance & vends', desc: 'Suis tes ventes en direct, sans aucune compétence technique requise.' },
];

export default function Protocol() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.protocol-header > *',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.protocol-header', start: 'top 80%' } }
      );

      gsap.fromTo(
        '.protocol-step',
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' },
        }
      );

      gsap.fromTo(
        '.protocol-icon',
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: 0.14,
          duration: 0.6,
          delay: 0.2,
          ease: 'back.out(1.8)',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="comment-ca-marche" ref={containerRef} className="relative overflow-hidden py-20 md:py-28 px-6 md:px-10 bg-background border-t border-surface/5">
      <ReactiveDotGrid color="34,197,94" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="protocol-header max-w-2xl mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Comment ça marche</p>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-surface tracking-tight">Trois étapes, pas une de plus.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.id} className="protocol-step">
              <div className="group relative pl-6 py-1 border-l-2 border-surface/10 hover:border-accent hover:-translate-y-1 transition-all duration-300">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-accent scale-100 group-hover:scale-125 transition-transform duration-300" />
                <p className="font-mono text-xs text-accent mb-3">ÉTAPE {step.id}</p>
                <div className="protocol-icon w-11 h-11 rounded-xl bg-surface/5 group-hover:bg-accent flex items-center justify-center mb-4 transition-colors duration-300">
                  <step.icon className="w-5 h-5 text-surface/40 group-hover:text-background transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-sans font-semibold text-surface mb-2 group-hover:text-accent transition-colors duration-300">{step.title}</h3>
                <p className="text-sm text-surface/60">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
