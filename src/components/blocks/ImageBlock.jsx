import React, { useRef, useState } from 'react';
import { ImagePlus, Upload, Image as LibraryIcon, Wand2 } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import { uploadImage } from '../../lib/storage';
import BlockExtras from './BlockExtras';
import ImagePickerModal from '../app/ImagePickerModal';
import { TUNNEL_IMAGE_TYPES } from './BlockEditorPanel';

export default function ImageBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg, onGenerateImage, imageGenerating }) {
  const { url, caption, alt } = content;
  const imageProps = getEditableProps({ elementKey: 'image', kind: 'image', styles: content.styles, editMode, selectedElement, onSelectElement, label: 'Image' });
  const captionProps = getContentEditableProps({ editMode, onContentChange, content, field: 'caption' });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const handleImageClick = (e) => {
    imageProps.onClick?.(e);
    if (editMode) setShowMenu((v) => !v);
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

  const imageMenu = editMode && (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {showMenu && (
        <div
          className="absolute top-3 right-3 z-30 bg-background border border-surface/10 rounded-xl shadow-lg overflow-hidden min-w-[220px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => { setShowMenu(false); fileInputRef.current?.click(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left"
          >
            <Upload className="w-4 h-4 shrink-0" /> {uploading ? 'Envoi...' : 'Importer depuis mon ordinateur'}
          </button>
          <button
            type="button"
            onClick={() => { setShowMenu(false); setShowPicker(true); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left"
          >
            <LibraryIcon className="w-4 h-4 shrink-0" /> Choisir dans ma bibliothèque
          </button>
          {onGenerateImage && (
            <button
              type="button"
              onClick={() => { setShowMenu(false); setShowTypeMenu(true); }}
              disabled={imageGenerating}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4 shrink-0" /> {imageGenerating ? 'Génération...' : "Générer avec l'IA"}
            </button>
          )}
        </div>
      )}
      {showTypeMenu && (
        <div
          className="absolute top-3 right-3 z-30 bg-background border border-surface/10 rounded-xl shadow-lg overflow-hidden min-w-[180px]"
          onClick={(e) => e.stopPropagation()}
        >
          {TUNNEL_IMAGE_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setShowTypeMenu(false); onGenerateImage(t.key); }}
              className="w-full text-left px-3 py-2 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <ImagePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        multiple={false}
        onConfirm={([newUrl]) => onContentChange?.({ ...content, url: newUrl })}
      />
    </>
  );

  if (!url && !editMode && !(content.extras?.length > 0)) return null;

  return (
    <section className={cx('px-6 py-8 md:px-16 max-w-4xl mx-auto', bg.sectionClassName)}>
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
          {imageMenu}
        </div>
      ) : (
        editMode && (
          <div className="relative">
            <button
              type="button"
              onClick={handleImageClick}
              className="w-full flex flex-col items-center justify-center gap-2 py-16 rounded-[2rem] border border-dashed border-surface/20 text-surface/50 hover:border-accent hover:text-accent transition-colors"
            >
              <ImagePlus className="w-6 h-6" /> {uploading ? 'Import...' : 'Choisir une image'}
            </button>
            {imageMenu}
          </div>
        )
      )}
      {(caption || editMode) && (
        <p className={cx('text-center text-sm mt-3 outline-none', bg.isDark ? 'text-background/60' : 'text-surface/50')} {...captionProps}>{caption}</p>
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
