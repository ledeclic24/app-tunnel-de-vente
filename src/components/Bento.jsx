import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MousePointer2, Layers, Wand2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const DiagnosticMixer = () => {
  const [items, setItems] = useState([
    { id: 1, title: 'Décris ton offre' },
    { id: 2, title: 'Choisis un modèle' },
    { id: 3, title: 'Publie en un clic' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        next.unshift(next.pop());
        return next;
      });
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-40 w-full flex flex-col items-center justify-center">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute w-full max-w-[240px] p-4 rounded-xl border font-mono text-sm flex items-center justify-between transition-all duration-700 ${
            index === 0 ? 'border-accent/30 bg-accent/5' : 'border-surface/10 bg-background'
          }`}
          style={{
            transform: `translateY(${index * 14}px) scale(${1 - index * 0.05})`,
            zIndex: 3 - index,
            opacity: 1 - index * 0.25,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span className="text-surface/80">{item.title}</span>
          {index === 0 && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
        </div>
      ))}
    </div>
  );
};

const TelemetryTypewriter = () => {
  const text = '> Page de capture ✓\n> Textes générés ✓\n> Palette appliquée ✓\n> Prêt à publier ✓';
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) setTimeout(() => { i = 0; setDisplayed(''); }, 2500);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-primary/[0.03] rounded-xl p-4 border border-surface/10">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface/10">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
        <span className="font-mono text-[10px] font-semibold tracking-wider text-surface/50 uppercase">Génération en direct</span>
      </div>
      <pre className="font-mono text-xs text-surface/80 whitespace-pre-wrap leading-relaxed">
        {displayed}
        <span className="inline-block w-1.5 h-3 bg-accent ml-1 animate-pulse align-middle" />
      </pre>
    </div>
  );
};

const CursorScheduler = () => {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const dayRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    const ctx = gsap.context(() => {
      gsap.set(cursorRef.current, { x: 0, y: 40, opacity: 0 });
      gsap.set(dayRef.current, { backgroundColor: 'transparent' });
      tl.to(cursorRef.current, { opacity: 1, duration: 0.3 })
        .to(cursorRef.current, { x: 70, y: 10, duration: 0.9, ease: 'power2.inOut' })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 })
        .to(dayRef.current, { backgroundColor: '#22C55E', color: '#0B2818', duration: 0.1 }, '<')
        .to(cursorRef.current, { scale: 1, duration: 0.1 })
        .to(cursorRef.current, { x: 120, y: 75, duration: 0.7, ease: 'power2.inOut', delay: 0.3 })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 })
        .to(btnRef.current, { scale: 0.95, duration: 0.1 }, '<')
        .to(btnRef.current, { scale: 1, duration: 0.1 })
        .to(cursorRef.current, { scale: 1, opacity: 0, duration: 0.3 })
        .to(dayRef.current, { backgroundColor: 'transparent', color: '#0C1F16', duration: 0.3, delay: 0.5 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative h-40 w-full flex flex-col justify-between">
      <div className="grid grid-cols-7 gap-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
          <div
            key={i}
            ref={i === 2 ? dayRef : null}
            className="aspect-square flex items-center justify-center font-mono text-[10px] rounded-md border border-surface/10 bg-background"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <div ref={btnRef} className="px-3 py-1.5 bg-primary text-accent font-sans text-[11px] font-semibold rounded-lg">
          Sauvegarder
        </div>
      </div>
      <div ref={cursorRef} className="absolute top-0 left-0 z-10 pointer-events-none drop-shadow-md">
        <MousePointer2 className="w-4 h-4 text-surface fill-background" />
      </div>
    </div>
  );
};

function Tile({ className = '', children }) {
  return (
    <div className={`bento-tile bg-background border border-surface/10 rounded-2xl p-6 flex flex-col ${className}`}>
      {children}
    </div>
  );
}

export default function Bento() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.bento-tile', {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="produit" ref={containerRef} className="py-20 md:py-28 px-6 md:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Produit</p>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-surface tracking-tight">
            Tout ce qu'il faut pour vendre, rien de superflu.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(0,auto)]">
          <Tile className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6 text-surface/50">
              <Wand2 className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">Assistant guidé</span>
            </div>
            <DiagnosticMixer />
            <h3 className="text-lg font-sans font-semibold text-surface mt-6 mb-1">Un assistant qui construit avec toi</h3>
            <p className="text-sm text-surface/60">Vendeko te pose des questions simples et assemble ton tunnel à ta place, zéro vocabulaire marketing.</p>
          </Tile>

          <Tile>
            <div className="flex items-center gap-2 mb-4 text-surface/50">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">19 modèles</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-6xl font-sans font-bold gradient-text-accent">19</span>
            </div>
            <p className="text-sm text-surface/60 mt-4">Répartis en 10 catégories, du lead magnet au programme premium.</p>
          </Tile>

          <Tile>
            <TelemetryTypewriter />
            <h3 className="text-lg font-sans font-semibold text-surface mt-6 mb-1">Généré en un clic</h3>
            <p className="text-sm text-surface/60">Pages et textes assemblés automatiquement, prêts à publier.</p>
          </Tile>

          <Tile>
            <CursorScheduler />
            <h3 className="text-lg font-sans font-semibold text-surface mt-6 mb-1">Lancements programmés</h3>
            <p className="text-sm text-surface/60">Planifie tes envois, Vendeko s'occupe du reste au bon moment.</p>
          </Tile>

          <Tile className="items-center justify-center text-center bg-primary text-background">
            <span className="text-4xl font-serif italic text-accent mb-2">0 code.</span>
            <p className="text-sm text-background/60">Tout se construit par blocs, à la souris.</p>
          </Tile>
        </div>
      </div>
    </section>
  );
}
