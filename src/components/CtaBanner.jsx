import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import ReactiveDotGrid from './ReactiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

export default function CtaBanner() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-banner-content > *',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-primary text-background py-24 md:py-32 px-6 md:px-10 text-center">
      <ReactiveDotGrid color="34,197,94" />
      <div className="cta-banner-content max-w-2xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3.5 py-1.5 rounded-full text-sm font-semibold mb-7">
          <Sparkles className="w-4 h-4" />
          Rejoins les créateurs qui vendent déjà avec Vendeko
        </div>
        <h2 className="font-sans font-bold text-4xl md:text-5xl leading-[1.08] tracking-tight mb-6">
          Prêt à vendre <span className="font-serif italic text-accent">sans te prendre la tête ?</span>
        </h2>
        <p className="text-lg text-background/60 max-w-lg mx-auto mb-10">
          Décris ton offre aujourd'hui, publie ta première page dans la foulée.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            to="/inscription"
            className="magnetic-btn group inline-flex items-center gap-2 gradient-accent text-background px-7 py-4 rounded-xl text-base font-semibold shadow-lg shadow-accent/25"
          >
            Essayer gratuitement
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-background/40">Aucune carte bancaire requise · 1 tunnel gratuit</p>
        </div>
      </div>
    </section>
  );
}
