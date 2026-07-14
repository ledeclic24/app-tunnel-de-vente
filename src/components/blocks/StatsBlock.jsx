import React from 'react';
import { getEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';

export default function StatsBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, defaultBg }) {
  const { items = [] } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const updateItem = (i, patch) => {
    const nextItems = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onContentChange?.({ ...content, items: nextItems });
  };
  const itemField = (i, field) => ({
    contentEditable: editMode,
    suppressContentEditableWarning: true,
    onClick: (e) => editMode && e.stopPropagation(),
    onBlur: (e) => editMode && updateItem(i, { [field]: e.currentTarget.textContent ?? '' }),
    onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } },
  });

  return (
    <section className={cx('px-6 py-10 md:px-16 md:py-12 max-w-5xl mx-auto', bg.sectionClassName)}>
      <div className="flex flex-wrap items-start justify-center gap-x-12 gap-y-6 text-center">
        {items.map((item, i) => {
          const cardProps = editable(`stat-${i}`, 'card', `Chiffre ${i + 1}`);
          return (
            <div key={i} className={cx('min-w-[110px]', cardProps.className)} style={cardProps.style} onClick={cardProps.onClick}>
              <div className={cx('font-sans font-extrabold text-3xl md:text-4xl outline-none', bg.headingClassName)} {...itemField(i, 'value')}>{item.value}</div>
              <div className={cx('text-sm mt-1 outline-none', bg.bodyClassName)} {...itemField(i, 'label')}>{item.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
