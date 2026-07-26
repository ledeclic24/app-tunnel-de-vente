import React from 'react';
import { ShieldCheck, RotateCcw, Headphones, BadgeCheck, Lock, Truck } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import SlotList, { SlotReadOnly } from './SlotList';

// Icônes limitées à un jeu curaté (pas de champ texte libre pour l'icône) :
// évite qu'un nom d'icône invalide casse le rendu, et garde le choix
// pertinent pour de la réassurance (jamais une garantie ou un chiffre que
// l'utilisateur n'a pas lui-même saisi — voir DESIGN_SYSTEM_RULES côté IA).
export const TRUST_BADGE_ICONS = {
  'secure-payment': { icon: ShieldCheck, label: 'Paiement sécurisé' },
  'money-back': { icon: RotateCcw, label: 'Garantie remboursement' },
  support: { icon: Headphones, label: 'Support' },
  certified: { icon: BadgeCheck, label: 'Certifié / vérifié' },
  lock: { icon: Lock, label: 'Confidentialité' },
  delivery: { icon: Truck, label: 'Livraison' },
};

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

export default function TrustBadgesBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, defaultBg }) {
  const { heading, items = [], slots } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const headingProps = editable('heading', 'text', 'Titre');
  const headingEditable = getContentEditableProps({ editMode, onContentChange, content, field: 'heading' });

  const updateItem = (i, patch) => {
    const nextItems = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onContentChange?.({ ...content, items: nextItems });
  };
  const itemField = (i, field) => ({
    contentEditable: editMode,
    suppressContentEditableWarning: true,
    onClick: (e) => editMode && e.stopPropagation(),
    onBlur: (e) => editMode && updateItem(i, { [field]: e.currentTarget.textContent ?? '' }),
    onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } },
  });

  const renderItem = (i) => {
    const item = items[i];
    if (!item) return null;
    const def = TRUST_BADGE_ICONS[item.icon] || TRUST_BADGE_ICONS['secure-payment'];
    const Icon = def.icon;
    const itemProps = editable(`badge-${i}`, 'card', item.title || def.label);
    return (
      <div className={cx('group flex items-center gap-2.5', itemProps.className)} style={itemProps.style} onClick={itemProps.onClick}>
        <Icon className={cx('w-5 h-5 shrink-0', bg.bodyClassName)} />
        <span className={cx('text-sm font-medium outline-none', bg.bodyClassName)} {...itemField(i, 'title')}>{item.title}</span>
      </div>
    );
  };

  const renderField = (field) => {
    const m = /^item-(\d+)$/.exec(field);
    return m ? renderItem(Number(m[1])) : null;
  };

  const effectiveSlots = slots && isSlotsValid(slots, items.length) ? slots : buildDefaultSlots(items.length);

  return (
    <section className={cx('px-6 py-8 md:px-16 md:py-10 max-w-5xl mx-auto', bg.sectionClassName)}>
      {heading && (
        <p
          className={cx('text-center text-xs font-semibold uppercase tracking-wider mb-6 outline-none', bg.bodyClassName, headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...headingEditable}
        >
          {heading}
        </p>
      )}
      {editMode ? (
        <SlotList
          slots={effectiveSlots}
          onSlotsChange={(next) => onContentChange?.({ ...content, slots: next })}
          renderField={renderField}
          bg={bg}
          styles={content.styles}
          editMode={editMode}
          selectedElement={selectedElement}
          onSelectElement={onSelectElement}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {effectiveSlots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
        </div>
      )}
    </section>
  );
}
