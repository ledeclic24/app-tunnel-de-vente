import React from 'react';
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

export default function ProcessBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, items = [], layout, slots } = content;
  const isCircular = layout === 'circular';
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

  const badgeClass = cx(
    'shrink-0 flex items-center justify-center rounded-full bg-accent text-background font-sans font-bold',
    isCircular ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm mb-4',
  );

  const renderItem = (i) => {
    const item = items[i];
    if (!item) return null;
    const cardProps = editable(`process-${i}`, 'card', `Étape ${i + 1}`);
    if (isCircular) {
      return (
        <div className={cx('flex items-start gap-5', cardProps.className)} style={cardProps.style} onClick={cardProps.onClick}>
          <span className={badgeClass}>{i + 1}</span>
          <div>
            <h3 className={cx('font-sans font-bold text-lg mb-1 outline-none', bg.headingClassName)} {...itemField(i, 'title')}>{item.title}</h3>
            <p className={cx('outline-none', bg.bodyClassName)} {...itemField(i, 'description', { multiline: true })}>{item.description}</p>
          </div>
        </div>
      );
    }
    return (
      <div
        className={cx('hover-card bg-block-card border border-accent/20 rounded-xl p-6 shadow-sm', cardProps.className)}
        style={cardProps.style}
        onClick={cardProps.onClick}
      >
        <span className={badgeClass}>{i + 1}</span>
        <h3 className="font-sans font-semibold text-background mb-2 outline-none" {...itemField(i, 'title')}>{item.title}</h3>
        <p className="text-sm text-background/70 outline-none" {...itemField(i, 'description', { multiline: true })}>{item.description}</p>
      </div>
    );
  };

  const renderField = (field) => {
    const m = /^item-(\d+)$/.exec(field);
    return m ? renderItem(Number(m[1])) : null;
  };

  const effectiveSlots = slots && isSlotsValid(slots, items.length) ? slots : buildDefaultSlots(items.length);
  const readOnlyWrapperClass = isCircular ? 'stagger-children space-y-8 max-w-2xl mx-auto' : 'stagger-children grid grid-cols-1 md:grid-cols-3 gap-6';

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
        <div className={readOnlyWrapperClass}>
          {effectiveSlots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
        </div>
      )}
    </section>
  );
}
