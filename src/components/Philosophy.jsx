import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Philosophy() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-6 md:px-10 bg-primary">
      <div ref={textRef} className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-mono uppercase tracking-widest text-accent mb-6">Notre parti pris</p>
        <p className="text-2xl md:text-4xl font-serif italic text-background leading-snug">
          La plupart des créateurs de tunnels visent les experts du marketing.
          Nous visons <span className="text-accent not-italic font-sans font-bold">celles et ceux qui n'ont jamais vendu en ligne.</span>
        </p>
      </div>
    </section>
  );
}
