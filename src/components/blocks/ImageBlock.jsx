import React, { useState } from 'react';
import { ImagePlus, Upload, Image as LibraryIcon, Wand2 } from 'lucide-react';
import { getEditableProps, getContentEditableProps, getSectionBackground, cx } from '../../lib/blockStyle';
import { uploadImage } from '../../lib/storage';
import SlotList from './SlotList';
import ImagePickerModal from '../app/ImagePickerModal';
import { TUNNEL_IMAGE_TYPES } from './BlockEditorPanel';
import { useToast } from '../app/Toast';

// L'image principale reste hors du système d'emplacements (comme pour
// Hero) : c'est l'ancrage central du bloc, pas un élément de flux parmi
// d'autres. Seule la légende est un emplacement réordonnable.
function buildDefaultSlots() {
  return [{ id: 'field-caption', kind: 'field', field: 'caption' }];
}
function isSlotsValid(slots) {
  const fieldSlots = slots.filter((s) => s.kind === 'field').map((s) => s.field);
  return fieldSlots.length === 1 && fieldSlots[0] === 'caption';
}

export default function ImageBlock({ content, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg, onGenerateImage, imageGenerating }) {
  const { url, caption, alt, slots } = content;
  const imageProps = getEditableProps({ elementKey: 'image', kind: 'image', styles: content.styles, editMode, selectedElement, onSelectElement, label: 'Image' });
  const captionProps = getContentEditableProps({ editMode, onContentChange, content, field: 'caption' });
  const bg = getSectionBackground(content.styles, defaultBg || 'white');

  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const toast = useToast();

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
      toast.error(err.message || "L'image n'a pas pu être importée.");
    }
    setUploading(false);
  };

  const imageMenu = editMode && (
    <>
      {showMenu && (
        <div
          className="absolute top-3 right-3 z-30 bg-background border border-surface/10 rounded-xl shadow-lg overflow-hidden min-w-[220px]"
          onClick={(e) => e.stopPropagation()}
        >
          <label
            // Fermeture DIFFÉRÉE du menu (voir EditableItemImage.jsx) :
            // le démonter de façon synchrone dans ce clic empêche le
            // navigateur d'ouvrir le sélecteur de fichier natif sur
            // l'input imbriqué (qui n'existe déjà plus quand il essaie).
            onClick={() => setTimeout(() => setShowMenu(false), 0)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left cursor-pointer"
          >
            <Upload className="w-4 h-4 shrink-0" /> {uploading ? 'Envoi...' : 'Importer depuis mon ordinateur'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
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

  const renderField = (field) => {
    if (field !== 'caption') return null;
    return (caption || editMode) ? (
      <p className={cx('text-center text-sm outline-none', bg.isDark ? 'text-background/60' : 'text-surface/50')} {...captionProps}>{caption}</p>
    ) : null;
  };

  const effectiveSlots = slots && isSlotsValid(slots) ? slots : buildDefaultSlots();
  const hasFreeContent = (slots || []).some((s) => s.kind !== 'field' && (s.kind !== 'container' || s.items?.length > 0)) || (content.extras?.length > 0);
  if (!url && !editMode && !hasFreeContent) return null;

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
      <div className="mt-3">
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
      </div>
    </section>
  );
}
