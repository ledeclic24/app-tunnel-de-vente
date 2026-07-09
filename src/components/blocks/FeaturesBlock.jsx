import React from 'react';
import { Check } from 'lucide-react';
import { getEditableProps, getContentEditableProps, cx } from '../../lib/blockStyle';

export default function FeaturesBlock({ content, editMode, selectedElement, onSelectElement, onContentChange }) {
  const { heading, items = [] } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });

  const headingProps = editable('heading', 'text', 'Titre');
  const headingEditable = getContentEditableProps({ editMode, onContentChange, content, field: 'heading' });

  const updateItem = (i, patch) => {
    const nextItems = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onContentChange?.({ ...content, items: nextItems });
  };

  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-5xl mx-auto">
      {heading && (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl text-surface text-center mb-10 outline-none', headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...headingEditable}
        >
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const cardProps = editable(`feature-${i}`, 'card', `Carte ${i + 1}`);
          return (
            <div
              key={i}
              className={cx('bg-background border border-surface/10 rounded-[2rem] p-6 shadow-sm', cardProps.className)}
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
        })}
      </div>
    </section>
  );
}
