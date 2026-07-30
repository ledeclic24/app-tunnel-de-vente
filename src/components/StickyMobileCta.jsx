import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SHOW_AFTER_PX = 600;
// Sur une page longue, "près du bas" recouvre la bannière CTA + le footer
// (déjà pourvus de leur propre bouton) — pas besoin de coupler ce composant
// à leurs éléments DOM, la position de scroll suffit à éviter le doublon.
const HIDE_NEAR_BOTTOM_PX = 1200;

export default function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;
      const fullH = document.documentElement.scrollHeight;
      const nearBottom = scrollY + viewportH > fullH - HIDE_NEAR_BOTTOM_PX;
      setVisible(scrollY > SHOW_AFTER_PX && !nearBottom);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed left-0 right-0 bottom-0 z-40 flex items-center gap-3 bg-background/95 backdrop-blur-md border-t border-surface/10 shadow-[0_-12px_24px_-12px_rgba(0,0,0,0.15)] px-4 pt-3 transition-transform duration-500 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-surface">Essaie TonTunnel</p>
        <p className="text-[11px] text-surface/50">Gratuit · sans carte bancaire</p>
      </div>
      <Link
        to="/inscription"
        className="magnetic-btn shrink-0 inline-flex items-center gap-1.5 gradient-accent text-background px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap"
      >
        Commencer
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
