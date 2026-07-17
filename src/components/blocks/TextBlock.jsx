import React from 'react';
import { getEditableProps, getContentEditableProps, getSectionBackground, renderRichText, cx } from '../../lib/blockStyle';
import SlotList from './SlotList';

const DEFAULT_SLOTS = [
  { id: 'field-heading', kind: 'field', field: 'heading' },
  { id: 'field-body', kind: 'field', field: 'body' },
];

export default function TextBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, body, slots } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const editableText = (field, multiline) => getContentEditableProps({ editMode, onContentChange, content, field, multiline });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const headingProps = editable('heading', 'text', 'Titre');
  const bodyProps = editable('body', 'text', 'Texte');

  const renderField = (field) => {
    if (field === 'heading') {
      return heading ? (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl mb-4 outline-none', bg.headingClassName, headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...editableText('heading')}
        >
          {heading}
        </h2>
      ) : null;
    }
    if (field === 'body') {
      return body ? (
        <p
          className={cx('text-lg leading-relaxed whitespace-pre-line outline-none', bg.bodyClassName, bodyProps.className)}
          style={bodyProps.style}
          onClick={bodyProps.onClick}
          {...editableText('body', true)}
        >
          {editMode ? body : renderRichText(body)}
        </p>
      ) : null;
    }
    return null;
  };

  return (
    <section className={cx('px-6 py-16 md:px-16 md:py-24 max-w-3xl mx-auto text-center', bg.sectionClassName)}>
      <SlotList
        slots={slots || DEFAULT_SLOTS}
        onSlotsChange={(next) => onContentChange?.({ ...content, slots: next })}
        renderField={renderField}
        bg={bg}
        userId={userId}
        styles={content.styles}
        editMode={editMode}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
      />
    </section>
  );
}
