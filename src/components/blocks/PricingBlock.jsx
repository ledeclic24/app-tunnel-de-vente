import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import { parsePriceAmount } from '../../lib/checkoutApi';
import { formatPrice } from '../../lib/currency';
import { applyDiscount } from '../../lib/exitIntentDiscount';
import SlotList, { SlotReadOnly } from './SlotList';
import EditableItemImage from './EditableItemImage';
import FloatingOrbs from './FloatingOrbs';

// Mini-formulaire nom + email affiché avant la redirection vers Moneroo —
// requis par leur API pour initialiser une transaction (voir
// PaymentsService côté backend), impossible de rediriger sans ces infos.
// L'order bump (offre complémentaire optionnelle, jamais cochée par
// défaut) s'affiche ici, juste avant la redirection : c'est le seul moment
// où l'acheteur est déjà engagé dans l'achat sans avoir encore payé.
function MonerooCheckoutModal({ planName, orderBump, currency, initialName, initialEmail, onClose, onSubmit }) {
  // Pré-rempli quand ces infos sont déjà connues (ex. offre upsell juste
  // après un premier achat, voir checkoutPrefill/getCheckoutCustomer) —
  // jamais autre chose qu'un confort, le visiteur reste libre de modifier.
  const [name, setName] = React.useState(initialName || '');
  const [email, setEmail] = React.useState(initialEmail || '');
  const [bumpChecked, setBumpChecked] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const bumpAmount = orderBump?.enabled ? parsePriceAmount(orderBump.price) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ name, email, orderBumpTaken: bumpChecked, orderBumpAmount: bumpChecked ? bumpAmount : undefined });
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
          {orderBump?.enabled && (
            <label className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bumpChecked}
                onChange={(e) => setBumpChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-accent shrink-0"
              />
              <span className="text-sm">
                <span className="font-semibold block">{orderBump.heading || 'Ajouter une offre complémentaire'}</span>
                {orderBump.description && <span className="block text-surface/60 text-xs mt-0.5">{orderBump.description}</span>}
                <span className="block text-accent font-semibold mt-1">+ {formatPrice(parsePriceAmount(orderBump.price), currency)}</span>
              </span>
            </label>
          )}
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

export default function PricingBlock({ content, blockId, onAdvance, onMonerooCheckout, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg, currency, discountPercent, checkoutPrefill }) {
  const { heading, plans = [], layout, comparisonRows, slots } = content;
  const isComparison = layout === 'comparison' && (comparisonRows || []).length > 0;
  const gridClass = GRID_COLS_CLASS[Math.min(plans.length, 3)] || '';
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');
  const [checkoutTarget, setCheckoutTarget] = React.useState(null);
  // Le prix/prix barré affichent leur version formatée avec la devise du
  // compte (ex. "17 900 GHS") — sauf le champ qu'on est en train d'éditer,
  // qui repasse en texte brut le temps de la frappe (sinon la valeur tapée
  // serait immédiatement écrasée par la version formatée à chaque rendu).
  const [focusedPriceKey, setFocusedPriceKey] = React.useState(null);

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
  // Variante de singleLine pour les champs prix : bascule en texte brut
  // (éditable) au focus, revient au texte formaté (devise du compte) une
  // fois qu'on en sort.
  const priceField = (key, onCommit) => {
    const base = singleLine(onCommit);
    return {
      ...base,
      onFocus: () => editMode && setFocusedPriceKey(key),
      onBlur: (e) => { base.onBlur(e); setFocusedPriceKey((cur) => (cur === key ? null : cur)); },
    };
  };
  const priceDisplay = (key, raw) => (focusedPriceKey === key ? raw : formatPrice(parsePriceAmount(raw), currency));

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
          <span className="block text-sm line-through mb-0.5 text-background/50" {...priceField(`${i}-originalPrice`, (v) => updatePlan(i, { originalPrice: v }))}>
            {editMode ? priceDisplay(`${i}-originalPrice`, plan.originalPrice) : formatPrice(parsePriceAmount(plan.originalPrice), currency)}
          </span>
        )}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-bold outline-none" {...priceField(`${i}-price`, (v) => updatePlan(i, { price: v }))}>
            {editMode ? priceDisplay(`${i}-price`, plan.price) : formatPrice(parsePriceAmount(plan.price), currency)}
          </span>
          <span className="text-background/60 text-sm outline-none" {...singleLine((v) => updatePlan(i, { period: v }))}>{plan.period}</span>
        </div>
        {!editMode && discountPercent > 0 && (
          <p className="text-xs font-semibold text-accent -mt-4 mb-6">
            🎉 Réduction de {discountPercent}% appliquée : {formatPrice(applyDiscount(parsePriceAmount(plan.price), discountPercent), currency)}
          </p>
        )}
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
                    onClick={editMode ? buttonProps.onClick : () => setCheckoutTarget({ plan, link, planIndex: i })}
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
    <section className={cx('ambient-glow relative overflow-hidden px-6 py-16 md:px-16 md:py-24 max-w-5xl mx-auto', bg.sectionClassName)}>
      <FloatingOrbs />
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
          orderBump={content.orderBump}
          currency={currency}
          initialName={checkoutPrefill?.name}
          initialEmail={checkoutPrefill?.email}
          onClose={() => setCheckoutTarget(null)}
          onSubmit={async ({ name, email, orderBumpTaken }) => {
            // Le montant réel est recalculé côté serveur à partir du prix
            // stocké dans CE bloc (blockId + planIndex) — jamais envoyé
            // depuis ici, pour qu'un appel direct à l'API ne puisse pas
            // payer un montant différent de celui affiché sur la page.
            await onMonerooCheckout?.({
              paymentMethodId: checkoutTarget.link.paymentMethodId,
              blockId,
              planIndex: checkoutTarget.planIndex,
              customerEmail: email,
              customerName: name,
              orderBumpTaken,
            });
          }}
        />
      )}
    </section>
  );
}
