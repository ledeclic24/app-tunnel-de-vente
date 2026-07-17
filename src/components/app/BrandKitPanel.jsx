import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import ImageUploadField from '../blocks/ImageUploadField';
import { BRAND_FONTS } from '../../lib/colorUtils';

const inputClass = "w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface";
const labelClass = "block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1";
const META_PIXEL_RE = /^[0-9]{5,20}$/;
const GA_ID_RE = /^(G|UA|AW)-[A-Z0-9-]{4,20}$/i;

export default function BrandKitPanel({ brand, onSave, userId, canUseBrandKit, canUseAdPixels }) {
  const [draft, setDraft] = useState({
    primaryColor: brand?.primaryColor || '#0B0B0B',
    accentColor: brand?.accentColor || '#D4AF37',
    font: brand?.font || 'Sora',
    logoUrl: brand?.logoUrl || '',
    metaPixelId: brand?.metaPixelId || '',
    googleAnalyticsId: brand?.googleAnalyticsId || '',
  });
  const [saving, setSaving] = useState(false);

  if (!canUseBrandKit) {
    return (
      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 text-center">
        <Lock className="w-8 h-8 text-surface/30 mx-auto mb-3" />
        <h3 className="font-sans font-semibold text-surface mb-1">Brand Kit réservé aux plans payants</h3>
        <p className="text-sm text-surface/60 mb-4">Personnalise les couleurs, la typographie et le logo de tes tunnels avec le plan Pro ou Entreprise.</p>
        <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-5 py-2.5 rounded-full text-sm font-semibold">
          Voir les offres
        </Link>
      </div>
    );
  }

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 space-y-5">
      <h3 className="font-sans font-semibold text-surface">Brand Kit — garde ton identité</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Couleur principale</label>
          <div className="flex items-center gap-2">
            <input type="color" value={draft.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} className="w-10 h-10 rounded-lg border border-surface/10 cursor-pointer" />
            <input className={inputClass} value={draft.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Couleur d'accent</label>
          <div className="flex items-center gap-2">
            <input type="color" value={draft.accentColor} onChange={(e) => set({ accentColor: e.target.value })} className="w-10 h-10 rounded-lg border border-surface/10 cursor-pointer" />
            <input className={inputClass} value={draft.accentColor} onChange={(e) => set({ accentColor: e.target.value })} />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Typographie</label>
        <select className={inputClass} value={draft.font} onChange={(e) => set({ font: e.target.value })}>
          {BRAND_FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Logo</label>
        <ImageUploadField userId={userId} value={draft.logoUrl} onChange={(logoUrl) => set({ logoUrl })} />
      </div>

      <div className="pt-5 border-t border-surface/10">
        <h4 className="font-sans font-semibold text-surface text-sm mb-1">Pixels publicitaires</h4>
        {canUseAdPixels ? (
          <>
            <p className="text-xs text-surface/50 mb-4">Ces identifiants ne s'appliquent qu'aux pages publiques de ce tunnel, pour suivre vos campagnes publicitaires.</p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Meta Pixel — identifiant</label>
                <input className={`${inputClass} font-mono`} placeholder="1234567890123456" value={draft.metaPixelId} onChange={(e) => set({ metaPixelId: e.target.value.trim() })} />
                {draft.metaPixelId && !META_PIXEL_RE.test(draft.metaPixelId) && (
                  <p className="text-xs text-red-500 mt-1">Un identifiant Meta Pixel ne contient que des chiffres.</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Google Analytics / Ads — identifiant</label>
                <input className={`${inputClass} font-mono`} placeholder="G-XXXXXXXXXX" value={draft.googleAnalyticsId} onChange={(e) => set({ googleAnalyticsId: e.target.value.trim() })} />
                {draft.googleAnalyticsId && !GA_ID_RE.test(draft.googleAnalyticsId) && (
                  <p className="text-xs text-red-500 mt-1">Format attendu : G-XXXXXXXXXX, UA-XXXXX-X ou AW-XXXXXXXXX.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 bg-surface/[0.03] rounded-xl px-4 py-3">
            <Lock className="w-4 h-4 text-surface/30 shrink-0" />
            <p className="text-xs text-surface/50">Réservés au plan Entreprise — connectez Meta Pixel et Google Analytics/Ads à vos tunnels. <Link to="/app/billing" className="text-accent font-semibold hover:underline">Voir les offres</Link></p>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="magnetic-btn bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer le Brand Kit'}
      </button>
    </div>
  );
}
