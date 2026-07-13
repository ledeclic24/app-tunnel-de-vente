import { useEffect, useRef, useState } from 'react';

// Anime chaque section à son entrée dans le viewport (cahier des charges
// "tunnel standard", section 08.2) : IntersectionObserver plutôt qu'une
// dépendance d'animation, cohérent avec le reste du projet qui n'utilise
// que des classes CSS faites main (voir magnetic-btn/fill-layer). Désactivé
// en mode édition pour ne pas gêner l'observateur pendant qu'on clique dans
// l'éditeur (le contenu doit rester visible en permanence).
export default function useScrollReveal(disabled) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(Boolean(disabled));

  useEffect(() => {
    if (disabled) { setVisible(true); return undefined; }
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [disabled]);

  return { ref, className: disabled ? '' : `scroll-reveal${visible ? ' is-visible' : ''}` };
}
