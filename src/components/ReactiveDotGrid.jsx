import React, { useEffect, useRef } from 'react';

export default function ReactiveDotGrid({ gap = 36, color = '34,197,94', radius = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const section = canvas.parentElement;
    let dots = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId;

    const resize = () => {
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

    resize();
    draw();
    window.addEventListener('resize', resize);
    section.addEventListener('mousemove', handleMove);
    section.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      section.removeEventListener('mousemove', handleMove);
      section.removeEventListener('mouseleave', handleLeave);
    };
  }, [gap, color, radius]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" />;
}
