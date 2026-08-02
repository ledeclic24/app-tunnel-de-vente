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
    <section ref={containerRef} className="relative overflow-hidden bg-primary text-background py-24 md:py-32 px-6 md:px-10 text-center md:text-left">
      {/* Desktop seulement : la photo en fond plein cadre. Composition
          volontairement asymétrique (sujet + icônes de croissance à droite,
          fond uni à gauche déjà présent dans la photo elle-même) — le texte
          s'aligne à gauche pour occuper cet espace plutôt qu'un dégradé
          centré qui masquerait inutilement le sujet. */}
      <img
        src={ctaPhoto}
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-[70%_center]"
      />
      <div
        className="absolute inset-0 hidden md:block"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(90deg, rgb(11 40 24) 0%, rgb(11 40 24) 30%, rgb(11 40 24 / 0.85) 48%, rgb(11 40 24 / 0.25) 68%, rgb(11 40 24 / 0.1) 100%)',
        }}
      />
      <ReactiveDotGrid color="34,197,94" />
      <div className="cta-banner-content max-w-2xl mx-auto md:mx-0 md:max-w-xl relative z-10">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3.5 py-1.5 rounded-full text-sm font-semibold mb-7">
          <Sparkles className="w-4 h-4" />
          Rejoins les créateurs qui vendent déjà avec TonTunnel
        </div>
        <h2 className="font-sans font-bold text-5xl md:text-6xl leading-[1.08] tracking-tight mb-6">
          Prêt à vendre <span className="font-serif italic text-accent">sans te prendre la tête ?</span>
        </h2>
        <p className="text-lg text-background/60 max-w-lg mx-auto md:mx-0 mb-10">
          Décris ton offre aujourd'hui, publie ta première page dans la foulée.
        </p>
        <div className="flex flex-col items-center md:items-start gap-3">
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

        {/* Mobile seulement : le recadrage plein cadre d'une photo pensée
            pour du paysage tombait mal sur un écran portrait (visage ou
            fragments isolés derrière le texte). Plus simple et plus soigné
            de la montrer entière, comme une vraie photo dans une carte,
            sous le texte plutôt qu'en fond forcé derrière lui. */}
        <div className="md:hidden mt-10 rounded-[1.75rem] overflow-hidden border border-background/10 shadow-xl">
          <img src={ctaPhoto} alt="" className="w-full h-auto object-cover aspect-[4/3] object-[68%_18%]" />
        </div>
      </div>
    </section>
  );
}
