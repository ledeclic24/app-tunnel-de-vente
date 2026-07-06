import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroBlock({ content, onAdvance }) {
  const { eyebrow, heading, subheading, imageUrl, ctaText, externalUrl } = content;

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-primary text-background">
      {imageUrl && (
        <div className="absolute inset-0">
          <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent"></div>
        </div>
      )}
      <div className="relative z-10 px-6 py-16 md:px-16 md:py-24 max-w-3xl">
        {eyebrow && (
          <span className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider">
            {eyebrow}
          </span>
        )}
        <h1 className="font-sans font-bold text-3xl md:text-5xl leading-tight mb-4">{heading}</h1>
        {subheading && <p className="text-background/70 text-lg mb-8 max-w-xl">{subheading}</p>}
        {ctaText && (
          externalUrl ? (
            <a href={externalUrl} target="_blank" rel="noreferrer" className="magnetic-btn btn-fill-slide group relative inline-flex bg-accent text-background px-8 py-4 rounded-full text-base font-medium">
              <span className="relative z-10 flex items-center gap-2">{ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              <div className="fill-layer bg-white/30 rounded-full"></div>
            </a>
          ) : (
            <button onClick={onAdvance} className="magnetic-btn btn-fill-slide group relative bg-accent text-background px-8 py-4 rounded-full text-base font-medium">
              <span className="relative z-10 flex items-center gap-2">{ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              <div className="fill-layer bg-white/30 rounded-full"></div>
            </button>
          )
        )}
      </div>
    </section>
  );
}
