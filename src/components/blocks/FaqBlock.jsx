import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import SlotList, { SlotReadOnly } from './SlotList';

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

export default function FaqBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, items = [], slots } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');
  // Accordéon exclusif (cahier des charges "tunnel standard") : un seul
  // élément ouvert à la fois. <details> natif ne le permet pas nativement
  // (chaque élément gère son propre état) — on pilote donc l'attribut
  // "open" nous-mêmes plutôt que de laisser le navigateur le faire.
  const [openIndex, setOpenIndex] = useState(null);

  const headingProps = editable('heading', 'text', 'Titre');
  const headingEditable = getContentEditableProps({ editMode, onContentChange, content, field: 'heading' });

  const updateItem = (i, patch) => {
    const nextItems = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onContentChange?.({ ...content, items: nextItems });
  };

  const renderItem = (i) => {
    const item = items[i];
    if (!item) return null;
    const itemProps = editable(`faq-${i}`, 'card', `Question ${i + 1}`);
    const isOpen = openIndex === i;
    return (
      <details
        open={isOpen}
        className={cx('group bg-background border border-surface/10 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden', itemProps.className)}
        style={itemProps.style}
        onClick={itemProps.onClick}
        onToggle={(e) => {
          if (e.currentTarget.open) setOpenIndex(i);
          else if (isOpen) setOpenIndex(null);
        }}
      >
        <summary
          className="flex items-center justify-between cursor-pointer font-sans font-medium text-surface list-none"
          onClick={(e) => {
            // <details> bascule "open" tout seul avant qu'on l'intercepte ;
            // on gère nous-mêmes la fermeture des autres pour rester exclusif.
            e.preventDefault();
            setOpenIndex(isOpen ? null : i);
          }}
        >
          <span
            className="outline-none"
            contentEditable={editMode}
            suppressContentEditableWarning
            onBlur={(e) => editMode && updateItem(i, { question: e.currentTarget.textContent ?? '' })}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
          >
            {item.question}
          </span>
          <ChevronDown className="w-4 h-4 text-surface/50 group-open:rotate-180 transition-transform shrink-0" />
        </summary>
        <p
          className="text-sm text-surface/60 mt-3 outline-none"
          contentEditable={editMode}
          suppressContentEditableWarning
          onClick={(e) => editMode && e.stopPropagation()}
          onBlur={(e) => editMode && updateItem(i, { answer: e.currentTarget.textContent ?? '' })}
        >
          {item.answer}
        </p>
      </details>
    );
  };

  const renderField = (field) => {
    const m = /^item-(\d+)$/.exec(field);
    return m ? renderItem(Number(m[1])) : null;
  };

  const effectiveSlots = slots && isSlotsValid(slots, items.length) ? slots : buildDefaultSlots(items.length);

  return (
    <section className={cx('px-6 py-12 md:px-16 md:py-16 max-w-3xl mx-auto', bg.sectionClassName)}>
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
        <div className="space-y-3">
          {effectiveSlots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
        </div>
      )}
    </section>
  );
}
