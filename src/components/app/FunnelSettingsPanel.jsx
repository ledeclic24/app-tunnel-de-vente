import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';

const inputClass = "w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface";
const labelClass = "block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1";

function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local) {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function FunnelSettingsPanel({ funnel, plan, onSave }) {
  const [draft, setDraft] = useState({
    seo_title: funnel.seo_title || '',
    seo_description: funnel.seo_description || '',
    seo_image_url: funnel.seo_image_url || '',
    publish_at: toDatetimeLocalValue(funnel.publish_at),
    unpublish_at: toDatetimeLocalValue(funnel.unpublish_at),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (patch) => { setSaved(false); setDraft((d) => ({ ...d, ...patch })); };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave({
        seo_title: draft.seo_title.trim(),
        seo_description: draft.seo_description.trim(),
        seo_image_url: draft.seo_image_url.trim(),
        publish_at: fromDatetimeLocalValue(draft.publish_at),
        unpublish_at: fromDatetimeLocalValue(draft.unpublish_at),
      });
      setSaved(true);
    } catch {
      setError("L'enregistrement a échoué. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 space-y-8">
      <div className="space-y-5">
        <div>
          <h3 className="font-sans font-semibold text-surface">SEO & partage</h3>
          <p className="text-sm text-surface/60 mt-1">Ce qui s'affiche dans l'onglet du navigateur et lors d'un partage sur les réseaux sociaux ou WhatsApp.</p>
        </div>
        <div>
          <label className={labelClass}>Titre</label>
          <input className={inputClass} value={draft.seo_title} onChange={(e) => set({ seo_title: e.target.value })} placeholder={funnel.name} />
        </div>
        <div>
          <label className={labelClass}>Description ({draft.seo_description.length}/160)</label>
          <textarea className={inputClass} rows={3} maxLength={300} value={draft.seo_description} onChange={(e) => set({ seo_description: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Image de partage (URL)</label>
          <input className={inputClass} placeholder="https://..." value={draft.seo_image_url} onChange={(e) => set({ seo_image_url: e.target.value })} />
        </div>

        <div>
          <label className={labelClass}>Aperçu du partage</label>
          <div className="border border-surface/10 rounded-2xl overflow-hidden max-w-sm">
            {draft.seo_image_url && (
              <div className="w-full h-32 bg-surface/5">
                <img src={draft.seo_image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3 bg-surface/[0.02] space-y-1">
              <p className="text-xs text-surface/40 uppercase tracking-wide truncate">{window.location.hostname}</p>
              <p className="text-sm font-semibold text-surface truncate">{draft.seo_title || funnel.name}</p>
              <p className="text-xs text-surface/60 line-clamp-2">{draft.seo_description || 'Ajoute une description pour améliorer le partage.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 pt-6 border-t border-surface/10">
        <div>
          <h3 className="font-sans font-semibold text-surface">Planification de publication</h3>
        </div>
        {!plan.scheduledPublish ? (
          <div className="text-center py-6">
            <Lock className="w-6 h-6 text-surface/30 mx-auto mb-2" />
            <p className="text-sm text-surface/60 mb-3">La planification de publication est réservée aux plans payants.</p>
            <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-5 py-2.5 rounded-full text-sm font-semibold">
              Voir les offres
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-surface/60">
              Ces dates seront utilisées pour la publication automatique dès que cette fonctionnalité sera activée côté serveur — pour l'instant, publie ou dépublie manuellement avec le bouton "Publier" en haut de la page.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date de publication</label>
                <input type="datetime-local" className={inputClass} value={draft.publish_at} onChange={(e) => set({ publish_at: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Date de dépublication</label>
                <input type="datetime-local" className={inputClass} value={draft.unpublish_at} onChange={(e) => set({ unpublish_at: e.target.value })} />
              </div>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="magnetic-btn flex items-center gap-2 bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
      >
        {saving ? 'Enregistrement...' : saved ? <><Check className="w-4 h-4" /> Enregistré</> : 'Enregistrer'}
      </button>
    </div>
  );
}
