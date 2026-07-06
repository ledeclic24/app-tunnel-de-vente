import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Double hélice en rotation lente
const Pattern1 = () => (
  <div className="w-full h-full flex items-center justify-center">
    <svg className="w-48 h-48 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="50" cy="50" r="40" className="text-accent/40" />
      <circle cx="50" cy="50" r="30" strokeDasharray="4 4" className="text-accent" />
      <circle cx="50" cy="50" r="20" className="text-accent/60" />
      <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" className="text-accent/20" />
    </svg>
  </div>
);

// Ligne laser balayant une grille de points
const Pattern2 = () => {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-8">
      <div className="w-full h-48 relative border border-surface/20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(24, 24, 27, 0.2) 1px, transparent 0)', backgroundSize: '16px 16px' }}>
        <div className="absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_15px_rgba(123,97,255,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};

// Onde pulsante style ECG
const Pattern3 = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg className="w-full max-w-md h-32" viewBox="0 0 200 50" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          d="M0 25 L40 25 L50 10 L60 40 L70 25 L200 25"
          className="text-accent drop-shadow-[0_0_8px_rgba(123,97,255,0.5)]"
          strokeDasharray="200"
          strokeDashoffset="200"
        >
          <animate attributeName="stroke-dashoffset" values="200;0;200" dur="4s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
};

export default function Protocol() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (index === cardsRef.current.length - 1) return;

        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: containerRef.current,
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          scrub: true,
          animation: gsap.to(card, {
            scale: 0.9,
            opacity: 0.5,
            filter: "blur(10px)",
            ease: "none"
          })
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      id: "01",
      title: "Décris ton offre",
      desc: "En langage naturel, sans configuration ni jargon. Vendeko comprend ce que tu vends.",
      Graphic: Pattern1
    },
    {
      id: "02",
      title: "Choisis ton tunnel",
      desc: "Vendeko assemble automatiquement pages, emails et paiement pour toi.",
      Graphic: Pattern2
    },
    {
      id: "03",
      title: "Lance & vends",
      desc: "Suis tes ventes en direct, sans aucune compétence technique requise.",
      Graphic: Pattern3
    }
  ];

  return (
    <section id="protocol" ref={containerRef} className="relative bg-background">
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>

      {steps.map((step, index) => (
        <div
          key={index}
          ref={el => cardsRef.current[index] = el}
          className="h-[100dvh] w-full sticky top-0 flex items-center justify-center p-6 md:p-16 origin-top"
        >
          <div className="w-full max-w-6xl h-full max-h-[80vh] bg-background border border-surface/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">

            <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center border-b md:border-b-0 md:border-r border-surface/10 relative">
              <div className="absolute top-12 left-12 font-mono text-sm tracking-widest text-accent">
                ÉTAPE // {step.id}
              </div>
              <h2 className="text-4xl md:text-5xl font-sans text-surface mb-6 mt-12">{step.title}</h2>
              <p className="text-lg text-surface/70 font-sans max-w-md">{step.desc}</p>
            </div>

            <div className="w-full md:w-1/2 bg-primary/5 flex items-center justify-center relative overflow-hidden">
              <step.Graphic />
            </div>

          </div>
        </div>
      ))}
    </section>
  );
}
