import React from 'react';
import { Play } from 'lucide-react';
import { getSectionBackground, cx } from '../../lib/blockStyle';

// Navigation directe entre les pages vidéo d'un tunnel webinaire (cahier
// des charges "tunnel webinaire") : vignettes cliquables vers des étapes
// précises, choisies explicitement par le créateur (jamais déduites
// implicitement — robuste si l'ordre/le nombre d'étapes change).
export default function VideoNavBlock({ content, defaultBg, siblingSteps, onNavigateToStep, currentStepSlug, editMode }) {
  const { targetSlugs = [], labels = [] } = content;
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  if (targetSlugs.length === 0) {
    if (!editMode) return null;
    return (
      <section className={cx('px-6 py-8 md:px-16 max-w-3xl mx-auto text-center', bg.sectionClassName)}>
        <p className={cx('text-sm', bg.isDark ? 'text-background/60' : 'text-surface/50')}>
          Choisis les pages vidéo à afficher dans les réglages de ce bloc.
        </p>
      </section>
    );
  }

  return (
    <section className={cx('px-6 py-8 md:px-16 max-w-3xl mx-auto', bg.sectionClassName)}>
      <div className="flex flex-wrap justify-center gap-3">
        {targetSlugs.map((slug, i) => {
          const step = siblingSteps?.find((s) => s.slug === slug);
          const label = labels[i] || step?.name || `Vidéo ${i + 1}`;
          const isActive = slug === currentStepSlug;
          return (
            <button
              key={slug}
              type="button"
              onClick={editMode ? undefined : () => onNavigateToStep?.(slug)}
              className={cx(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors',
                isActive
                  ? 'bg-accent text-background border-accent'
                  : bg.isDark
                    ? 'border-background/30 text-background/80 hover:border-background'
                    : 'border-surface/20 text-surface/70 hover:border-accent hover:text-accent',
              )}
            >
              <Play className="w-3.5 h-3.5" /> {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
