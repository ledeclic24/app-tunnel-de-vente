import { useEffect, useRef, useState } from 'react';

// Active les étapes d'une timeline numérotée une par une au scroll (au lieu
// de toutes en même temps) : quand une étape entre dans le viewport, elle et
// toutes celles qui la précèdent passent "active" — même logique que le
// code de référence du cahier des charges "dark premium" (IntersectionObserver
// par étape, threshold 0.5). Désactivé en mode édition, comme useScrollReveal.
export default function useSequentialReveal(count, disabled) {
  const itemRefs = useRef([]);
  const [activeUpTo, setActiveUpTo] = useState(disabled ? count - 1 : -1);

  useEffect(() => {
    if (disabled) { setActiveUpTo(count - 1); return undefined; }
    const els = itemRefs.current.slice(0, count);
    if (!els.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = els.indexOf(entry.target);
          if (idx === -1) return;
          setActiveUpTo((prev) => Math.max(prev, idx));
        });
      },
      { threshold: 0.5 },
    );
    els.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count, disabled]);

  const setItemRef = (i) => (el) => { itemRefs.current[i] = el; };

  return { setItemRef, isActive: (i) => i <= activeUpTo };
}
