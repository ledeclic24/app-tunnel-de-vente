import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Wallet, RefreshCw, Gift } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const POINTS = [
  {
    icon: ShieldCheck,
    title: 'Paiement 100% sécurisé',
    desc: 'Mobile Money et carte bancaire, chiffrés à chaque transaction.',
  },
  {
    icon: Wallet,
    title: 'Tes ventes, ton argent',
    desc: 'Les fonds de tes clients arrivent directement chez toi. TonTunnel ne les touche jamais.',
  },
  {
    icon: RefreshCw,
    title: 'Résiliable à tout moment',
    desc: 'Aucun engagement. Change de plan ou annule en un clic depuis ta facturation.',
  },
  {
    icon: Gift,
    title: 'Sans carte pour démarrer',
    desc: 'Le plan Starter est gratuit et publie un tunnel complet, dès aujourd\'hui.',
  },
];

export default function TrustBar() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.trust-item',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 82%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-16 md:py-20 px-6 md:px-10 bg-background border-t border-surface/5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
        {POINTS.map((p) => (
          <div key={p.title} className="trust-item flex flex-col items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <p.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-sm font-sans font-semibold text-surface">{p.title}</h3>
            <p className="text-sm text-surface/55 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
