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

export default function LogosBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
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

  const renderItem = (i) => {
    const item = items[i];
    if (!item) return null;
    if (!item.logoUrl && !editMode) return null;
    const itemProps = editable(`logo-${i}`, 'image', item.name || `Logo ${i + 1}`);
    return (
      <EditableItemImage
        src={item.logoUrl}
        alt={item.name || ''}
        userId={userId}
        editMode={editMode}
        onChange={(logoUrl) => updateItem(i, { logoUrl })}
        editableProps={itemProps}
        className="h-8 md:h-10 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all"
      />
    );
  };

  const renderField = (field) => {
    const m = /^item-(\d+)$/.exec(field);
    return m ? renderItem(Number(m[1])) : null;
  };

  const effectiveSlots = slots && isSlotsValid(slots, items.length) ? slots : buildDefaultSlots(items.length);

  return (
    <section className={cx('px-6 py-10 md:px-16 md:py-12 max-w-5xl mx-auto', bg.sectionClassName)}>
      {heading && (
        <p
          className={cx('text-center text-xs font-semibold uppercase tracking-wider mb-8 outline-none', bg.bodyClassName, headingProps.className)}
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
          userId={userId}
          styles={content.styles}
          editMode={editMode}
          selectedElement={selectedElement}
          onSelectElement={onSelectElement}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {effectiveSlots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
        </div>
      )}
    </section>
  );
}
