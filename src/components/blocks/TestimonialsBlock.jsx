import React from 'react';
import { Quote } from 'lucide-react';
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

export default function TestimonialsBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, items = [], layout, slots } = content;
  const isCarousel = layout === 'carousel';
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
    onKeyDown: field !== 'quote' ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } } : undefined,
  });

  const renderItem = (i) => {
    const item = items[i];
    if (!item) return null;
    const cardProps = editable(`testimonial-${i}`, 'card', `Témoignage ${i + 1}`);
    return (
      <div
        className={cx(
          'group hover-card bg-block-card border border-accent/20 rounded-xl p-6 shadow-sm overflow-hidden',
          isCarousel && 'shrink-0 w-[85%] sm:w-[45%] snap-center',
          cardProps.className,
        )}
        style={cardProps.style}
        onClick={cardProps.onClick}
      >
        {item.screenshotUrl ? (
          <EditableItemImage
            src={item.screenshotUrl}
            userId={userId}
            editMode={editMode}
            onChange={(screenshotUrl) => updateItem(i, { screenshotUrl })}
            className="w-full h-auto rounded-xl object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <>
            <Quote className="w-6 h-6 text-accent mb-3" />
            <p className="text-background/80 mb-4 outline-none" {...itemField(i, 'quote', item.quote)}>{item.quote}</p>
            <p className="text-sm font-semibold text-background outline-none" {...itemField(i, 'name', item.name)}>{item.name}</p>
            {item.role && <p className="text-xs text-background/50 outline-none" {...itemField(i, 'role', item.role)}>{item.role}</p>}
          </>
        )}
      </div>
    );
  };

  const renderField = (field) => {
    const m = /^item-(\d+)$/.exec(field);
    return m ? renderItem(Number(m[1])) : null;
  };

  const effectiveSlots = slots && isSlotsValid(slots, items.length) ? slots : buildDefaultSlots(items.length);
  const readOnlyWrapperClass = isCarousel ? 'flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0' : 'stagger-children grid grid-cols-1 md:grid-cols-2 gap-6';

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
        <div className={readOnlyWrapperClass}>
          {effectiveSlots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
        </div>
      )}
    </section>
  );
}
