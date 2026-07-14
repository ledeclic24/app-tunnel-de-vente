import React from 'react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';

export default function BonusStackBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, defaultBg }) {
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
    <section className={cx('px-6 py-12 md:px-16 md:py-16 max-w-4xl mx-auto', bg.sectionClassName)}>
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
      <div className="space-y-6">
        {items.map((item, i) => {
          const cardProps = editable(`bonus-${i}`, 'card', `Bonus ${i + 1}`);
          return (
            <div
              key={i}
              className={cx('bg-background border border-surface/10 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-center', cardProps.className)}
              style={cardProps.style}
              onClick={cardProps.onClick}
            >
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" loading="lazy" className="w-full md:w-40 aspect-square rounded-xl object-cover shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Bonus {i + 1}</span>
                <h3 className="font-sans font-bold text-lg mt-1 mb-1 outline-none text-surface" {...itemField(i, 'title')}>{item.title}</h3>
                <p className="text-sm text-surface/60 outline-none" {...itemField(i, 'description', { multiline: true })}>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
