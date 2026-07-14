import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getButtonStyle, getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import SlotList from './SlotList';

function buildDefaultSlots() {
  return [
    { id: 'field-heading', kind: 'field', field: 'heading' },
    { id: 'field-button', kind: 'field', field: 'button' },
  ];
}
function isSlotsValid(slots) {
  const fieldSlots = slots.filter((s) => s.kind === 'field').map((s) => s.field);
  return fieldSlots.length === 2 && fieldSlots.includes('heading') && fieldSlots.includes('button');
}

export default function CtaBlock({ content, onAdvance, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, buttonText, externalUrl, slots } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const editableText = (field) => getContentEditableProps({ editMode, onContentChange, content, field });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const headingProps = editable('heading', 'text', 'Titre');
  const buttonProps = editable('button', 'button', 'Bouton');
  const buttonStyle = { ...getButtonStyle(content.style), ...buttonProps.style };

  const renderField = (field) => {
    if (field === 'heading') return heading ? (
      <h2
        className={cx('font-serif italic text-3xl md:text-5xl mb-8 outline-none', bg.headingClassName, headingProps.className)}
        style={headingProps.style}
        onClick={headingProps.onClick}
        {...editableText('heading')}
      >
        {heading}
      </h2>
    ) : null;
    if (field === 'button') return buttonText ? (
      externalUrl ? (
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          style={buttonStyle}
          className={cx('magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-10 py-4 rounded-full text-lg font-medium', buttonProps.className)}
          onClick={editMode ? buttonProps.onClick : undefined}
        >
          <span className="relative z-10 outline-none" {...editableText('buttonText')}>{buttonText}</span>
          <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <div className="fill-layer bg-white/30 rounded-full"></div>
        </a>
      ) : (
        <button
          onClick={editMode ? buttonProps.onClick : onAdvance}
          style={buttonStyle}
          className={cx('magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-10 py-4 rounded-full text-lg font-medium', buttonProps.className)}
        >
          <span className="relative z-10 outline-none" {...editableText('buttonText')}>{buttonText}</span>
          <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <div className="fill-layer bg-white/30 rounded-full"></div>
        </button>
      )
    ) : null;
    return null;
  };

  const effectiveSlots = slots && isSlotsValid(slots) ? slots : buildDefaultSlots();

  return (
    <section className={cx('px-6 py-16 md:px-16 md:py-20 text-center', bg.sectionClassName)}>
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
    </section>
  );
}
