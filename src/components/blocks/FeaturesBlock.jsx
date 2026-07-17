import React from 'react';
import { Check } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import SlotList, { SlotReadOnly } from './SlotList';
import EditableItemImage from './EditableItemImage';

// Le titre reste en dehors du système d'emplacements (il ne fait pas
// vraiment sens de le mélanger à une grille de cartes) — seuls les items
// et les extras insérés sont réordonnables entre eux. En édition, la
// liste s'affiche toujours empilée verticalement (peu importe la mise en
// page grille/lignes) pour que le glisser-déposer entre deux items reste
// cohérent ; la vraie mise en page (grille 3 colonnes, lignes alternées)
// ne s'applique qu'à l'affichage final (page publiée / hors édition).
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

export default function FeaturesBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, items = [], layout, slots } = content;
  const isRows = layout === 'rows';
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
    const cardProps = editable(`feature-${i}`, 'card', isRows ? `Ligne ${i + 1}` : `Carte ${i + 1}`);

    if (isRows) {
      const reversed = i % 2 === 1;
      return (
        <div
          className={cx('grid md:grid-cols-2 gap-6 md:gap-10 items-center', cardProps.className)}
          style={cardProps.style}
          onClick={cardProps.onClick}
        >
          <div className={cx('group rounded-[2rem] overflow-hidden bg-primary/5 aspect-video', reversed && 'md:order-2')}>
            <EditableItemImage
              src={item.imageUrl}
              userId={userId}
              editMode={editMode}
              onChange={(imageUrl) => updateItem(i, { imageUrl })}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
          <div className={reversed ? 'md:order-1' : undefined}>
            <h3
              className={cx('font-sans font-bold text-xl md:text-2xl mb-3 outline-none', bg.headingClassName)}
              contentEditable={editMode}
              suppressContentEditableWarning
              onClick={(e) => editMode && e.stopPropagation()}
              onBlur={(e) => editMode && updateItem(i, { title: e.currentTarget.textContent ?? '' })}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {item.title}
            </h3>
            <p
              className={cx('outline-none', bg.bodyClassName)}
              contentEditable={editMode}
              suppressContentEditableWarning
              onClick={(e) => editMode && e.stopPropagation()}
              onBlur={(e) => editMode && updateItem(i, { description: e.currentTarget.textContent ?? '' })}
            >
              {item.description}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cx('hover-card bg-background border border-accent/20 rounded-xl p-6 shadow-sm', cardProps.className)}
        style={cardProps.style}
        onClick={cardProps.onClick}
      >
        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
          <Check className="w-4 h-4" />
        </div>
        <h3
          className="font-sans font-semibold text-surface mb-2 outline-none"
          contentEditable={editMode}
          suppressContentEditableWarning
          onClick={(e) => editMode && e.stopPropagation()}
          onBlur={(e) => editMode && updateItem(i, { title: e.currentTarget.textContent ?? '' })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
        >
          {item.title}
        </h3>
        <p
          className="text-sm text-surface/60 outline-none"
          contentEditable={editMode}
          suppressContentEditableWarning
          onClick={(e) => editMode && e.stopPropagation()}
          onBlur={(e) => editMode && updateItem(i, { description: e.currentTarget.textContent ?? '' })}
        >
          {item.description}
        </p>
      </div>
    );
  };

  const renderField = (field) => {
    const match = /^item-(\d+)$/.exec(field);
    return match ? renderItem(Number(match[1])) : null;
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
        <div className={cx('stagger-children', isRows ? 'space-y-10 md:space-y-14' : 'grid grid-cols-1 md:grid-cols-3 gap-6')}>
          {effectiveSlots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
        </div>
      )}
    </section>
  );
}
