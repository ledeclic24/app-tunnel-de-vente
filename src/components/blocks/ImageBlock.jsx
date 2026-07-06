import React from 'react';
import { getEditableProps, cx } from '../../lib/blockStyle';

export default function ImageBlock({ content, editMode, selectedElement, onSelectElement }) {
  const { url, caption } = content;
  if (!url) return null;
  const imageProps = getEditableProps({ elementKey: 'image', kind: 'image', styles: content.styles, editMode, selectedElement, onSelectElement, label: 'Image' });

  return (
    <section className="px-6 py-8 md:px-16 max-w-4xl mx-auto">
      <img
        src={url}
        alt={caption || ''}
        className={cx('w-full h-auto rounded-[2rem] object-cover', imageProps.className)}
        style={imageProps.style}
        onClick={imageProps.onClick}
      />
      {caption && <p className="text-center text-sm text-surface/50 mt-3">{caption}</p>}
    </section>
  );
}
