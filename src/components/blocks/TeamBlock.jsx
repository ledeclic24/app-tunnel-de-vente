import React from 'react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import BlockExtras from './BlockExtras';
import EditableItemImage from './EditableItemImage';

export default function TeamBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, items = [] } = content;
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

  return (
    <section className={cx('px-6 py-12 md:px-16 md:py-16 max-w-5xl mx-auto', bg.sectionClassName)}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const cardProps = editable(`team-${i}`, 'card', `Membre ${i + 1}`);
          return (
            <div
              key={i}
              className={cx('bg-background border border-surface/10 rounded-[2rem] p-6 text-center', cardProps.className)}
              style={cardProps.style}
              onClick={cardProps.onClick}
            >
              <EditableItemImage
                src={item.photoUrl}
                userId={userId}
                editMode={editMode}
                onChange={(photoUrl) => updateItem(i, { photoUrl })}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 bg-primary/10"
                placeholder={<div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4" />}
              />
              <h3 className="font-sans font-semibold text-surface outline-none" {...itemField(i, 'name')}>{item.name}</h3>
              {item.role && <p className="text-xs text-accent font-medium mt-0.5 outline-none" {...itemField(i, 'role')}>{item.role}</p>}
              {item.bio && <p className="text-sm text-surface/60 mt-2 outline-none" {...itemField(i, 'bio', { multiline: true })}>{item.bio}</p>}
            </div>
          );
        })}
      </div>
      <BlockExtras
        extras={content.extras}
        styles={content.styles}
        onChange={(extras) => onContentChange?.({ ...content, extras })}
        editMode={editMode}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
        bg={bg}
        userId={userId}
      />
    </section>
  );
}
