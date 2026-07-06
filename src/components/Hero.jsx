import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const subRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        [text1Ref.current, text2Ref.current, subRef.current, btnRef.current],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.2
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[100dvh] w-full overflow-hidden bg-primary flex items-end pb-24 md:pb-32 px-6 md:px-16">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop"
          alt="Nébuleuse violette bioluminescente"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl w-full flex flex-col items-start gap-4 text-background">
        <h1 className="flex flex-col items-start leading-[1.1]">
          <span ref={text1Ref} className="font-sans font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight">
            Ton tunnel de vente, au-delà de
          </span>
          <span ref={text2Ref} className="font-serif italic glow-text text-6xl md:text-8xl lg:text-[10rem] text-accent mt-2 md:-mt-4">
            l'expertise.
          </span>
        </h1>

        <p ref={subRef} className="max-w-xl text-background/70 mt-4 text-lg font-sans">
          Vendeko — crée un tunnel de vente complet en quelques minutes, même si tu n'as jamais vendu en ligne.
        </p>

        <Link
          ref={btnRef}
          to="/inscription"
          className="magnetic-btn btn-fill-slide group relative mt-8 bg-accent text-background px-8 py-4 rounded-full text-lg font-medium inline-flex"
        >
          <span className="relative z-10 flex items-center gap-3">
            Essayer gratuitement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </span>
          <div className="fill-layer bg-white/30 rounded-full"></div>
        </Link>
      </div>
    </section>
  );
}
