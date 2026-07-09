import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';
import ReactiveDotGrid from './ReactiveDotGrid';

const ROTATING_WORDS = ['ta formation', 'ton ebook', 'tes séances de coaching', 'tes produits'];

const STATS = [
  { value: '19', label: 'modèles' },
  { value: '0', label: 'ligne de code' },
  { value: '5 min', label: 'pour publier' },
];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const wordRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      gsap.to(wordRef.current, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          setIndex((i) => (i + 1) % ROTATING_WORDS.length);
          gsap.to(wordRef.current, { opacity: 1, duration: 0.3 });
        },
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span ref={wordRef} className="font-serif italic text-accent">
      {ROTATING_WORDS[index]}
    </span>
  );
}

export default function Hero() {
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const btnRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        [badgeRef.current, titleRef.current, subRef.current, btnRef.current, statsRef.current],
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.9, ease: 'power3.out', delay: 0.1 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full pt-36 pb-24 md:pt-44 md:pb-28 px-6 md:px-10 bg-primary overflow-hidden text-center">
      <ReactiveDotGrid color="34,197,94" />
      <div className="max-w-3xl mx-auto relative z-10">
        <div ref={badgeRef} className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3.5 py-1.5 rounded-full text-sm font-semibold mb-7">
          <Sparkles className="w-4 h-4" />
          Génération de tunnel par IA incluse
        </div>

        <h1 ref={titleRef} className="font-sans font-bold text-5xl md:text-6xl lg:text-[3.6rem] leading-[1.08] tracking-tight text-background mb-6">
          Vends <RotatingWord />
          <br />
          sans écrire une ligne de code.
        </h1>

        <p ref={subRef} className="text-xl text-background/60 max-w-xl mx-auto mb-10">
          Décris ton offre, Vendeko assemble pages, textes et mise en page — tu ajustes le reste en un clic.
        </p>

        <div ref={btnRef} className="flex flex-col items-center gap-2">
          <Link
            to="/inscription"
            className="magnetic-btn group inline-flex items-center gap-2 gradient-accent text-background px-6 py-3.5 rounded-xl text-base font-semibold shadow-lg shadow-accent/25"
          >
            Essayer gratuitement
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-background/40">Aucune carte bancaire requise · 1 tunnel gratuit</p>
        </div>

        <div ref={statsRef} className="flex items-center justify-center gap-8 mt-11">
          {STATS.map((s) => (
            <div key={s.label} className="font-mono text-xs text-background/40">
              <span className="block text-base font-sans font-bold text-background mb-0.5">{s.value}</span>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
