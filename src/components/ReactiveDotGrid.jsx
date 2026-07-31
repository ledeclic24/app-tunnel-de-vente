import React, { useEffect, useRef } from 'react';

export default function ReactiveDotGrid({ gap = 36, color = '34,197,94', radius = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const section = canvas.parentElement;
    let dots = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId = null;
    let resizeTimer = null;

    const buildDots = () => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = section;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      canvas.style.width = `${clientWidth}px`;
      canvas.style.height = `${clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      for (let x = gap / 2; x < clientWidth; x += gap) {
        for (let y = gap / 2; y < clientHeight; y += gap) {
          dots.push({ x, y });
        }
      }
    };

    // Un redimensionnement "à la souris" déclenche des dizaines
    // d'évènements resize par seconde — sans ce debounce, chaque instance
    // reconstruisait toute sa grille de points à chaque évènement brut,
    // multiplié par les ~12 sections montées simultanément sur la landing.
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildDots, 120);
    };

    const handleMove = (e) => {
      const rect = section.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouse = { x: -9999, y: -9999 }; };

    const draw = () => {
      const { clientWidth, clientHeight } = section;
      ctx.clearRect(0, 0, clientWidth, clientHeight);
      for (const d of dots) {
        const dist = Math.hypot(d.x - mouse.x, d.y - mouse.y);
        const influence = Math.max(0, 1 - dist / radius);
        const r = 0.7 + influence * 1.6;
        const alpha = 0.06 + influence * 0.3;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (rafId === null) rafId = requestAnimationFrame(draw);
    };
    const stopLoop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    buildDots();

    // Avec une douzaine d'instances de ce composant sur une même landing
    // page, laisser tourner une boucle requestAnimationFrame par section —
    // y compris celles très loin sous le pli (Footer, Pricing...) — coûte
    // du temps CPU/GPU en continu pour rien tant qu'elles ne sont pas
    // visibles, et rivalise avec le scroll pour le budget de la frame.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startLoop();
        else stopLoop();
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(section);

    window.addEventListener('resize', handleResize);
    section.addEventListener('mousemove', handleMove);
    section.addEventListener('mouseleave', handleLeave);

    return () => {
      observer.disconnect();
      stopLoop();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      section.removeEventListener('mousemove', handleMove);
      section.removeEventListener('mouseleave', handleLeave);
    };
  }, [gap, color, radius]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" />;
}
