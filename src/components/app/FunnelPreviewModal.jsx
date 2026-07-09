import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Monitor, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import BlockRenderer from '../blocks/BlockRenderer';
import { brandStyleVars } from '../../lib/colorUtils';

// Un simple conteneur rétréci en CSS ne suffit pas à simuler un téléphone : les classes
// Tailwind `md:` évaluent la largeur RÉELLE de la fenêtre du navigateur, pas celle d'une
// div rétrécie. Sans un vrai document au format téléphone, une grille `md:grid-cols-3`
// reste active dans un cadre de 380px et casse la mise en page (colonnes écrasées, un mot
// par ligne). On rend donc l'aperçu mobile dans une iframe : elle a sa propre fenêtre de
// rendu, donc les media queries s'appliquent correctement à sa largeur simulée.
function DeviceFrame({ width, children }) {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc || injectedRef.current) return;
    injectedRef.current = true;

    Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).forEach((node) => {
      doc.head.appendChild(node.cloneNode(true));
    });
    doc.documentElement.style.margin = '0';
    doc.body.style.margin = '0';
    doc.body.className = 'bg-background antialiased';
    setMountNode(doc.body);
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Aperçu de l'appareil"
        style={{ width, maxWidth: '100%', height: '100%', border: 0, display: 'block', background: 'transparent' }}
      />
      {mountNode && createPortal(children, mountNode)}
    </>
  );
}

export default function FunnelPreviewModal({ funnel, steps, blocksByStepId, onClose }) {
  const [device, setDevice] = useState('desktop');
  const [stepId, setStepId] = useState(steps[0]?.id || null);

  const idx = steps.findIndex((s) => s.id === stepId);
  const currentStep = idx >= 0 ? steps[idx] : steps[0];
  const blocks = currentStep ? blocksByStepId[currentStep.id] || [] : [];

  const goTo = (i) => { if (i >= 0 && i < steps.length) setStepId(steps[i].id); };

  const content = (
    <div style={brandStyleVars(funnel.brand)} className={device === 'mobile' ? 'p-4 space-y-4 min-h-full' : 'max-w-4xl mx-auto space-y-6 py-2'}>
      {funnel.brand?.logoUrl && (
        <img src={funnel.brand.logoUrl} alt={funnel.name} className="h-10 mx-auto object-contain" />
      )}
      {blocks.length === 0 ? (
        <p className="text-center text-sm text-surface/40 py-12">Cette page ne contient aucun bloc.</p>
      ) : (
        blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} onAdvance={() => goTo(idx + 1)} />
        ))
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-surface/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onClose} className="p-2 rounded-lg text-surface/50 hover:text-surface" aria-label="Fermer l'aperçu">
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-sans font-semibold text-surface truncate">{funnel.name} — Aperçu</h2>
        </div>
        <div className="flex items-center gap-1 bg-surface/5 rounded-full p-1 shrink-0">
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${device === 'desktop' ? 'bg-primary text-background' : 'text-surface/60'}`}
          >
            <Monitor className="w-4 h-4" /> Ordinateur
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${device === 'mobile' ? 'bg-primary text-background' : 'text-surface/60'}`}
          >
            <Smartphone className="w-4 h-4" /> Mobile
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-b border-surface/10 overflow-x-auto shrink-0">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStepId(s.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${s.id === currentStep?.id ? 'bg-accent/10 text-accent' : 'text-surface/50 hover:text-surface'}`}
          >
            {i + 1}. {s.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4 flex justify-center">
        {!currentStep ? (
          <p className="text-center text-sm text-surface/40 py-12">Ce tunnel n'a encore aucune page.</p>
        ) : device === 'mobile' ? (
          <div className="border border-surface/10 rounded-[2.5rem] overflow-hidden shadow-xl" style={{ width: 390, height: '100%' }}>
            <DeviceFrame width={390}>{content}</DeviceFrame>
          </div>
        ) : (
          <div className="w-full">{content}</div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-surface/10 shrink-0">
        <button
          disabled={idx <= 0}
          onClick={() => goTo(idx - 1)}
          className="flex items-center gap-1 px-4 py-2 rounded-full border border-surface/10 text-sm text-surface/70 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" /> Précédent
        </button>
        <span className="text-xs text-surface/40">{steps.length === 0 ? 0 : idx + 1} / {steps.length}</span>
        <button
          disabled={idx < 0 || idx >= steps.length - 1}
          onClick={() => goTo(idx + 1)}
          className="flex items-center gap-1 px-4 py-2 rounded-full border border-surface/10 text-sm text-surface/70 disabled:opacity-30"
        >
          Suivant <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
