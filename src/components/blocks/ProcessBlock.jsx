import React from 'react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import BlockExtras from './BlockExtras';

export default function ProcessBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, items = [], layout } = content;
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
      {isCircular ? (
        <div className="space-y-8 max-w-2xl mx-auto">
          {items.map((item, i) => {
            const cardProps = editable(`process-${i}`, 'card', `Étape ${i + 1}`);
            return (
              <div key={i} className={cx('flex items-start gap-5', cardProps.className)} style={cardProps.style} onClick={cardProps.onClick}>
                <span className={badgeClass}>{i + 1}</span>
                <div>
                  <h3 className={cx('font-sans font-bold text-lg mb-1 outline-none', bg.headingClassName)} {...itemField(i, 'title')}>{item.title}</h3>
                  <p className={cx('outline-none', bg.bodyClassName)} {...itemField(i, 'description', { multiline: true })}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const cardProps = editable(`process-${i}`, 'card', `Étape ${i + 1}`);
            return (
              <div
                key={i}
                className={cx('bg-background border border-surface/10 rounded-[2rem] p-6 shadow-sm', cardProps.className)}
                style={cardProps.style}
                onClick={cardProps.onClick}
              >
                <span className={badgeClass}>{i + 1}</span>
                <h3 className="font-sans font-semibold text-surface mb-2 outline-none" {...itemField(i, 'title')}>{item.title}</h3>
                <p className="text-sm text-surface/60 outline-none" {...itemField(i, 'description', { multiline: true })}>{item.description}</p>
              </div>
            );
          })}
        </div>
      )}
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
