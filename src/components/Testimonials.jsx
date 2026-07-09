import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';
import ReactiveDotGrid from './ReactiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  { name: 'Aïcha D.', role: 'Formatrice en ligne', quote: "J'ai publié mon premier tunnel en 20 minutes, sans jamais avoir codé de ma vie." },
  { name: 'Kevin M.', role: 'Coach sportif', quote: "L'assistant m'a posé 5 questions et ma page était prête. Bluffant." },
  { name: 'Sophie L.', role: 'Créatrice de bijoux', quote: 'Enfin un outil qui ne me noie pas dans des options que je ne comprends pas.' },
  { name: 'Yannick P.', role: 'Consultant indépendant', quote: 'Mes leads ont doublé le premier mois, juste avec le modèle par défaut.' },
  { name: 'Léa B.', role: 'Photographe', quote: "La génération IA a écrit un texte de vente meilleur que ce que j'aurais fait moi-même." },
  { name: 'Malik R.', role: 'Vendeur e-commerce', quote: 'Rapide, propre, et un support qui répond en quelques heures. Je recommande.' },
  { name: 'Chloé T.', role: 'Créatrice de contenu', quote: "Je n'ai plus besoin d'un développeur pour tester une nouvelle offre." },
  { name: 'Hugo F.', role: "Organisateur d'événements", quote: "Le modèle « Évènement » a rempli ma soirée en une semaine." },
  { name: 'Nadia S.', role: 'Coach en reconversion', quote: "Interface hyper claire, même pour quelqu'un qui n'a jamais vendu en ligne." },
];

function Avatar({ name }) {
  return (
    <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-bold shrink-0">
      {name.charAt(0)}
    </div>
  );
}

function Card({ t }) {
  return (
    <div className="w-[300px] md:w-[340px] shrink-0 bg-background border border-surface/10 rounded-2xl p-6">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-sm text-surface/75 leading-relaxed mb-5 min-h-[4.5rem]">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <Avatar name={t.name} />
        <div>
          <p className="text-sm font-semibold text-surface">{t.name}</p>
          <p className="text-xs text-surface/45">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.testimonials-header > *',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.testimonials-header', start: 'top 80%' } }
      );
      gsap.fromTo(
        '.testimonial-row',
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
    <section ref={containerRef} className="relative overflow-hidden py-20 md:py-28 px-6 md:px-10 bg-background border-t border-surface/5">
      <ReactiveDotGrid color="34,197,94" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="testimonials-header max-w-2xl mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Ils utilisent Vendeko</p>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-surface tracking-tight">Des débutants, pas des experts marketing.</h2>
        </div>
      </div>

      <div className="testimonial-row marquee-mask overflow-hidden relative z-10">
        <div className="testimonial-marquee-track gap-6">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <Card key={`${t.name}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
