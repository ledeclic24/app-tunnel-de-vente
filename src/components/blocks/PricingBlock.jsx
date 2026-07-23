import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import { parsePriceAmount } from '../../lib/checkoutApi';
import SlotList, { SlotReadOnly } from './SlotList';
import EditableItemImage from './EditableItemImage';

// Mini-formulaire nom + email affiché avant la redirection vers Moneroo —
// requis par leur API pour initialiser une transaction (voir
// PaymentsService côté backend), impossible de rediriger sans ces infos.
function MonerooCheckoutModal({ planName, onClose, onSubmit }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ name, email });
    } catch {
      setError('Impossible de lancer le paiement pour le moment. Réessaie dans un instant.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-background text-surface rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-sans font-bold text-lg mb-1">{planName}</h3>
        <p className="text-sm text-surface/60 mb-4">Renseigne tes informations pour continuer vers le paiement sécurisé.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom"
            required
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="magnetic-btn w-full flex items-center justify-center gap-2 bg-accent text-background py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Redirection...' : 'Continuer vers le paiement'}
          </button>
        </form>
      </div>
    </div>
  );
}

const GRID_COLS_CLASS = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' };

// Lignes de comparaison partagées entre toutes les offres (cahier des
// charges "tunnel standard" — ancrage de prix + comparaison ✓/✗) : chaque
// ligne s'applique à chaque offre selon comparisonRows[j].values[planIndex],
// à la place de la simple liste plate plan.features quand layout==='comparison'.
function ComparisonRows({ rows, planIndex, highlight }) {
  return (
    <div className="space-y-2">
      {rows.map((row, j) => {
        const included = Boolean(row.values?.[planIndex]);
        return (
          <div key={j} className="flex items-center gap-2 text-sm">
            {included ? (
              <Check className={`w-4 h-4 shrink-0 ${highlight ? 'text-accent' : 'text-accent/70'}`} />
            ) : (
              <X className="w-4 h-4 shrink-0 text-background/30" />
            )}
            <span className={cx(!included && 'line-through opacity-50', highlight ? 'text-background/90' : 'text-background/70')}>
              {row.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function buildDefaultSlots(itemCount) {
  const slots = [];
  for (let i = 0; i < itemCount; i++) slots.push({ id: `field-item-${i}`, kind: 'field', field: `item-${i}` });
  return slots;
}
function isSlotsValid(slots, itemCount) {
  const fieldSlots = slots.filter((s) => s.kind === 'field').map((s) => s.field);
  for (let i = 0; i < itemCount; i++) if (!fieldSlots.includes(`item-${i}`)) return false;
  return fieldSlots.length === itemCount;
}

export default function PricingBlock({ content, onAdvance, onMonerooCheckout, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, plans = [], layout, comparisonRows, slots } = content;
  const isComparison = layout === 'comparison' && (comparisonRows || []).length > 0;
  const gridClass = GRID_COLS_CLASS[Math.min(plans.length, 3)] || '';
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');
  const [checkoutTarget, setCheckoutTarget] = React.useState(null);

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

  const renderItem = (i) => {
    const plan = plans[i];
    if (!plan) return null;
    const cardProps = editable(`plan-${i}`, 'card', `Carte "${plan.name || i + 1}"`);
    const buttonProps = editable(`plan-${i}-button`, 'button', `Bouton "${plan.name || i + 1}"`);
    return (
      <div
        className={cx(
          `hover-card relative rounded-xl p-8 ${plan.highlight ? 'neon-border bg-primary text-background shadow-2xl' : 'bg-block-card text-background border border-accent/20 shadow-sm'}`,
          cardProps.className
        )}
        style={cardProps.style}
        onClick={cardProps.onClick}
      >
        {plan.badge && (
          <span className="absolute -top-3 right-6 bg-accent text-background text-xs font-bold px-3 py-1 rounded-full">
            {plan.badge}
          </span>
        )}
        {plan.imageUrl && (
          <EditableItemImage
            src={plan.imageUrl}
            userId={userId}
            editMode={editMode}
            onChange={(imageUrl) => updatePlan(i, { imageUrl })}
            className="w-full h-auto rounded-xl object-cover mb-5"
          />
        )}
        <h3 className="font-sans text-xl mb-2 outline-none" {...singleLine((v) => updatePlan(i, { name: v }))}>{plan.name}</h3>
        {plan.originalPrice && (
          <span className="block text-sm line-through mb-0.5 text-background/50" {...singleLine((v) => updatePlan(i, { originalPrice: v }))}>
            {plan.originalPrice}
          </span>
        )}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-bold outline-none" {...singleLine((v) => updatePlan(i, { price: v }))}>{plan.price}</span>
          <span className="text-background/60 text-sm outline-none" {...singleLine((v) => updatePlan(i, { period: v }))}>{plan.period}</span>
        </div>
        {(plan.paymentLinks || []).length > 0 ? (
          <div className="space-y-2 mb-6">
            {plan.paymentLinks.map((link, j) => {
              const sharedClassName = cx(
                `magnetic-btn block w-full text-center py-3 rounded-full font-semibold ${j === 0 ? (plan.highlight ? 'bg-accent text-background' : 'bg-primary text-background') : 'border border-background/30 text-background'}`,
                j === 0 ? buttonProps.className : undefined,
              );
              if (link.provider === 'moneroo') {
                return (
                  <button
                    key={j}
                    type="button"
                    onClick={editMode ? buttonProps.onClick : () => setCheckoutTarget({ plan, link })}
                    style={j === 0 ? buttonProps.style : undefined}
                    className={sharedClassName}
                  >
                    {link.method || 'Payer'}
                  </button>
                );
              }
              return (
                <a
                  key={j}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={editMode ? (e) => { e.preventDefault(); buttonProps.onClick?.(e); } : undefined}
                  style={j === 0 ? buttonProps.style : undefined}
                  className={sharedClassName}
                >
                  {link.method || 'Payer'}
                </a>
              );
            })}
          </div>
        ) : (
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
        )}
        {isComparison ? (
          <ComparisonRows rows={comparisonRows} planIndex={i} highlight={plan.highlight} />
        ) : (
          <div className="space-y-2">
            {(plan.features || []).map((feat, j) => (
              <div key={j} className="flex items-center gap-2 text-sm">
                <Check className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-accent' : 'text-accent/70'}`} />
                <span className={cx(plan.highlight ? 'text-background/90' : 'text-background/70', 'outline-none')} {...singleLine((v) => updateFeature(i, j, v))}>{feat}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderField = (field) => {
    const m = /^item-(\d+)$/.exec(field);
    return m ? renderItem(Number(m[1])) : null;
  };

  const effectiveSlots = slots && isSlotsValid(slots, plans.length) ? slots : buildDefaultSlots(plans.length);

  return (
    <section className={cx('px-6 py-16 md:px-16 md:py-24 max-w-5xl mx-auto', bg.sectionClassName)}>
      <div className="gradient-divider w-32 mx-auto mb-10" />
      {heading && (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl text-center mb-10 outline-none', bg.headingClassName, headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...headingEditable}
        >
          {heading}
        </h2>
      )}
      {editMode ? (
        <SlotList
          slots={effectiveSlots}
          onSlotsChange={(next) => onContentChange?.({ ...content, slots: next })}
          renderField={renderField}
          bg={bg}
          userId={userId}
          styles={content.styles}
          editMode={editMode}
          selectedElement={selectedElement}
          onSelectElement={onSelectElement}
        />
      ) : (
        <div className={`stagger-children grid grid-cols-1 gap-6 ${gridClass}`}>
          {effectiveSlots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
        </div>
      )}
      {checkoutTarget && (
        <MonerooCheckoutModal
          planName={checkoutTarget.plan.name}
          onClose={() => setCheckoutTarget(null)}
          onSubmit={async ({ name, email }) => {
            await onMonerooCheckout?.({
              paymentMethodId: checkoutTarget.link.paymentMethodId,
              planName: checkoutTarget.plan.name,
              amount: parsePriceAmount(checkoutTarget.plan.price),
              customerEmail: email,
              customerName: name,
            });
          }}
        />
      )}
    </section>
  );
}
