import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, X, Minus } from 'lucide-react';
import ReactiveDotGrid from './ReactiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

const COLUMNS = ['Agence web', 'Site classique (Wix, WordPress...)', 'TonTunnel'];

const ROWS = [
  { label: 'Mise en ligne', values: ['2 à 6 semaines', 'Plusieurs jours', '5 minutes'] },
  { label: 'Coût de départ', values: ['500€ à 5000€+', "Abonnement + heures de configuration", 'Gratuit, sans carte'] },
  { label: 'Compétences requises', values: ['Aucune, mais tu dépends du prestataire', 'Design, texte de vente, technique', 'Aucune'] },
  { label: 'Pensé pour vendre', values: [false, false, true] },
  { label: 'Génération par IA', values: [false, false, true] },
  { label: 'Paiement & leads intégrés', values: ['Selon le prestataire', false, true] },
];

function Cell({ value }) {
  if (value === true) return <Check className="w-5 h-5 text-accent mx-auto" />;
  if (value === false) return <X className="w-5 h-5 text-background/25 mx-auto" />;
  return <span className="text-sm text-background/55">{value}</span>;
}

function CellHighlight({ value }) {
  if (value === true) return <Check className="w-5 h-5 text-accent mx-auto" />;
  if (value === false) return <Minus className="w-5 h-5 text-background/30 mx-auto" />;
  return <span className="text-sm font-semibold text-background">{value}</span>;
}

export default function Comparison() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.comparison-header > *',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.comparison-header', start: 'top 80%' } }
      );
      gsap.fromTo(
        '.comparison-table',
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
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="comparison-header max-w-2xl mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">Pourquoi TonTunnel</p>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-surface tracking-tight">
            Plus rapide qu'une agence, <span className="font-serif italic text-accent">plus complet qu'un site classique.</span>
          </h2>
        </div>

        <div className="comparison-table bg-primary rounded-[2rem] p-6 md:p-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="text-left pb-6 pr-4 w-[38%]" />
                {COLUMNS.map((col, i) => (
                  <th
                    key={col}
                    className={`pb-6 px-3 text-sm font-sans font-semibold ${
                      i === 2 ? 'text-accent' : 'text-background/50'
                    }`}
                  >
                    {i === 2 ? (
                      <span className="inline-flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-full">{col}</span>
                    ) : (
                      col
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={row.label} className={ri !== ROWS.length - 1 ? 'border-b border-background/10' : ''}>
                  <td className="py-5 pr-4 text-sm text-background/75 font-medium">{row.label}</td>
                  <td className="py-5 px-3 text-center">
                    <Cell value={row.values[0]} />
                  </td>
                  <td className="py-5 px-3 text-center">
                    <Cell value={row.values[1]} />
                  </td>
                  <td className="py-5 px-3 text-center bg-accent/[0.06] rounded-xl">
                    <CellHighlight value={row.values[2]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
