import React from 'react';
import { Lock } from 'lucide-react';

const inputClass = "w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface";
const labelClass = "block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1";

function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Toggle({ label, checked, onChange, children }) {
  return (
    <div className="border border-surface/10 rounded-xl p-4 space-y-3">
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm font-semibold text-surface">{label}</span>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-accent" />
      </label>
      {checked && children && <div className="space-y-3 pt-1">{children}</div>}
    </div>
  );
}

// Réglages d'habillage de page à position fixe (barre de countdown,
// notification d'achat, pied de page collant) — un réglage par étape,
// jamais un bloc de contenu (voir PublishedFunnelPage.jsx pour le rendu).
export default function PageSettingsPanel({ step, steps, plan, onSave }) {
  if (!step) return null;

  if (!plan.pageChrome) {
    return (
      <div className="text-center py-6">
        <Lock className="w-6 h-6 text-surface/30 mx-auto mb-3" />
        <p className="text-sm text-surface/60">
          La barre de compte à rebours, la notification d'achat et le pied de page collant nécessitent le plan Pro ou Entreprise.
        </p>
      </div>
    );
  }

  const chrome = step.chrome || {};
  const setChrome = (patch) => onSave({ ...chrome, ...patch });
  const countdownBar = chrome.countdownBar || {};
  const purchaseNotification = chrome.purchaseNotification || {};
  const stickyFooterCta = chrome.stickyFooterCta || {};

  return (
    <div className="space-y-4">
      <p className="text-xs text-surface/40">
        Réglages propres à cette page ({step.name}) — chaque page du tunnel a les siens.
      </p>

      <Toggle
        label="Barre de compte à rebours"
        checked={Boolean(countdownBar.enabled)}
        onChange={(enabled) => setChrome({ countdownBar: { ...countdownBar, enabled } })}
      >
        <div>
          <label className={labelClass}>Date et heure limite</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={toDatetimeLocalValue(countdownBar.targetDate)}
            onChange={(e) => setChrome({ countdownBar: { ...countdownBar, targetDate: e.target.value ? new Date(e.target.value).toISOString() : null } })}
          />
        </div>
      </Toggle>

      <Toggle
        label="Notification d'achat (simulée)"
        checked={Boolean(purchaseNotification.enabled)}
        onChange={(enabled) => setChrome({ purchaseNotification: { ...purchaseNotification, enabled } })}
      >
        <p className="text-xs text-surface/40">
          Affiche périodiquement "Prénom vient d'acheter [produit]" en bas de page. Désactivée par défaut : à activer en connaissance de cause.
        </p>
        <div>
          <label className={labelClass}>Nom du produit</label>
          <input
            className={inputClass}
            placeholder="Ex : la formation"
            value={purchaseNotification.productName || ''}
            onChange={(e) => setChrome({ purchaseNotification: { ...purchaseNotification, productName: e.target.value } })}
          />
        </div>
      </Toggle>

      <Toggle
        label="Pied de page collant"
        checked={Boolean(stickyFooterCta.enabled)}
        onChange={(enabled) => setChrome({ stickyFooterCta: { ...stickyFooterCta, enabled } })}
      >
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Prix affiché (ex : 19 000 FCFA)"
            value={stickyFooterCta.price || ''}
            onChange={(e) => setChrome({ stickyFooterCta: { ...stickyFooterCta, price: e.target.value } })}
          />
          <input
            className={inputClass}
            placeholder="Texte du bouton"
            value={stickyFooterCta.buttonText || ''}
            onChange={(e) => setChrome({ stickyFooterCta: { ...stickyFooterCta, buttonText: e.target.value } })}
          />
        </div>
        <div>
          <label className={labelClass}>Page de commande (vers laquelle renvoie le bouton, depuis n'importe quelle page)</label>
          <select
            className={inputClass}
            value={stickyFooterCta.targetStepSlug || ''}
            onChange={(e) => setChrome({ stickyFooterCta: { ...stickyFooterCta, targetStepSlug: e.target.value || null } })}
          >
            <option value="">Étape suivante (par défaut)</option>
            {(steps || []).map((s) => (
              <option key={s.id} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </div>
      </Toggle>
    </div>
  );
}
