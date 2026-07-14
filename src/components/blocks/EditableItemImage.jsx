import React, { useRef, useState } from 'react';
import { Upload, ImageIcon, Pencil } from 'lucide-react';
import { uploadImage } from '../../lib/storage';
import ImagePickerModal from '../app/ImagePickerModal';
import { cx } from '../../lib/blockStyle';

// Rend cliquable une image déjà présente dans un bloc (photo d'équipe, logo,
// visuel de tarif, capture témoignage...) : Importer / Choisir dans ma
// bibliothèque, en plus de son éventuelle sélection pour le panneau de
// style (editableProps, optionnel, fusionné plutôt que remplacé). Pas de
// génération IA ici : le backend ne sait générer que pour hero/image
// (cf. AiService.generateBlockImage), pas pour un champ d'item.
export default function EditableItemImage({
  src, alt = '', userId, onChange, editMode, className, editableProps, placeholder,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  if (!editMode) {
    return src ? <img src={src} alt={alt} loading="lazy" className={className} /> : (placeholder || null);
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(userId, file);
      onChange(url);
    } catch (err) {
      window.alert(err.message || "L'image n'a pas pu être importée.");
    }
    setUploading(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    editableProps?.onClick?.(e);
    setShowMenu((v) => !v);
  };

  return (
    <div className="relative group/edimg inline-block w-full">
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cx(className, editableProps?.className)}
          style={editableProps?.style}
          onClick={handleClick}
        />
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={cx(className, editableProps?.className, 'flex items-center justify-center')}
          style={editableProps?.style}
        >
          {placeholder || <Upload className="w-4 h-4 text-surface/30" />}
        </button>
      )}
      {src && (
        <button
          type="button"
          onClick={handleClick}
          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-surface/70 text-background flex items-center justify-center opacity-0 group-hover/edimg:opacity-100 transition-opacity"
          aria-label="Changer l'image"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
      {showMenu && (
        <div
          className="absolute z-20 top-full left-0 mt-1 bg-background border border-surface/10 rounded-xl shadow-lg overflow-hidden min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => { setShowMenu(false); fileRef.current?.click(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left"
          >
            <Upload className="w-4 h-4 shrink-0" /> {uploading ? 'Envoi...' : 'Importer depuis mon ordinateur'}
          </button>
          <button
            type="button"
            onClick={() => { setShowMenu(false); setShowPicker(true); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left"
          >
            <ImageIcon className="w-4 h-4 shrink-0" /> Choisir dans ma bibliothèque
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <ImagePickerModal open={showPicker} onClose={() => setShowPicker(false)} multiple={false} onConfirm={([url]) => onChange(url)} />
    </div>
  );
}
