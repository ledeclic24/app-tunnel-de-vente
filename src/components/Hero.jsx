import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';
import EditorPreviewMock from './EditorPreviewMock';

export default function Hero() {
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const btnRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        [badgeRef.current, titleRef.current, subRef.current, btnRef.current],
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.9, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(
        previewRef.current,
        { y: 32, opacity: 0, rotateX: 4 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, ease: 'power3.out', delay: 0.3 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-10 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div ref={badgeRef} className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Génération de tunnel par IA incluse
          </div>

          <h1 ref={titleRef} className="font-sans font-bold text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-tight text-surface mb-6">
            Le tunnel de vente qui se construit
            <span className="font-serif italic text-accent"> pendant que tu décris ton offre.</span>
          </h1>

          <p ref={subRef} className="text-lg text-surface/60 max-w-lg mb-8">
            Vendeko assemble pages, textes et mise en page à partir de ta description — puis tu ajustes tout, à la main ou avec l'IA, sans écrire une ligne de code.
          </p>

          <div ref={btnRef} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              to="/inscription"
              className="magnetic-btn group inline-flex items-center gap-2 gradient-accent text-background px-6 py-3.5 rounded-xl text-base font-semibold shadow-lg shadow-accent/25"
            >
              Essayer gratuitement
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs text-surface/40">Aucune carte bancaire requise · 1 tunnel gratuit</p>
          </div>
        </div>

        <div ref={previewRef} style={{ perspective: '1200px' }}>
          <EditorPreviewMock />
        </div>
      </div>
    </section>
  );
}
