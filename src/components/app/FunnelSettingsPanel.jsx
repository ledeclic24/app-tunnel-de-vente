import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Check, Globe, RefreshCw, Trash2 } from 'lucide-react';
import { fetchDomains, addDomain, checkDomainStatus, removeDomain } from '../../lib/domainsApi';
import { useConfirm } from './ConfirmDialog';

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

const DOMAIN_ERRORS = {
  domain_service_unavailable: "La connexion de domaine n'est pas encore configurée côté serveur.",
  domain_already_used: 'Ce domaine est déjà connecté à un autre tunnel.',
  domain_add_failed: "Impossible d'ajouter ce domaine. Vérifie l'orthographe et réessaie.",
};

const STATUS_LABEL = { pending: 'En attente de DNS', active: 'Actif (SSL en place)', misconfigured: 'DNS mal configuré' };
const STATUS_CLASS = {
  pending: 'bg-orange-500/10 text-orange-500',
  active: 'bg-accent/10 text-accent',
  misconfigured: 'bg-red-500/10 text-red-500',
};

function DnsRow({ type, name, value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center text-xs font-mono bg-primary/5 rounded-lg px-3 py-2">
      <span className="text-surface/50 uppercase">{type}</span>
      <span className="text-surface truncate">{name} → {value}</span>
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="text-accent shrink-0"
      >
        {copied ? 'Copié' : 'Copier'}
      </button>
    </div>
  );
}

// Valeurs A/CNAME renvoyées en direct par l'API Vercel (jamais codées en
// dur ici, voir DomainsService côté serveur) — valables quel que soit le
// registrar ou hébergeur DNS du domaine de l'utilisateur, seul le contrôle
// des enregistrements DNS compte, pas l'endroit où le domaine a été acheté.
function DnsInstructions({ verification }) {
  const config = verification?.config;
  const ipv4 = config?.recommendedIPv4?.[0]?.value?.[0];
  const cname = config?.recommendedCNAME?.[0]?.value;
  if (!ipv4 && !cname) {
    return <p className="text-xs text-surface/50">Clique sur vérifier pour récupérer les enregistrements DNS à ajouter.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-surface/50">
        Ajoute UN de ces deux enregistrements chez ton hébergeur DNS (peu importe où le domaine a été acheté — OVH, Hostinger, GoDaddy, Namecheap...), selon que c'est un domaine racine ou un sous-domaine :
      </p>
      {ipv4 && <DnsRow type="A" name="Domaine racine (ex. masuperoffre.com) — nom : @" value={ipv4} />}
      {cname && <DnsRow type="CNAME" name="Sous-domaine (ex. boutique.masuperoffre.com) — nom : boutique" value={cname} />}
      <p className="text-xs text-surface/40">Puis clique sur vérifier — la propagation DNS peut prendre jusqu'à quelques heures.</p>
    </div>
  );
}

function DomainSection({ funnelId }) {
  const [domains, setDomains] = useState(null);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [checkingId, setCheckingId] = useState(null);
  const [error, setError] = useState('');
  const confirm = useConfirm();

  useEffect(() => {
    fetchDomains().then((all) => setDomains(all.filter((d) => d.funnelId === funnelId))).catch(() => setDomains([]));
  }, [funnelId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newDomain.trim() || adding) return;
    setAdding(true);
    setError('');
    try {
      const domain = await addDomain(funnelId, newDomain.trim().toLowerCase());
      setDomains((prev) => [...prev, domain]);
      setNewDomain('');
    } catch (err) {
      setError(DOMAIN_ERRORS[err.message] || "Une erreur est survenue. Réessaie.");
    }
    setAdding(false);
  };

  const handleCheck = async (domainId) => {
    setCheckingId(domainId);
    try {
      const updated = await checkDomainStatus(domainId);
      setDomains((prev) => prev.map((d) => (d.id === domainId ? updated : d)));
    } catch {
      setError('La vérification a échoué. Réessaie dans quelques instants.');
    }
    setCheckingId(null);
  };

  const handleRemove = async (domainId) => {
    if (!(await confirm('Déconnecter ce domaine ?'))) return;
    await removeDomain(domainId);
    setDomains((prev) => prev.filter((d) => d.id !== domainId));
  };

  return (
    <div className="space-y-5 pt-6 border-t border-surface/10">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-surface/40" />
        <h3 className="font-sans font-semibold text-surface">Domaine personnalisé</h3>
      </div>
      <p className="text-sm text-surface/60">
        Connecte un domaine que tu possèdes déjà (ex. masuperoffre.com) pour publier ce tunnel dessus, avec SSL automatique.
      </p>

      {domains?.map((d) => (
        <div key={d.id} className="border border-surface/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-surface">{d.domain}</p>
              <span className={`inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_CLASS[d.status]}`}>
                {STATUS_LABEL[d.status] || d.status}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleCheck(d.id)} disabled={checkingId === d.id} className="p-2 rounded-lg text-surface/40 hover:text-surface" aria-label="Vérifier">
                <RefreshCw className={`w-4 h-4 ${checkingId === d.id ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => handleRemove(d.id)} className="p-2 rounded-lg text-surface/40 hover:text-red-500" aria-label="Déconnecter">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {d.status !== 'active' && <DnsInstructions verification={d.verification} />}
        </div>
      ))}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="masuperoffre.com"
          className={`${inputClass} flex-1`}
        />
        <button
          type="submit"
          disabled={!newDomain.trim() || adding}
          className="magnetic-btn shrink-0 bg-primary text-background px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {adding ? 'Connexion...' : 'Connecter'}
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
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
    <div className="space-y-8">
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

      <DomainSection funnelId={funnel.id} />

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
