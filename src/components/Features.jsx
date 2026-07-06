import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MousePointer2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Card 1: Melangeur Diagnostique — assistant guidé, zéro jargon marketing
const DiagnosticMixer = () => {
  const [items, setItems] = useState([
    { id: 1, title: 'Décris ton offre', color: 'border-accent/30', bg: 'bg-accent/5' },
    { id: 2, title: 'Choisis un modèle', color: 'border-surface/10', bg: 'bg-background' },
    { id: 3, title: 'Publie en un clic', color: 'border-surface/10', bg: 'bg-background' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const newArray = [...prev];
        const last = newArray.pop();
        newArray.unshift(last);
        return newArray;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-48 w-full flex flex-col items-center justify-center p-4">
      {items.map((item, index) => {
        const isFirst = index === 0;

        return (
          <div
            key={item.id}
            className={`absolute w-full max-w-[200px] p-4 rounded-2xl border transition-all duration-700 font-mono text-sm flex items-center justify-between ${item.color} ${item.bg}`}
            style={{
              transform: `translateY(${index * 16}px) scale(${1 - index * 0.05})`,
              zIndex: 3 - index,
              opacity: 1 - index * 0.2,
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <span className="text-surface/80">{item.title}</span>
            {isFirst && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
          </div>
        );
      })}
    </div>
  );
};

// Card 2: Machine a Ecrire Telemetrie — tunnel complet généré en un clic
const TelemetryTypewriter = () => {
  const text = "> Page de capture ✓\n> Séquence email ✓\n> Page de vente ✓\n> Paiement connecté ✓";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        setTimeout(() => { i = 0; setDisplayedText(""); }, 3000);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-primary/5 rounded-2xl p-4 overflow-hidden relative border border-surface/10">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-surface/10">
        <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
        <span className="font-mono text-xs font-semibold tracking-wider text-surface/60 uppercase">Flux en Direct</span>
      </div>
      <pre className="font-mono text-sm text-surface whitespace-pre-wrap leading-relaxed">
        {displayedText}
        <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse align-middle" />
      </pre>
    </div>
  );
};

// Card 3: Planificateur Protocole Curseur — programme tes lancements et relances
const CursorScheduler = () => {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const dayRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    const ctx = gsap.context(() => {
      gsap.set(cursorRef.current, { x: 0, y: 50, opacity: 0 });
      gsap.set(dayRef.current, { backgroundColor: 'transparent' });

      tl.to(cursorRef.current, { opacity: 1, duration: 0.3 })
        .to(cursorRef.current, { x: 80, y: 15, duration: 1, ease: 'power2.inOut' })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 })
        .to(dayRef.current, { backgroundColor: '#7B61FF', color: '#0A0A14', duration: 0.1 }, "<")
        .to(cursorRef.current, { scale: 1, duration: 0.1 })
        .to(cursorRef.current, { x: 140, y: 90, duration: 0.8, ease: 'power2.inOut', delay: 0.3 })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 })
        .to(btnRef.current, { scale: 0.95, duration: 0.1 }, "<")
        .to(btnRef.current, { scale: 1, duration: 0.1 })
        .to(cursorRef.current, { scale: 1, opacity: 0, duration: 0.3 })
        .to(dayRef.current, { backgroundColor: 'transparent', color: '#18181B', duration: 0.3, delay: 0.5 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative h-48 w-full p-4 flex flex-col justify-between">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
          <div
            key={i}
            ref={i === 2 ? dayRef : null}
            className="aspect-square flex items-center justify-center font-mono text-xs rounded-lg border border-surface/10 bg-background"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-auto">
        <div ref={btnRef} className="px-4 py-2 bg-primary text-accent font-sans text-xs font-semibold rounded-lg">
          Sauvegarder
        </div>
      </div>

      <div ref={cursorRef} className="absolute top-0 left-0 z-10 pointer-events-none drop-shadow-md">
        <MousePointer2 className="w-5 h-5 text-surface fill-background" />
      </div>
    </div>
  );
};

export default function Features() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={containerRef} className="py-24 md:py-32 px-6 md:px-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="feature-card bg-background border border-surface/10 rounded-[2rem] p-8 shadow-xl shadow-surface/5 flex flex-col">
            <div className="mb-8 flex-grow">
              <DiagnosticMixer />
            </div>
            <h3 className="text-xl font-sans text-surface mb-2">Un assistant guidé, zéro jargon</h3>
            <p className="text-surface/70 text-sm font-sans">Vendeko te pose des questions simples et construit ton tunnel à ta place, sans vocabulaire marketing.</p>
          </div>

          {/* Card 2 */}
          <div className="feature-card bg-background border border-surface/10 rounded-[2rem] p-8 shadow-xl shadow-surface/5 flex flex-col">
            <div className="mb-8 h-48">
              <TelemetryTypewriter />
            </div>
            <h3 className="text-xl font-sans text-surface mb-2">Ton tunnel généré en un clic</h3>
            <p className="text-surface/70 text-sm font-sans">Pages, emails et paiement assemblés automatiquement — rien à coder, rien à configurer.</p>
          </div>

          {/* Card 3 */}
          <div className="feature-card bg-background border border-surface/10 rounded-[2rem] p-8 shadow-xl shadow-surface/5 flex flex-col">
            <div className="mb-8">
              <CursorScheduler />
            </div>
            <h3 className="text-xl font-sans text-surface mb-2">Lancements programmés</h3>
            <p className="text-surface/70 text-sm font-sans">Planifie tes envois et relances à l'avance, Vendeko s'occupe du reste au bon moment.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
