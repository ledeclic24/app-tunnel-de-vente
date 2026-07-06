import React from 'react';
import { Check } from 'lucide-react';
import { getEditableProps, cx } from '../../lib/blockStyle';

const GRID_COLS_CLASS = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' };

export default function PricingBlock({ content, onAdvance, editMode, selectedElement, onSelectElement }) {
  const { heading, plans = [] } = content;
  const gridClass = GRID_COLS_CLASS[Math.min(plans.length, 3)] || '';
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });

  const headingProps = editable('heading', 'text', 'Titre');

  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-5xl mx-auto">
      {heading && (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl text-surface text-center mb-10', headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
        >
          {heading}
        </h2>
      )}
      <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>
        {plans.map((plan, i) => {
          const cardProps = editable(`plan-${i}`, 'card', `Carte "${plan.name || i + 1}"`);
          const buttonProps = editable(`plan-${i}-button`, 'button', `Bouton "${plan.name || i + 1}"`);
          return (
            <div
              key={i}
              className={cx(
                `rounded-[2rem] p-8 border ${plan.highlight ? 'bg-primary text-background border-accent/30 shadow-2xl' : 'bg-background text-surface border-surface/10 shadow-sm'}`,
                cardProps.className
              )}
              style={cardProps.style}
              onClick={cardProps.onClick}
            >
              <h3 className="font-sans text-xl mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={plan.highlight ? 'text-background/60 text-sm' : 'text-surface/60 text-sm'}>{plan.period}</span>
              </div>
              <button
                onClick={editMode ? buttonProps.onClick : onAdvance}
                style={buttonProps.style}
                className={cx(
                  `magnetic-btn w-full py-3 rounded-full font-semibold mb-6 ${plan.highlight ? 'bg-accent text-background' : 'bg-primary text-background'}`,
                  buttonProps.className
                )}
              >
                Choisir cette offre
              </button>
              <div className="space-y-2">
                {(plan.features || []).map((feat, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-accent' : 'text-surface/40'}`} />
                    <span className={plan.highlight ? 'text-background/90' : 'text-surface/80'}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
