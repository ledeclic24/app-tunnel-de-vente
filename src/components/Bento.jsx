import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReactiveDotGrid from './ReactiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { id: 'models', value: 19, numeric: true, label: "Modèles prêts à l'emploi" },
  { id: 'click', value: '1 clic', numeric: false, label: 'Pour générer un tunnel complet' },
  { id: 'code', value: 0, numeric: true, label: 'Ligne de code requise' },
  { id: 'time', value: '5 min', numeric: false, label: 'Pour publier ta première page' },
];

const FEATURES = [
  {
    id: '01',
    title: 'Assistant guidé',
    desc: 'Vendeko te pose des questions simples et assemble ton tunnel à ta place, zéro vocabulaire marketing.',
  },
  {
    id: '02',
    title: 'Modèles couvrant 10 catégories',
    desc: "Du lead magnet au programme premium, un point de départ pour chaque type d'offre.",
  },
  {
    id: '03',
    title: 'Génération par IA',
    desc: 'Textes et pages assemblés automatiquement, prêts à publier sans relecture interminable.',
  },
  {
    id: '04',
    title: 'Lancements programmés',
    desc: 'Planifie tes envois à l’avance, Vendeko s’occupe du reste au bon moment.',
  },
];

const STAT_BORDER = [
  '',
  'border-l border-background/10 pl-8 md:pl-10',
  'md:border-l md:border-background/10 md:pl-10',
  'border-l border-background/10 pl-8 md:pl-10',
];

function CountUp({ to }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const counter = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        val: to,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(counter.val); },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
    return () => ctx.revert();
  }, [to]);

  return <span ref={ref}>0</span>;
}

function StatItem({ stat, index }) {
  return (
    <div className={`stat-item ${STAT_BORDER[index]}`}>
      <p className="text-4xl md:text-5xl font-serif text-background leading-none">
        {stat.numeric ? <CountUp to={stat.value} /> : stat.value}
      </p>
      <span className="stat-bar block h-[2px] w-8 bg-accent/70 mt-4 origin-left" />
      <p className="font-mono text-[11px] uppercase tracking-wider text-background/45 leading-relaxed mt-3 max-w-[9rem]">
        {stat.label}
      </p>
    </div>
  );
}

export default function Bento() {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.product-header > *',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.product-header', start: 'top 80%' } }
      );

      gsap.fromTo(
        '.stat-item',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.stats-row', start: 'top 82%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' },
        }
      );

      gsap.fromTo(
        '.stat-bar',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power2.out', scrollTrigger: { trigger: '.stats-row', start: 'top 82%' } }
      );

      gsap.fromTo(
        '.divider-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: 'power2.inOut', scrollTrigger: { trigger: '.divider-line', start: 'top 90%' } }
      );

      gsap.fromTo(
        '.feature-item',
        { x: -16, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.feature-list', start: 'top 80%', end: 'bottom 30%', toggleActions: 'play reverse play reverse' },
        }
      );

      gsap.fromTo(
        '.quote-block',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.quote-block', start: 'top 78%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' },
        }
      );

      gsap.fromTo(
        '.quote-underline',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, delay: 0.4, ease: 'power2.out', scrollTrigger: { trigger: '.quote-block', start: 'top 78%' } }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="produit" ref={containerRef} className="relative overflow-hidden bg-primary text-background py-20 md:py-28 px-6 md:px-10">
      <ReactiveDotGrid color="34,197,94" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="product-header max-w-xl mb-16 md:mb-20">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Produit</p>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-sans font-extrabold tracking-tight text-background">
            Tout ce qu'il faut pour vendre, rien de superflu.
          </h2>
        </div>

        <div className="stats-row grid grid-cols-2 md:grid-cols-4 gap-y-12">
          {STATS.map((stat, i) => (
            <StatItem key={stat.id} stat={stat} index={i} />
          ))}
        </div>

        <div className="divider-line h-px bg-background/10 my-16 md:my-20 origin-left" style={{ transform: 'scaleX(0)' }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16">
          <div className="feature-list lg:col-span-5 flex flex-col gap-1">
            {FEATURES.map((f, i) => (
              <div
                key={f.id}
                onMouseEnter={() => setActive(i)}
                className={`feature-item flex gap-4 rounded-xl px-4 py-4 -mx-4 border-l-2 transition-colors duration-300 cursor-default ${
                  active === i ? 'bg-background/[0.06] border-accent' : 'border-transparent'
                }`}
              >
                <span className="font-mono text-xs text-accent pt-0.5 w-6 shrink-0">{f.id}</span>
                <div>
                  <h4 className={`text-base font-sans font-semibold mb-1 transition-colors duration-300 ${active === i ? 'text-background' : 'text-background/65'}`}>
                    {f.title}
                  </h4>
                  <p
                    className={`text-sm leading-relaxed text-background/55 overflow-hidden transition-all duration-300 ${
                      active === i ? 'max-h-24 opacity-100 mt-0' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="quote-block lg:col-span-7 flex items-center">
            <p className="font-serif italic text-2xl md:text-[2rem] leading-snug text-background/90">
              Chaque fonctionnalité existe pour une seule raison : te faire{' '}
              <span className="relative inline-block not-italic font-sans font-bold text-accent">
                gagner du temps
                <span className="quote-underline absolute left-0 -bottom-1 h-[2px] w-full bg-accent/60 origin-left" style={{ transform: 'scaleX(0)' }} />
              </span>
              , pas te donner plus de boutons à comprendre.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
