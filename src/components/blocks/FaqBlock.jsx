import React from 'react';
import { ChevronDown } from 'lucide-react';
import { getEditableProps, getContentEditableProps, cx } from '../../lib/blockStyle';

export default function FaqBlock({ content, editMode, selectedElement, onSelectElement, onContentChange }) {
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
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-3xl mx-auto">
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
      <div className="space-y-3">
        {items.map((item, i) => {
          const itemProps = editable(`faq-${i}`, 'card', `Question ${i + 1}`);
          return (
            <details
              key={i}
              className={cx('group bg-background border border-surface/10 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden', itemProps.className)}
              style={itemProps.style}
              onClick={itemProps.onClick}
            >
              <summary className="flex items-center justify-between cursor-pointer font-sans font-medium text-surface list-none">
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
        })}
      </div>
    </section>
  );
}
