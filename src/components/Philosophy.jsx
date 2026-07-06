import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Philosophy() {
  const sectionRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        text1Ref.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          }
        }
      );

      gsap.fromTo(
        text2Ref.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          }
        }
      );

      gsap.to('.parallax-bg', {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="philosophy" ref={sectionRef} className="relative py-32 md:py-48 px-6 md:px-16 bg-primary overflow-hidden">
      {/* Parallax Background */}
      <div className="absolute inset-0 w-full h-[120%] -top-[10%] pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop"
          alt="Texture violette bioluminescente"
          className="parallax-bg w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
        <p ref={text1Ref} className="font-sans text-xl md:text-2xl text-background/60 tracking-tight">
          La plupart des créateurs de tunnels se concentrent sur : des templates complexes réservés aux experts du marketing.
        </p>
        <p ref={text2Ref} className="font-serif italic text-4xl md:text-6xl lg:text-7xl text-background leading-tight">
          Nous nous concentrons sur : rendre la vente <span className="text-accent not-italic font-serif glow-text">accessible</span> à qui n'a jamais vendu en ligne.
        </p>
      </div>
    </section>
  );
}
