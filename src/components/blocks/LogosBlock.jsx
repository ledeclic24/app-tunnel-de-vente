import React from 'react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import BlockExtras from './BlockExtras';

export default function LogosBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, items = [] } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const headingProps = editable('heading', 'text', 'Titre');
  const headingEditable = getContentEditableProps({ editMode, onContentChange, content, field: 'heading' });

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
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {items.map((item, i) => {
          if (!item.logoUrl) return null;
          const itemProps = editable(`logo-${i}`, 'image', item.name || `Logo ${i + 1}`);
          return (
            <img
              key={i}
              src={item.logoUrl}
              alt={item.name || ''}
              loading="lazy"
              className={cx('h-8 md:h-10 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all', itemProps.className)}
              style={itemProps.style}
              onClick={itemProps.onClick}
            />
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
