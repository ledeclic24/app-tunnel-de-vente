import React from 'react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import SlotList, { SlotReadOnly } from './SlotList';
import EditableItemImage from './EditableItemImage';

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

export default function TeamBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
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
  const itemField = (i, field, opts = {}) => ({
    contentEditable: editMode,
    suppressContentEditableWarning: true,
    onClick: (e) => editMode && e.stopPropagation(),
    onBlur: (e) => editMode && updateItem(i, { [field]: e.currentTarget.textContent ?? '' }),
    onKeyDown: opts.multiline ? undefined : (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } },
  });

  const renderItem = (i) => {
    const item = items[i];
    if (!item) return null;
    const cardProps = editable(`team-${i}`, 'card', `Membre ${i + 1}`);
    return (
      <div
        className={cx('group hover-card bg-block-card border border-accent/20 rounded-xl p-6 text-center', cardProps.className)}
        style={cardProps.style}
        onClick={cardProps.onClick}
      >
        <EditableItemImage
          src={item.photoUrl}
          userId={userId}
          editMode={editMode}
          onChange={(photoUrl) => updateItem(i, { photoUrl })}
          className="w-20 h-20 rounded-full object-cover mx-auto mb-4 bg-primary/10 transition-transform duration-500 group-hover:scale-110"
          placeholder={<div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4" />}
        />
        <h3 className="font-sans font-semibold text-background outline-none" {...itemField(i, 'name')}>{item.name}</h3>
        {item.role && <p className="text-xs text-accent font-medium mt-0.5 outline-none" {...itemField(i, 'role')}>{item.role}</p>}
        {item.bio && <p className="text-sm text-background/70 mt-2 outline-none" {...itemField(i, 'bio', { multiline: true })}>{item.bio}</p>}
      </div>
    );
  };

  const renderField = (field) => {
    const m = /^item-(\d+)$/.exec(field);
    return m ? renderItem(Number(m[1])) : null;
  };

  const effectiveSlots = slots && isSlotsValid(slots, items.length) ? slots : buildDefaultSlots(items.length);

  return (
    <section className={cx('px-6 py-16 md:px-16 md:py-24 max-w-5xl mx-auto', bg.sectionClassName)}>
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
        <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {effectiveSlots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
        </div>
      )}
    </section>
  );
}
