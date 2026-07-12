import React, { useEffect, useState } from 'react';
import { Check, ImageIcon, X } from 'lucide-react';
import { fetchImages } from '../../lib/imagesApi';

// Sélecteur d'images parmi celles déjà générées dans le Studio visuel —
// réutilisé par MultiImageUpload (tunnels) et ImageUploadField (couverture
// d'ebook) à côté de leur bouton d'import existant.
export default function ImagePickerModal({ open, onClose, onConfirm, multiple = false, max = 1 }) {
  const [images, setImages] = useState(null);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setImages(null);
    fetchImages().then(setImages).catch(() => setImages([]));
  }, [open]);

  if (!open) return null;

  const toggle = (url) => {
    setSelected((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (!multiple) return [url];
      if (prev.length >= max) return prev;
      return [...prev, url];
    });
  };

  const confirm = () => {
    if (selected.length === 0) return;
    onConfirm(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-start justify-center" onClick={onClose}>
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full mx-4 mt-24 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-surface/10">
          <h2 className="font-sans font-semibold text-surface text-sm">Choisir dans mes visuels générés</h2>
          <button onClick={onClose} className="text-surface/40 hover:text-surface" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {images === null && <p className="text-sm text-surface/40 text-center py-12">Chargement...</p>}
          {images?.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-8 h-8 text-surface/20 mx-auto mb-3" />
              <p className="text-sm text-surface/40">Aucune image générée pour l'instant.</p>
              <p className="text-xs text-surface/30 mt-1">Génère-en depuis le Studio visuel pour les retrouver ici.</p>
            </div>
          )}
          {images?.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img) => {
                const isSelected = selected.includes(img.url);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => toggle(img.url)}
                    title={img.prompt || ''}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${isSelected ? 'border-accent' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt={img.prompt || ''} className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute inset-0 bg-accent/30 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-accent text-background flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-surface/10">
          <span className="text-xs text-surface/40">
            {multiple ? `${selected.length}/${max} sélectionnée${selected.length > 1 ? 's' : ''}` : `${selected.length}/1 sélectionnée`}
          </span>
          <button
            type="button"
            onClick={confirm}
            disabled={selected.length === 0}
            className="magnetic-btn inline-flex items-center gap-2 bg-accent text-background px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
