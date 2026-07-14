import React, { useState } from 'react';
import { ImageIcon, Upload, Wand2 } from 'lucide-react';
import { uploadImage } from '../../lib/storage';
import { cx } from '../../lib/blockStyle';
import ImagePickerModal from '../app/ImagePickerModal';

// onGenerate/generating sont optionnels : sans eux, comportement inchangé
// (upload + bibliothèque uniquement). Avec eux, un 3ᵉ bouton "Générer"
// apparaît (couverture d'ebook, illustration de chapitre). Si generateTypes
// est fourni en plus (menu Image/Box/Ebook/Mockup pour les blocs de tunnel),
// le bouton "Générer" ouvre d'abord un petit menu de types avant d'appeler
// onGenerate(typeKey) — sinon onGenerate() est appelé directement sans argument.
export default function ImageUploadField({ userId, value, onChange, onGenerate, generating, generateTypes }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

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
        <label
          className={cx(
            'shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-surface/10 text-sm text-surface/70 hover:border-accent hover:text-accent transition-colors cursor-pointer',
            (uploading || !userId) && 'opacity-50 pointer-events-none',
          )}
        >
          <Upload className="w-4 h-4" /> {uploading ? 'Envoi...' : 'Importer'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading || !userId} />
        </label>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-surface/10 text-sm text-surface/70 hover:border-accent hover:text-accent transition-colors"
        >
          <ImageIcon className="w-4 h-4" /> Mes visuels
        </button>
        {onGenerate && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => (generateTypes ? setShowTypeMenu((v) => !v) : onGenerate())}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-surface/10 text-sm text-surface/70 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            >
              {generating ? (
                <span className="w-4 h-4 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {generating ? 'Génération...' : 'Générer'}
            </button>
            {showTypeMenu && !generating && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-background border border-surface/10 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
                {generateTypes.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => { setShowTypeMenu(false); onGenerate(t.key); }}
                    className="w-full text-left px-3 py-2 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
