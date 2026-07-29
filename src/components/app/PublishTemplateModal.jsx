import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { CATEGORIES } from '../../lib/funnelTemplates';
import { publishTemplate } from '../../lib/templatesApi';

const inputClass = "w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface";
const labelClass = "block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1";

// Publie un tunnel comme modèle réutilisable par d'autres vendeurs — passe
// par une validation admin avant d'apparaître dans le marketplace (voir
// TemplatesService.publishFromFunnel côté serveur), jamais public tout de
// suite. Les liens de paiement configurés sur ce tunnel sont retirés
// automatiquement côté serveur, jamais recopiés chez un autre vendeur.
export default function PublishTemplateModal({ funnelId, defaultName, defaultCategory, onClose }) {
  const [name, setName] = useState(defaultName || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(defaultCategory || 'personnalise');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await publishTemplate({ funnelId, name: name.trim(), description: description.trim() || undefined, category });
      setDone(true);
    } catch {
      setError("La publication a échoué. Réessaie.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-sans font-bold text-surface mb-2">Modèle envoyé</h3>
            <p className="text-sm text-surface/60 mb-6">
              Un administrateur va le vérifier avant qu'il n'apparaisse dans le marketplace — tu seras averti par email une fois validé.
            </p>
            <button onClick={onClose} className="magnetic-btn bg-accent text-background px-5 py-2.5 rounded-full text-sm font-semibold">
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-4 h-4 text-accent" />
              <h3 className="font-sans font-bold text-surface">Publier comme modèle</h3>
            </div>
            <p className="text-sm text-surface/60 mb-5">
              D'autres vendeurs pourront cloner ce tunnel pour démarrer le leur — après validation par un administrateur. Les liens de paiement que tu as configurés ne sont jamais transmis.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Nom du modèle</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Description (optionnel)</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ce que ce tunnel vend, pour qui, ce qui le rend utile comme point de départ..."
                />
              </div>
              <div>
                <label className={labelClass}>Catégorie</label>
                <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold text-surface/60 hover:text-surface transition-colors">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || submitting}
                  className="magnetic-btn bg-accent text-background px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Envoi...' : 'Publier comme modèle'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
