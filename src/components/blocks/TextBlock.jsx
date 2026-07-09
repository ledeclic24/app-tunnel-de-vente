import React from 'react';
import { getEditableProps, getContentEditableProps, cx } from '../../lib/blockStyle';

export default function TextBlock({ content, editMode, selectedElement, onSelectElement, onContentChange }) {
  const { heading, body } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const editableText = (field, multiline) => getContentEditableProps({ editMode, onContentChange, content, field, multiline });

  const headingProps = editable('heading', 'text', 'Titre');
  const bodyProps = editable('body', 'text', 'Texte');

  return (
    <section className="px-6 py-12 md:px-16 md:py-16 max-w-3xl mx-auto text-center">
      {heading && (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl text-surface mb-4 outline-none', headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...editableText('heading')}
        >
          {heading}
        </h2>
      )}
      {body && (
        <p
          className={cx('text-surface/70 text-lg leading-relaxed whitespace-pre-line outline-none', bodyProps.className)}
          style={bodyProps.style}
          onClick={bodyProps.onClick}
          {...editableText('body', true)}
        >
          {body}
        </p>
      )}
    </section>
  );
}
