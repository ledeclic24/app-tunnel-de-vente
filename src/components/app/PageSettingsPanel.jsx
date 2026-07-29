import React from 'react';
import { Lock } from 'lucide-react';
import { resolveStickyFooterPrice } from '../../lib/currency';

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
export default function PageSettingsPanel({ step, steps, plan, onSave, onChangeStepType, blocksByStepId, currency }) {
  if (!step) return null;

  if (!plan.pageChrome) {
    return (
      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 text-center">
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
  const exitIntent = chrome.exitIntent || {};
  const upsellDecline = chrome.upsellDecline || {};
  const isUpsell = step.stepType === 'upsell';

  // Toutes les offres (bloc Tarifs) du tunnel entier, pas seulement de cette
  // page — le pied de page collant peut très bien promouvoir l'offre d'une
  // autre étape. Le prix affiché n'est jamais retapé : il est toujours
  // résolu depuis l'offre choisie ici (voir resolveStickyFooterPrice).
  const offerOptions = [];
  for (const s of steps || []) {
    for (const block of blocksByStepId?.[s.id] || []) {
      if (block.type !== 'pricing') continue;
      (block.content?.plans || []).forEach((p, planIndex) => {
        offerOptions.push({
          blockId: block.id,
          planIndex,
          label: `${s.name} — ${p.name || `Offre ${planIndex + 1}`}`,
        });
      });
    }
  }
  const allBlocks = Object.values(blocksByStepId || {}).flat();
  const stickyFooterSelected = stickyFooterCta.priceBlockId
    ? `${stickyFooterCta.priceBlockId}:${stickyFooterCta.planIndex}`
    : '';
  const stickyFooterResolvedPrice = resolveStickyFooterPrice(stickyFooterCta, allBlocks, currency);

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] p-4 md:p-6 space-y-4">
      <p className="text-xs text-surface/40">
        Réglages propres à cette page ({step.name}) — chaque page du tunnel a les siens.
      </p>

      <div>
        <label className={labelClass}>Type de page</label>
        <select
          className={inputClass}
          value={isUpsell ? 'upsell' : ''}
          onChange={(e) => onChangeStepType?.(e.target.value === 'upsell' ? 'upsell' : 'custom')}
        >
          <option value="">Page standard</option>
          <option value="upsell">Upsell — offre complémentaire après achat</option>
        </select>
        {isUpsell && (
          <p className="text-xs text-surface/40 mt-1">
            Cette page n'est accessible que juste après un paiement confirmé sur ce tunnel (même protection que le reste du contenu post-achat) — jamais en navigation normale.
          </p>
        )}
      </div>

      {isUpsell && (
        <Toggle
          label="Bouton de refus"
          checked={Boolean(upsellDecline.enabled)}
          onChange={(enabled) => setChrome({ upsellDecline: { ...upsellDecline, enabled } })}
        >
          <p className="text-xs text-surface/40">
            Permet au client de refuser cette offre complémentaire et de continuer sans payer une seconde fois.
          </p>
          <div>
            <label className={labelClass}>Texte du bouton</label>
            <input
              className={inputClass}
              placeholder="Non merci, continuer"
              value={upsellDecline.buttonText || ''}
              onChange={(e) => setChrome({ upsellDecline: { ...upsellDecline, buttonText: e.target.value } })}
            />
          </div>
          <div>
            <label className={labelClass}>Page vers laquelle renvoie le refus</label>
            <select
              className={inputClass}
              value={upsellDecline.targetStepSlug || ''}
              onChange={(e) => setChrome({ upsellDecline: { ...upsellDecline, targetStepSlug: e.target.value || null } })}
            >
              <option value="">Étape suivante (par défaut)</option>
              {(steps || []).map((s) => (
                <option key={s.id} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>
        </Toggle>
      )}

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
        <div>
          <label className={labelClass}>Offre affichée (prix toujours à jour, et le bouton fait payer directement cette offre au clic)</label>
          {offerOptions.length === 0 ? (
            <p className="text-xs text-surface/50 bg-surface/5 rounded-xl px-4 py-2.5">
              Ajoute d'abord un bloc Tarifs à ce tunnel pour pouvoir afficher un prix ici.
            </p>
          ) : (
            <>
              <select
                className={inputClass}
                value={stickyFooterSelected}
                onChange={(e) => {
                  const [blockId, planIndexStr] = e.target.value.split(':');
                  setChrome({
                    stickyFooterCta: blockId
                      ? { ...stickyFooterCta, priceBlockId: blockId, planIndex: Number(planIndexStr) }
                      : { ...stickyFooterCta, priceBlockId: null, planIndex: null },
                  });
                }}
              >
                <option value="">Aucune (le bouton renvoie vers une page à la place)</option>
                {offerOptions.map((o) => (
                  <option key={`${o.blockId}:${o.planIndex}`} value={`${o.blockId}:${o.planIndex}`}>{o.label}</option>
                ))}
              </select>
              {stickyFooterResolvedPrice && (
                <p className="text-xs text-surface/40 mt-1">Prix affiché : {stickyFooterResolvedPrice}</p>
              )}
            </>
          )}
        </div>
        <div>
          <label className={labelClass}>Texte du bouton</label>
          <input
            className={inputClass}
            placeholder="Commander (valeur par défaut si laissé vide)"
            value={stickyFooterCta.buttonText || ''}
            onChange={(e) => setChrome({ stickyFooterCta: { ...stickyFooterCta, buttonText: e.target.value } })}
          />
        </div>
        <div>
          <label className={labelClass}>Page de commande (si aucune offre n'est choisie ci-dessus)</label>
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
          {stickyFooterCta.priceBlockId && (
            <p className="text-xs text-surface/40 mt-1">Une offre est sélectionnée ci-dessus : le bouton paiera directement, ce réglage ne sera pas utilisé.</p>
          )}
        </div>
      </Toggle>

      <Toggle
        label="Capture à l'intention de sortie"
        checked={Boolean(exitIntent.enabled)}
        onChange={(enabled) => setChrome({ exitIntent: { ...exitIntent, enabled } })}
      >
        <p className="text-xs text-surface/40">
          S'affiche quand le visiteur s'apprête à quitter la page (uniquement sur ordinateur, jamais sur mobile). Une seule fois par visite.
        </p>
        <div>
          <label className={labelClass}>Titre</label>
          <input
            className={inputClass}
            placeholder="Attends, une dernière chose..."
            value={exitIntent.heading || ''}
            onChange={(e) => setChrome({ exitIntent: { ...exitIntent, heading: e.target.value } })}
          />
        </div>
        <div>
          <label className={labelClass}>Description (optionnel)</label>
          <input
            className={inputClass}
            placeholder="Ex : profite de -20% si tu commandes maintenant"
            value={exitIntent.description || ''}
            onChange={(e) => setChrome({ exitIntent: { ...exitIntent, description: e.target.value } })}
          />
        </div>
        <div>
          <label className={labelClass}>Pourcentage de réduction (optionnel)</label>
          <input
            className={inputClass}
            type="number"
            min="1"
            max="99"
            placeholder="Ex : 20"
            value={exitIntent.discountPercent || ''}
            onChange={(e) => {
              const raw = e.target.value;
              const n = raw === '' ? null : Math.min(99, Math.max(1, Number(raw)));
              setChrome({ exitIntent: { ...exitIntent, discountPercent: n } });
            }}
          />
          <p className="text-xs text-surface/40 mt-1">
            Si renseigné, ce pourcentage est réellement appliqué au prix payé (pas seulement annoncé) dès que le visiteur clique sur le bouton ci-dessous — une seule fois par visiteur, même s'il quitte et revient plusieurs fois.
          </p>
        </div>
        <div>
          <label className={labelClass}>Texte du bouton</label>
          <input
            className={inputClass}
            placeholder="J'en profite"
            value={exitIntent.buttonText || ''}
            onChange={(e) => setChrome({ exitIntent: { ...exitIntent, buttonText: e.target.value } })}
          />
        </div>
        <div>
          <label className={labelClass}>Page vers laquelle renvoie le bouton</label>
          <select
            className={inputClass}
            value={exitIntent.targetStepSlug || ''}
            onChange={(e) => setChrome({ exitIntent: { ...exitIntent, targetStepSlug: e.target.value || null } })}
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
