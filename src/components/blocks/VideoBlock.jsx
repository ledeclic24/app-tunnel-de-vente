import React from 'react';
import { Video } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import BlockExtras from './BlockExtras';

function toEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default function VideoBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg }) {
  const { heading, description, videoUrl } = content;
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const editableText = (field, multiline) => getContentEditableProps({ editMode, onContentChange, content, field, multiline });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const headingProps = editable('heading', 'text', 'Titre');
  const descriptionProps = editable('description', 'text', 'Description');
  const embedUrl = toEmbedUrl(videoUrl);

  return (
    <section className={cx('px-6 py-12 md:px-16 md:py-16 max-w-3xl mx-auto text-center', bg.sectionClassName)}>
      {heading && (
        <h2
          className={cx('font-sans font-bold text-2xl md:text-3xl mb-4 outline-none', bg.headingClassName, headingProps.className)}
          style={headingProps.style}
          onClick={headingProps.onClick}
          {...editableText('heading')}
        >
          {heading}
        </h2>
      )}

      <div className="rounded-[2rem] overflow-hidden bg-primary/5 border border-surface/10 aspect-video flex items-center justify-center">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={heading || 'Vidéo'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={videoUrl} controls className="w-full h-full" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-surface/30 py-16">
            <Video className="w-8 h-8" />
            {editMode && <span className="text-sm">Ajoute un lien de vidéo dans les réglages</span>}
          </div>
        )}
      </div>

      {description && (
        <p
          className={cx('text-base leading-relaxed whitespace-pre-line outline-none mt-4', bg.bodyClassName, descriptionProps.className)}
          style={descriptionProps.style}
          onClick={descriptionProps.onClick}
          {...editableText('description', true)}
        >
          {description}
        </p>
      )}
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
