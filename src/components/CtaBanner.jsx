import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import ReactiveDotGrid from './ReactiveDotGrid';
import { trackAction } from '../lib/analyticsTracker';
import ctaPhoto from '../assets/landing/cta-photo.jpg';

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
      <img
        src={ctaPhoto}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-[78%_45%] opacity-70"
      />
      {/* Même logique que Hero.jsx : dégradé radial qui protège le texte
          central tout en laissant le portrait et les icônes de croissance
          identifiables sur les bords — réglage plus large sur mobile, où
          le texte occupe presque toute la largeur de l'écran. */}
      <div
        className="absolute inset-0 md:hidden"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 68% 85% at 50% 38%, rgb(11 40 24) 0%, rgb(11 40 24 / 0.94) 50%, rgb(11 40 24 / 0.65) 75%, rgb(11 40 24 / 0.15) 100%)',
        }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 40% 85% at 50% 42%, rgb(11 40 24) 0%, rgb(11 40 24 / 0.9) 45%, rgb(11 40 24 / 0.5) 70%, rgb(11 40 24 / 0.1) 100%)',
        }}
      />
      <ReactiveDotGrid color="34,197,94" />
      <div className="cta-banner-content max-w-2xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3.5 py-1.5 rounded-full text-sm font-semibold mb-7">
          <Sparkles className="w-4 h-4" />
          Rejoins les créateurs qui vendent déjà avec TonTunnel
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
            onClick={() => trackAction('cta_click_banner')}
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
