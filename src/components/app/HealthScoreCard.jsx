import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

function scoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 45) return '#f59e0b';
  return '#ef4444';
}

export default function HealthScoreCard({ score, checks, onNavigate }) {
  const [open, setOpen] = useState(false);
  // Un tunnel encore incomplet s'ouvre déplié d'entrée, pour que les
  // prochaines étapes soient visibles sans qu'un débutant ait à découvrir
  // seul qu'un détail se cache derrière ce chevron. `score` vaut d'abord un
  // score "à vide" (voir le debounce de 500ms dans FunnelEditorPage) avant
  // de refléter le vrai contenu — on réagit donc à chaque mise à jour, pas
  // seulement au montage, jusqu'à ce que l'utilisateur touche lui-même le
  // chevron (après quoi son choix prime, même si le score repasse sous le seuil).
  const userToggledRef = useRef(false);
  useEffect(() => {
    if (!userToggledRef.current && score < 50) setOpen(true);
  }, [score]);
  const toggle = () => { userToggledRef.current = true; setOpen((v) => !v); };
  const color = scoreColor(score);
  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-5 mb-4 shadow-soft">
      <button type="button" onClick={toggle} className="hover-lift w-full flex items-center gap-4 text-left">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `conic-gradient(${color} ${score * 3.6}deg, rgb(var(--color-surface) / 0.1) 0deg)` }}
        >
          <div className="w-11 h-11 rounded-full bg-background flex items-center justify-center text-xs font-bold text-surface">
            {score}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface">Score de santé du tunnel</p>
          <p className="text-xs text-surface/50">{passedCount} / {checks.length} points vérifiés — clique pour {open ? 'masquer' : 'voir'} le détail</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-surface/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="mt-4 pt-4 border-t border-surface/10 space-y-2">
          {checks.map((c) => {
            const icon = c.passed ? (
              <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5 ml-1" />
            );
            // Un point manquant rattaché à une page/un bloc précis (voir
            // computeHealthScore) devient cliquable : amène directement à
            // l'endroit à corriger au lieu de rester un simple constat.
            const clickable = !c.passed && Boolean(c.stepId) && Boolean(onNavigate);
            if (clickable) {
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(c)}
                    className="w-full flex items-start gap-2 text-sm text-left group"
                  >
                    {icon}
                    <span className="text-surface/80 group-hover:text-accent transition-colors underline decoration-dotted underline-offset-2">{c.label}</span>
                  </button>
                </li>
              );
            }
            return (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                {icon}
                <span className={c.passed ? 'text-surface/60' : 'text-surface/80'}>{c.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
