import React, { useEffect, useState } from 'react';

const PHRASE = 'Un ebook de recettes végétariennes à 12 000 FCFA';

const GEN_STEPS = [
  "analyse de l'offre…",
  'rédaction du texte de vente…',
  'mise en page…',
];

const BLOCKS = [
  { name: 'Hero', tag: 'accroche + image' },
  { name: 'Texte de vente', tag: 'bénéfices, preuve' },
  { name: 'Badges de confiance', tag: 'paiement, garantie' },
  { name: "Bouton d'action", tag: '« Je commande »' },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Valeur affichée dérivée à 100% de l'état déjà utilisé pour l'affichage
// (stepIndex/blockCount/done), jamais d'une horloge réelle (performance.now)
// : sous jank navigateur, un chrono réel peut afficher un nombre incohérent
// avec ce que l'œil voit à l'écran (ex. "6.8s" alors que la frappe vient à
// peine de commencer), ce qui décrédibilise l'outil au lieu de le vendre.
function displaySeconds(stepIndex, blockCount) {
  const milestones = [1.3, 2.1, 2.9, 3.4, 3.8, 4.2, 4.6];
  const reached = stepIndex + 1 + blockCount;
  if (reached <= 0) return null;
  return milestones[Math.min(reached, milestones.length) - 1];
}

// Simulation rejouée en boucle (pas un vrai appel IA) : ce composant sert de
// preuve visuelle immédiate dans la Hero, avant même que le visiteur crée un
// compte — le doute n°1 sur un outil IA ("est-ce que ça marche vraiment ?")
// se lève mieux par une démonstration que par une promesse écrite.
export default function LiveGenerationDemo() {
  const [typed, setTyped] = useState('');
  const [stepIndex, setStepIndex] = useState(-1);
  const [blockCount, setBlockCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Variable locale à CETTE invocation de l'effet (pas une ref partagée) :
    // en StrictMode (dev), React monte/démonte/remonte l'effet immédiatement,
    // et un flag partagé se fait remettre à `true` par le second montage
    // avant que la boucle du premier ait fini de se terminer — les deux
    // boucles tournent alors en parallèle et chaque caractère tapé apparaît
    // en double.
    let alive = true;

    async function runLoop() {
      while (alive) {
        setTyped('');
        setStepIndex(-1);
        setBlockCount(0);
        setDone(false);
        await wait(700);
        if (!alive) return;

        for (let i = 0; i < PHRASE.length; i++) {
          if (!alive) return;
          setTyped((t) => t + PHRASE[i]);
          await wait(26);
        }
        await wait(350);

        for (let s = 0; s < GEN_STEPS.length; s++) {
          if (!alive) return;
          setStepIndex(s);
          await wait(420);
        }

        for (let b = 0; b < BLOCKS.length; b++) {
          if (!alive) return;
          setBlockCount(b + 1);
          await wait(360);
        }

        setDone(true);
        await wait(2400);
      }
    }

    runLoop();
    return () => {
      alive = false;
    };
  }, []);

  const seconds = displaySeconds(stepIndex, blockCount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
      <div className="bg-[#08160f] border border-accent/25 rounded-2xl p-5 font-mono text-[13px] min-h-[260px]">
        <p className="text-background/40 mb-2">&gt; Décris ton offre :</p>
        <p className="text-accent leading-relaxed break-words">
          {typed}
          <span className="blink-cursor inline-block w-[7px] h-[15px] bg-accent align-[-2px]" />
        </p>
        <div className="mt-5 space-y-2">
          {GEN_STEPS.map((s, i) => (
            <p
              key={s}
              className={`transition-opacity duration-300 text-background/35 ${stepIndex >= i ? 'opacity-100' : 'opacity-0'}`}
            >
              → {s}
            </p>
          ))}
          <p className={`transition-opacity duration-300 text-accent font-semibold ${done ? 'opacity-100' : 'opacity-0'}`}>
            ✓ tunnel prêt
          </p>
        </div>
      </div>

      <div className="bg-background rounded-2xl p-4 min-h-[260px] flex flex-col justify-center gap-2.5">
        {BLOCKS.map((b, i) => {
          const show = blockCount > i;
          return (
            <div
              key={b.name}
              className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 border transition-all duration-500 ${
                show ? 'opacity-100 translate-y-0 bg-accent/[0.08] border-accent/30' : 'opacity-0 translate-y-2 border-primary/10 border-dashed'
              }`}
            >
              <div>
                <p className="text-primary font-bold text-[13px]">{b.name}</p>
                <p className="text-primary/45 text-[11px] font-mono">{b.tag}</p>
              </div>
              <span className={`text-accent text-[15px] transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>✓</span>
            </div>
          );
        })}
      </div>

      <p className={`md:col-span-2 text-center font-mono text-[11px] text-background/35 -mt-1 transition-opacity duration-300 ${seconds ? 'opacity-100' : 'opacity-0'}`}>
        {done ? 'Généré en' : 'Temps écoulé :'} <span className="text-accent">{(seconds ?? 0).toFixed(1)}s</span>
      </p>
    </div>
  );
}
