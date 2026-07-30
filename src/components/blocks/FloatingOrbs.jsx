import React from 'react';

// Deux halos flous qui dérivent lentement en arrière-plan (voir .floating-orb
// dans index.css) — le parent doit être `relative overflow-hidden` pour que
// ça reste contenu dans la section. Purement décoratif, jamais au-dessus du
// contenu (pointer-events: none, placé avant le reste du DOM de la section).
export default function FloatingOrbs() {
  return (
    <>
      <div
        className="floating-orb w-72 h-72 bg-accent/30"
        style={{ top: '-15%', left: '-10%', animationDelay: '0s' }}
        aria-hidden="true"
      />
      <div
        className="floating-orb w-56 h-56 bg-accent/25"
        style={{ bottom: '-15%', right: '-8%', animationDelay: '3s' }}
        aria-hidden="true"
      />
    </>
  );
}
