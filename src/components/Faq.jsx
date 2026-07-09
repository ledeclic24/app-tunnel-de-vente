import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus } from 'lucide-react';
import ReactiveDotGrid from './ReactiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
  {
    q: 'Faut-il savoir coder pour utiliser Vendeko ?',
    a: "Non. Tout se construit par blocs, à la souris : Hero, texte, image, formulaire, tarification... Aucune ligne de code n'est nécessaire, du premier au dernier bloc.",
  },
  {
    q: 'Puis-je commencer gratuitement ?',
    a: 'Oui, le plan Starter est gratuit et permet de publier un tunnel de vente complet avec les blocs essentiels. Aucune carte bancaire requise.',
  },
  {
    q: "Qu'est-ce que la génération de tunnel par IA ?",
    a: 'Décris ton offre en une phrase, Vendeko génère les pages, les textes et une palette de couleurs assortie. Incluse dans les plans Pro (20 générations/mois) et Entreprise (illimité).',
  },
  {
    q: 'Puis-je retirer la mention « Propulsé par Vendeko » ?',
    a: "Oui, à partir du plan Pro, tes tunnels n'affichent plus aucune mention Vendeko.",
  },
  {
    q: 'Puis-je exporter mes leads ?',
    a: "Oui, dès le plan Pro tu as accès à l'historique complet de tes leads et à l'export CSV. Le plan Starter affiche tes 5 derniers leads.",
  },
  {
    q: 'Puis-je changer de plan à tout moment ?',
    a: 'Oui, tu peux passer à un plan supérieur ou revenir au plan gratuit à tout moment depuis ton compte.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-background/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-6 text-left"
      >
        <span className="text-base md:text-lg font-sans font-semibold text-background">{item.q}</span>
        <span
          className={`shrink-0 w-8 h-8 rounded-full bg-background/5 flex items-center justify-center transition-transform duration-300 ${
            isOpen ? 'rotate-45 bg-accent' : ''
          }`}
        >
          <Plus className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-background/60'}`} />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-background/55 leading-relaxed pb-6 max-w-2xl">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const containerRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.faq-header > *',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.faq-header', start: 'top 80%' } }
      );

      gsap.fromTo(
        '.faq-list',
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
    <section ref={containerRef} className="relative overflow-hidden bg-primary text-background py-20 md:py-28 px-6 md:px-10">
      <ReactiveDotGrid color="34,197,94" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="faq-header max-w-2xl mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Questions fréquentes</p>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-background tracking-tight">
            Tout ce que tu te demandes <span className="font-serif italic text-accent">avant de te lancer.</span>
          </h2>
        </div>

        <div className="faq-list border-t border-background/10">
          {FAQS.map((item, i) => (
            <FaqItem key={item.q} item={item} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
