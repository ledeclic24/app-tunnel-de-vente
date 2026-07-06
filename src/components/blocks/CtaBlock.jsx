import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CtaBlock({ content, onAdvance }) {
  const { heading, buttonText, externalUrl } = content;
  return (
    <section className="px-6 py-16 md:px-16 md:py-20 text-center">
      {heading && <h2 className="font-serif italic text-3xl md:text-5xl text-surface mb-8">{heading}</h2>}
      {buttonText && (
        externalUrl ? (
          <a href={externalUrl} target="_blank" rel="noreferrer" className="magnetic-btn btn-fill-slide group relative inline-flex bg-accent text-background px-10 py-4 rounded-full text-lg font-medium">
            <span className="relative z-10 flex items-center gap-2">{buttonText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
            <div className="fill-layer bg-white/30 rounded-full"></div>
          </a>
        ) : (
          <button onClick={onAdvance} className="magnetic-btn btn-fill-slide group relative bg-accent text-background px-10 py-4 rounded-full text-lg font-medium">
            <span className="relative z-10 flex items-center gap-2">{buttonText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
            <div className="fill-layer bg-white/30 rounded-full"></div>
          </button>
        )
      )}
    </section>
  );
}
