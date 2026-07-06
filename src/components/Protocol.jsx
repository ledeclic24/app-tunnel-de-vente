import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageSquareText, LayoutTemplate, Rocket } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { id: '01', icon: MessageSquareText, title: 'Décris ton offre', desc: "En langage naturel, sans configuration ni jargon. Vendeko comprend ce que tu vends." },
  { id: '02', icon: LayoutTemplate, title: 'Choisis ton tunnel', desc: 'Vendeko assemble automatiquement pages, textes et mise en page pour toi.' },
  { id: '03', icon: Rocket, title: 'Lance & vends', desc: 'Suis tes ventes en direct, sans aucune compétence technique requise.' },
];

export default function Protocol() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.protocol-step', {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="comment-ca-marche" ref={containerRef} className="py-20 md:py-28 px-6 md:px-10 bg-background border-t border-surface/5">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Comment ça marche</p>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-surface tracking-tight">Trois étapes, pas une de plus.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.id} className="protocol-step relative pl-6 border-l-2 border-surface/10">
              <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent" />
              <p className="font-mono text-xs text-accent mb-3">ÉTAPE {step.id}</p>
              <step.icon className="w-6 h-6 text-surface/40 mb-4" />
              <h3 className="text-xl font-sans font-semibold text-surface mb-2">{step.title}</h3>
              <p className="text-sm text-surface/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
