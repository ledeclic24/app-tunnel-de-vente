import React, { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { getEditableProps, getContentEditableProps, cx } from '../../lib/blockStyle';
import { uploadImage } from '../../lib/storage';

export default function ImageBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId }) {
  const { url, caption, alt } = content;
  const imageProps = getEditableProps({ elementKey: 'image', kind: 'image', styles: content.styles, editMode, selectedElement, onSelectElement, label: 'Image' });
  const captionProps = getContentEditableProps({ editMode, onContentChange, content, field: 'caption' });

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
      const newUrl = await uploadImage(userId, file);
      onContentChange?.({ ...content, url: newUrl });
    } catch (err) {
      window.alert(err.message || "L'image n'a pas pu être importée.");
    }
    setUploading(false);
  };

  if (!url && !editMode) return null;

  return (
    <section className="px-6 py-8 md:px-16 max-w-4xl mx-auto">
      {url ? (
        <div className="relative group/img">
          <img
            src={url}
            alt={alt || caption || ''}
            loading="lazy"
            className={cx('w-full h-auto rounded-[2rem] object-cover', imageProps.className)}
            style={imageProps.style}
            onClick={handleImageClick}
          />
          {editMode && (
            <button
              type="button"
              onClick={handleImageClick}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/70 text-background text-xs font-medium opacity-0 group-hover/img:opacity-100 transition-opacity"
            >
              <ImagePlus className="w-3.5 h-3.5" /> {uploading ? 'Import...' : "Changer l'image"}
            </button>
          )}
        </div>
      ) : (
        editMode && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-16 rounded-[2rem] border border-dashed border-surface/20 text-surface/50 hover:border-accent hover:text-accent transition-colors"
          >
            <ImagePlus className="w-6 h-6" /> {uploading ? 'Import...' : 'Choisir une image'}
          </button>
        )
      )}
      {editMode && <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />}
      {(caption || editMode) && (
        <p className="text-center text-sm text-surface/50 mt-3 outline-none" {...captionProps}>{caption}</p>
      )}
    </section>
  );
}
