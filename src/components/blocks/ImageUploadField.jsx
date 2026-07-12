import React, { useRef, useState } from 'react';
import { ImageIcon, Upload, Wand2 } from 'lucide-react';
import { uploadImage } from '../../lib/storage';
import ImagePickerModal from '../app/ImagePickerModal';

// onGenerate/generating sont optionnels : sans eux, comportement inchangé
// (upload + bibliothèque uniquement). Avec eux, un 3ᵉ bouton "Générer"
// apparaît (couverture d'ebook, illustration de chapitre).
export default function ImageUploadField({ userId, value, onChange, onGenerate, generating }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(userId, file);
      onChange(url);
    } catch (err) {
      setError(err.message || "L'envoi de l'image a échoué. Réessaie.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="w-full h-28 rounded-xl overflow-hidden bg-surface/5 border border-surface/10">
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-primary/5 border border-surface/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface min-w-0"
          placeholder="Coller une URL d'image..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || !userId}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-surface/10 text-sm text-surface/70 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" /> {uploading ? 'Envoi...' : 'Importer'}
        </button>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-surface/10 text-sm text-surface/70 hover:border-accent hover:text-accent transition-colors"
        >
          <ImageIcon className="w-4 h-4" /> Mes visuels
        </button>
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-surface/10 text-sm text-surface/70 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            {generating ? (
              <span className="w-4 h-4 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {generating ? 'Génération...' : 'Générer'}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <ImagePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        multiple={false}
        onConfirm={([url]) => onChange(url)}
      />
    </div>
  );
}
