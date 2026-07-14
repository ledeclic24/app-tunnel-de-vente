import React, { useRef, useState } from 'react';
import { ArrowRight, ImagePlus } from 'lucide-react';
import { getButtonStyle, getEditableProps, getContentEditableProps, cx } from '../../lib/blockStyle';
import { uploadImage } from '../../lib/storage';

export default function HeroBlock({ content, onAdvance, editMode, selectedElement, onSelectElement, onContentChange, userId }) {
  const { eyebrow, heading, subheading, imageUrl, ctaText, externalUrl, layout, trustBadges = [] } = content;
  const isSplit = layout === 'split';
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const editableText = (field, multiline) => getContentEditableProps({ editMode, onContentChange, content, field, multiline });

  const headingProps = editable('heading', 'text', 'Titre');
  const subheadingProps = editable('subheading', 'text', 'Sous-titre');
  const imageProps = editable('image', 'image', 'Image');
  const buttonProps = editable('button', 'button', 'Bouton');
  const buttonStyle = { ...getButtonStyle(content.style), ...buttonProps.style };

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageClick = (e) => {
    imageProps.onClick?.(e);
    if (editMode) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(userId, file);
      onContentChange?.({ ...content, imageUrl: url });
    } catch (err) {
      window.alert(err.message || "L'image n'a pas pu être importée.");
    }
    setUploading(false);
  };

  const cta = ctaText && (
    externalUrl ? (
      <a
        href={externalUrl}
        target="_blank"
        rel="noreferrer"
        style={buttonStyle}
        className={cx('magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-8 py-4 rounded-full text-base font-medium', buttonProps.className)}
        onClick={editMode ? buttonProps.onClick : undefined}
      >
        <span className="relative z-10 outline-none" {...editableText('ctaText')}>{ctaText}</span>
        <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        <div className="fill-layer bg-white/30 rounded-full"></div>
      </a>
    ) : (
      <button
        onClick={editMode ? buttonProps.onClick : onAdvance}
        style={buttonStyle}
        className={cx('magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-8 py-4 rounded-full text-base font-medium', buttonProps.className)}
      >
        <span className="relative z-10 outline-none" {...editableText('ctaText')}>{ctaText}</span>
        <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        <div className="fill-layer bg-white/30 rounded-full"></div>
      </button>
    )
  );

  const imagePicker = editMode && (
    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
  );

  if (isSplit) {
    return (
      <section className="rounded-[2rem] bg-primary text-background overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="relative group/img aspect-[4/3] md:aspect-auto md:h-full min-h-[280px] bg-primary/60">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className={cx('w-full h-full object-cover', imageProps.className)}
                style={imageProps.style}
                onClick={handleImageClick}
              />
            ) : (
              editMode && (
                <button type="button" onClick={handleImageClick} className="absolute inset-0 flex items-center justify-center text-background/50 text-sm">
                  <ImagePlus className="w-5 h-5 mr-2" /> {uploading ? 'Import...' : 'Ajouter une image'}
                </button>
              )
            )}
            {imageUrl && editMode && (
              <button
                type="button"
                onClick={handleImageClick}
                className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/70 text-background text-xs font-medium opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                <ImagePlus className="w-3.5 h-3.5" /> {uploading ? 'Import...' : "Changer l'image"}
              </button>
            )}
            {imagePicker}
          </div>
          <div className="px-6 py-12 md:px-12 md:py-16">
            {eyebrow && (
              <span className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider">
                {eyebrow}
              </span>
            )}
            <h1
              className={cx('font-sans font-bold text-3xl md:text-4xl leading-tight mb-4 outline-none', headingProps.className)}
              style={headingProps.style}
              onClick={headingProps.onClick}
              {...editableText('heading')}
            >
              {heading}
            </h1>
            {subheading && (
              <p
                className={cx('text-background/70 text-lg mb-6 outline-none', subheadingProps.className)}
                style={subheadingProps.style}
                onClick={subheadingProps.onClick}
                {...editableText('subheading', true)}
              >
                {subheading}
              </p>
            )}
            {cta}
            {trustBadges.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-6 text-xs text-background/60">
                {trustBadges.map((b, i) => <span key={i}>{b}</span>)}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-primary text-background">
      {imageUrl && (
        <div className="absolute inset-0 group/img">
          <img
            src={imageUrl}
            alt=""
            className={cx('w-full h-full object-cover opacity-50', imageProps.className)}
            style={imageProps.style}
            onClick={handleImageClick}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent"></div>
          {editMode && (
            <button
              type="button"
              onClick={handleImageClick}
              className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/70 text-background text-xs font-medium opacity-0 group-hover/img:opacity-100 transition-opacity"
            >
              <ImagePlus className="w-3.5 h-3.5" /> {uploading ? 'Import...' : "Changer l'image"}
            </button>
          )}
          {imagePicker}
        </div>
      )}
      <div className="relative z-10 px-6 py-16 md:px-16 md:py-24 max-w-3xl">
        {eyebrow && (
          <span className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider">
            {eyebrow}
          </span>
        )}
        <h1
          className={cx('font-sans font-bold text-3xl md:text-5xl leading-tight mb-4 outline-none', headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...editableText('heading')}
        >
          {heading}
        </h1>
        {subheading && (
          <p
            className={cx('text-background/70 text-lg mb-8 max-w-xl outline-none', subheadingProps.className)}
            style={subheadingProps.style}
            onClick={subheadingProps.onClick}
            {...editableText('subheading', true)}
          >
            {subheading}
          </p>
        )}
        {cta}
      </div>
    </section>
  );
}
