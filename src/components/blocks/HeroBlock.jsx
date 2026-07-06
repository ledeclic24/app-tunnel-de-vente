import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getButtonStyle, getEditableProps, cx } from '../../lib/blockStyle';

export default function HeroBlock({ content, onAdvance, editMode, selectedElement, onSelectElement }) {
  const { eyebrow, heading, subheading, imageUrl, ctaText, externalUrl } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });

  const headingProps = editable('heading', 'text', 'Titre');
  const subheadingProps = editable('subheading', 'text', 'Sous-titre');
  const imageProps = editable('image', 'image', 'Image');
  const buttonProps = editable('button', 'button', 'Bouton');
  const buttonStyle = { ...getButtonStyle(content.style), ...buttonProps.style };

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-primary text-background">
      {imageUrl && (
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt=""
            className={cx('w-full h-full object-cover opacity-50', imageProps.className)}
            style={imageProps.style}
            onClick={imageProps.onClick}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent"></div>
        </div>
      )}
      <div className="relative z-10 px-6 py-16 md:px-16 md:py-24 max-w-3xl">
        {eyebrow && (
          <span className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider">
            {eyebrow}
          </span>
        )}
        <h1
          className={cx('font-sans font-bold text-3xl md:text-5xl leading-tight mb-4', headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
        >
          {heading}
        </h1>
        {subheading && (
          <p
            className={cx('text-background/70 text-lg mb-8 max-w-xl', subheadingProps.className)}
            style={subheadingProps.style}
            onClick={subheadingProps.onClick}
          >
            {subheading}
          </p>
        )}
        {ctaText && (
          externalUrl ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              style={buttonStyle}
              className={cx('magnetic-btn btn-fill-slide group relative inline-flex bg-accent text-background px-8 py-4 rounded-full text-base font-medium', buttonProps.className)}
              onClick={editMode ? buttonProps.onClick : undefined}
            >
              <span className="relative z-10 flex items-center gap-2">{ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              <div className="fill-layer bg-white/30 rounded-full"></div>
            </a>
          ) : (
            <button
              onClick={editMode ? buttonProps.onClick : onAdvance}
              style={buttonStyle}
              className={cx('magnetic-btn btn-fill-slide group relative bg-accent text-background px-8 py-4 rounded-full text-base font-medium', buttonProps.className)}
            >
              <span className="relative z-10 flex items-center gap-2">{ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              <div className="fill-layer bg-white/30 rounded-full"></div>
            </button>
          )
        )}
      </div>
    </section>
  );
}
