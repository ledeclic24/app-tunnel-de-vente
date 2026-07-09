import React from 'react';
import { Check } from 'lucide-react';
import { getEditableProps, getContentEditableProps, cx } from '../../lib/blockStyle';

const GRID_COLS_CLASS = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' };

export default function PricingBlock({ content, onAdvance, editMode, selectedElement, onSelectElement, onContentChange }) {
  const { heading, plans = [] } = content;
  const gridClass = GRID_COLS_CLASS[Math.min(plans.length, 3)] || '';
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });

  const headingProps = editable('heading', 'text', 'Titre');
  const headingEditable = getContentEditableProps({ editMode, onContentChange, content, field: 'heading' });

  const updatePlan = (i, patch) => {
    const nextPlans = plans.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    onContentChange?.({ ...content, plans: nextPlans });
  };
  const updateFeature = (i, j, text) => {
    const nextFeatures = (plans[i].features || []).map((f, idx) => (idx === j ? text : f));
    updatePlan(i, { features: nextFeatures });
  };
  const singleLine = (onCommit) => ({
    contentEditable: editMode,
    suppressContentEditableWarning: true,
    onClick: (e) => editMode && e.stopPropagation(),
    onBlur: (e) => editMode && onCommit(e.currentTarget.textContent ?? ''),
    onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } },
  });

  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-5xl mx-auto">
      {heading && (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl text-surface text-center mb-10 outline-none', headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...headingEditable}
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
              <h3 className="font-sans text-xl mb-2 outline-none" {...singleLine((v) => updatePlan(i, { name: v }))}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold outline-none" {...singleLine((v) => updatePlan(i, { price: v }))}>{plan.price}</span>
                <span className={cx(plan.highlight ? 'text-background/60 text-sm' : 'text-surface/60 text-sm', 'outline-none')} {...singleLine((v) => updatePlan(i, { period: v }))}>{plan.period}</span>
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
                    <span className={cx(plan.highlight ? 'text-background/90' : 'text-surface/80', 'outline-none')} {...singleLine((v) => updateFeature(i, j, v))}>{feat}</span>
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
