import React, { useState } from 'react';
import { X, Monitor, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import BlockRenderer from '../blocks/BlockRenderer';
import { brandStyleVars } from '../../lib/colorUtils';

export default function FunnelPreviewModal({ funnel, steps, blocksByStepId, onClose }) {
  const [device, setDevice] = useState('desktop');
  const [stepId, setStepId] = useState(steps[0]?.id || null);

  const idx = steps.findIndex((s) => s.id === stepId);
  const currentStep = idx >= 0 ? steps[idx] : steps[0];
  const blocks = currentStep ? blocksByStepId[currentStep.id] || [] : [];

  const goTo = (i) => { if (i >= 0 && i < steps.length) setStepId(steps[i].id); };

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

      <div className="flex-1 overflow-y-auto py-8 px-4">
        {!currentStep ? (
          <p className="text-center text-sm text-surface/40 py-12">Ce tunnel n'a encore aucune page.</p>
        ) : (
          <div
            className={device === 'mobile' ? 'max-w-[380px] mx-auto border border-surface/10 rounded-[2rem] overflow-hidden' : 'max-w-4xl mx-auto'}
            style={brandStyleVars(funnel.brand)}
          >
            <div className={device === 'mobile' ? 'p-4 space-y-4' : 'space-y-6'}>
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
          </div>
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
