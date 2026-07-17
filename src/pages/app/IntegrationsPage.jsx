import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { Link } from 'react-router-dom';
import { Lock, Plus, Trash2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFunnels } from '../../lib/funnelsApi';
import { fetchWebhooks, createWebhook, toggleWebhook, deleteWebhook, fetchWebhookLogs } from '../../lib/growthApi';
import { getPlan } from '../../lib/plans';
import { useConfirm } from '../../components/app/ConfirmDialog';

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function NewWebhookForm({ funnels, onCreate, onCancel }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [funnelId, setFunnelId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!label.trim()) {
      setError('Indique un nom pour ce webhook.');
      return;
    }
    if (!url.trim().startsWith('https://')) {
      setError("L'URL doit commencer par https://");
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({ label: label.trim(), url: url.trim(), funnelId: funnelId || null });
      setLabel('');
      setUrl('');
      setFunnelId('');
    } catch (err) {
      setError(err?.message || 'Impossible de créer ce webhook, réessaie.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface/[0.03] border border-surface/10 rounded-2xl p-5 mb-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-surface/60 mb-1.5">Nom du webhook</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex : Envoi vers Zapier"
            className="w-full bg-background border border-surface/15 rounded-xl px-4 py-2.5 text-sm text-surface outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface/60 mb-1.5">Tunnel concerné</label>
          <select
            value={funnelId}
            onChange={(e) => setFunnelId(e.target.value)}
            className="w-full bg-background border border-surface/15 rounded-xl px-4 py-2.5 text-sm text-surface outline-none focus:border-accent"
          >
            <option value="">Tous les tunnels</option>
            {funnels.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-surface/60 mb-1.5">URL de destination</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://hooks.zapier.com/hooks/catch/..."
          className="w-full bg-background border border-surface/15 rounded-xl px-4 py-2.5 text-sm text-surface outline-none focus:border-accent"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="magnetic-btn inline-flex items-center gap-2 bg-accent text-background px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? 'Création...' : 'Créer le webhook'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-surface/60 hover:text-surface"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function IntegrationsPage() {
  const { effectiveOwnerId, effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);
  const [webhooks, setWebhooks] = useState(null);
  const [funnels, setFunnels] = useState([]);
  const [logs, setLogs] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const confirm = useConfirm();

  const loadWebhooks = async (ownerId) => {
    const data = await fetchWebhooks(ownerId);
    setWebhooks(data);
    try {
      const logData = await fetchWebhookLogs(data.map((w) => w.id));
      setLogs(logData);
    } catch {
      setLogs([]);
    }
  };

  useEffect(() => {
    if (!effectiveOwnerId || !plan.webhooks) return;
    fetchUserFunnels(effectiveOwnerId).then(setFunnels).catch(() => setFunnels([]));
    loadWebhooks(effectiveOwnerId).catch(() => {
      setWebhooks([]);
      setLogs([]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveOwnerId, plan.webhooks]);

  if (!plan.webhooks) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-10 h-10 text-surface/30 mx-auto mb-4" />
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Webhooks réservés aux plans Pro et Entreprise</h1>
        <p className="text-surface/60 mb-6">
          Connecte tes tunnels à Zapier, Make ou ton CRM et reçois chaque nouveau lead automatiquement, avec le plan Pro ou Entreprise.
        </p>
        <Link to="/app/billing" className="magnetic-btn inline-flex bg-accent text-background px-6 py-3 rounded-full font-semibold">
          Voir les offres
        </Link>
      </div>
    );
  }

  const funnelNameById = new Map(funnels.map((f) => [f.id, f.name]));

  const handleCreate = async ({ label, url, funnelId }) => {
    await createWebhook({ userId: effectiveOwnerId, label, url, funnelId });
    setShowForm(false);
    await loadWebhooks(effectiveOwnerId);
  };

  const handleToggle = async (webhook) => {
    const nextActive = !webhook.active;
    setWebhooks((prev) => prev.map((w) => (w.id === webhook.id ? { ...w, active: nextActive } : w)));
    try {
      await toggleWebhook(webhook.id, nextActive);
    } catch {
      setWebhooks((prev) => prev.map((w) => (w.id === webhook.id ? { ...w, active: webhook.active } : w)));
      setError('Impossible de mettre à jour ce webhook, réessaie.');
    }
  };

  const handleDelete = async (webhook) => {
    if (!(await confirm(`Supprimer le webhook "${webhook.label}" ?`))) return;
    try {
      await deleteWebhook(webhook.id);
      await loadWebhooks(effectiveOwnerId);
    } catch {
      setError('Impossible de supprimer ce webhook, réessaie.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Intégrations"
        description="Un webhook envoie automatiquement les informations d'un nouveau lead vers un autre outil (Zapier, Google Sheets, ton CRM...) dès qu'il remplit un formulaire sur l'un de tes tunnels."
        className="mb-2"
      />
      <p className="text-surface/40 text-sm mb-8 max-w-2xl">
        Compatible avec Zapier (déclencheur « Webhooks by Zapier »), Make, ou toute autre URL capable de recevoir un envoi POST au format JSON.
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-sans font-bold text-surface">Tes webhooks</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="magnetic-btn inline-flex items-center gap-2 bg-surface text-background px-4 py-2.5 rounded-full text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Ajouter un webhook
          </button>
        )}
      </div>

      {showForm && (
        <NewWebhookForm funnels={funnels} onCreate={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {webhooks === null && <Spinner />}

      {webhooks && webhooks.length === 0 && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem] mb-10">
          <p className="text-surface/60">Aucun webhook configuré pour l'instant.</p>
        </div>
      )}

      {webhooks && webhooks.length > 0 && (
        <div className="bg-background border border-surface/10 rounded-[2rem] overflow-hidden mb-10">
          <div className="divide-y divide-surface/10">
            {webhooks.map((w) => (
              <div key={w.id} className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-surface font-medium">{w.label}</p>
                  <p className="text-surface/50 text-xs font-mono truncate max-w-md">{w.url}</p>
                  <p className="text-surface/40 text-xs mt-0.5">
                    {w.funnel_id ? (funnelNameById.get(w.funnel_id) || 'Tunnel supprimé') : 'Tous les tunnels'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(w)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${w.active ? 'bg-accent' : 'bg-surface/20'}`}
                    aria-label={w.active ? 'Désactiver ce webhook' : 'Activer ce webhook'}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full transition-transform ${w.active ? 'translate-x-5' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(w)}
                    className="p-2 text-surface/40 hover:text-red-500"
                    aria-label="Supprimer ce webhook"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-sans font-bold text-surface mb-1">Derniers envois</h2>
      <p className="text-surface/50 text-sm mb-4">
        Les envois se font en arrière-plan : on peut te confirmer l'heure à laquelle un lead a été envoyé, mais pas s'il a bien été reçu côté Zapier ou Make — vérifie directement dans ton outil en cas de doute.
      </p>

      {logs === null && <Spinner />}

      {logs && logs.length === 0 && (
        <div className="text-center py-12 border border-dashed border-surface/20 rounded-[2rem]">
          <p className="text-surface/60 text-sm">Aucun envoi pour l'instant.</p>
        </div>
      )}

      {logs && logs.length > 0 && (
        <div className="bg-background border border-surface/10 rounded-[2rem] overflow-hidden">
          <div className="divide-y divide-surface/10">
            {logs.map((log) => {
              const webhook = webhooks?.find((w) => w.id === log.webhook_id);
              return (
                <div key={log.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <div className="flex items-center gap-2 text-surface/70">
                    <Send className="w-3.5 h-3.5 text-surface/30" />
                    {webhook ? webhook.label : 'Webhook supprimé'}
                  </div>
                  <span className="text-surface/40 text-xs font-mono">
                    {new Date(log.dispatched_at).toLocaleString('fr-FR')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
