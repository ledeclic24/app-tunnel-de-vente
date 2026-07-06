import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getButtonStyle, getEditableProps, cx } from '../../lib/blockStyle';

export default function CtaBlock({ content, onAdvance, editMode, selectedElement, onSelectElement }) {
  const { heading, buttonText, externalUrl } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });

  const headingProps = editable('heading', 'text', 'Titre');
  const buttonProps = editable('button', 'button', 'Bouton');
  const buttonStyle = { ...getButtonStyle(content.style), ...buttonProps.style };

  return (
    <section className="px-6 py-16 md:px-16 md:py-20 text-center">
      {heading && (
        <h2
          className={cx('font-serif italic text-3xl md:text-5xl text-surface mb-8', headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
        >
          {heading}
        </h2>
      )}
      {buttonText && (
        externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            style={buttonStyle}
            className={cx('magnetic-btn btn-fill-slide group relative inline-flex bg-accent text-background px-10 py-4 rounded-full text-lg font-medium', buttonProps.className)}
            onClick={editMode ? buttonProps.onClick : undefined}
          >
            <span className="relative z-10 flex items-center gap-2">{buttonText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
            <div className="fill-layer bg-white/30 rounded-full"></div>
          </a>
        ) : (
          <button
            onClick={editMode ? buttonProps.onClick : onAdvance}
            style={buttonStyle}
            className={cx('magnetic-btn btn-fill-slide group relative bg-accent text-background px-10 py-4 rounded-full text-lg font-medium', buttonProps.className)}
          >
            <span className="relative z-10 flex items-center gap-2">{buttonText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
            <div className="fill-layer bg-white/30 rounded-full"></div>
          </button>
        )
      )}
    </section>
  );
}
