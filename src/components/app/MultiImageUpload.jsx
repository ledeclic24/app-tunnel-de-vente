import React, { useRef, useState } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { uploadImage } from '../../lib/storage';
import ImagePickerModal from './ImagePickerModal';

export default function MultiImageUpload({ userId, images, onChange, max = 5 }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, max - images.length);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const urls = await Promise.all(files.map((file) => uploadImage(userId, file)));
      onChange([...images, ...urls]);
    } catch (err) {
      setError(err.message || "L'envoi d'une image a échoué. Réessaie.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAt = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-surface/5 border border-surface/10 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length < max && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !userId}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-surface/20 text-sm text-surface/60 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {uploading ? 'Envoi...' : `Importer (${images.length}/${max})`}
          </button>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-surface/20 text-sm text-surface/60 hover:border-accent hover:text-accent transition-colors"
          >
            <ImageIcon className="w-4 h-4" /> Mes visuels générés
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <ImagePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        multiple
        max={max - images.length}
        onConfirm={(urls) => onChange([...images, ...urls])}
      />
    </div>
  );
}
