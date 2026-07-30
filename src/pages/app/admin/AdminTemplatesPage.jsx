import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Star, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { fetchPendingTemplates, reviewTemplate, fetchApprovedTemplatesForAdmin, setTemplateFeatured, unpublishTemplate } from '../../../lib/templatesApi';
import { useToast } from '../../../components/app/Toast';
import { useConfirm } from '../../../components/app/ConfirmDialog';
import Spinner from '../../../components/app/Spinner';
import FunnelPreviewModal from '../../../components/app/FunnelPreviewModal';
import { buildTemplatePreviewData } from '../../../lib/templatePreview';

// Avantage non-monétaire pour le créateur d'un modèle déjà approuvé — le
// marketplace reste gratuit (voir TemplatesService.setFeatured), la mise
// en avant n'est qu'un badge de visibilité côté public.
function ApprovedTemplatesSection({ onPreview }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [templates, setTemplates] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setTemplates(await fetchApprovedTemplatesForAdmin());
  };

  useEffect(() => { load(); }, []);

  const toggleFeatured = async (t) => {
    setBusyId(t.id);
    try {
      await setTemplateFeatured(t.id, !t.featured);
      await load();
    } catch (err) {
      toast.error(err.message || "La mise à jour a échoué.");
    } finally {
      setBusyId(null);
    }
  };

  const handleUnpublish = async (t) => {
    if (!(await confirm(`Retirer "${t.name}" du marketplace ? Le créateur en sera notifié par e-mail.`))) return;
    setBusyId(t.id);
    try {
      await unpublishTemplate(t.id);
      toast.success(`"${t.name}" retiré du marketplace.`);
      await load();
    } catch (err) {
      toast.error(err.message || "Le retrait a échoué.");
    } finally {
      setBusyId(null);
    }
  };

  if (!templates) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner size="lg" tone="admin" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-zinc-800 rounded-2xl">
        <p className="text-zinc-500">Aucun modèle approuvé pour l'instant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map((t) => (
        <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-zinc-100 truncate">{t.name}</p>
            <p className="text-xs text-zinc-500">{t.category} · {t.usage_count} utilisation{t.usage_count > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
            <button
              onClick={() => onPreview(t)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <Eye className="w-4 h-4" /> Aperçu
            </button>
            <button
              onClick={() => toggleFeatured(t)}
              disabled={busyId === t.id}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 ${
                t.featured ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <Star className={`w-4 h-4 ${t.featured ? 'fill-amber-400' : ''}`} />
              {t.featured ? 'Mis en avant' : 'Mettre en avant'}
            </button>
            <button
              onClick={() => handleUnpublish(t)}
              disabled={busyId === t.id}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
            >
              <EyeOff className="w-4 h-4" /> Dépublier
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminTemplatesPage() {
  const toast = useToast();
  const [templates, setTemplates] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [tab, setTab] = useState('pending');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const load = async () => {
    setTemplates(await fetchPendingTemplates());
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (template) => {
    setBusyId(template.id);
    try {
      await reviewTemplate(template.id, { status: 'approved' });
      await load();
    } catch (err) {
      toast.error(err.message || "L'approbation a échoué.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (template) => {
    setBusyId(template.id);
    try {
      await reviewTemplate(template.id, { status: 'rejected', rejectionReason: rejectionReason.trim() || undefined });
      setRejectingId(null);
      setRejectionReason('');
      await load();
    } catch (err) {
      toast.error(err.message || 'Le rejet a échoué.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('pending')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === 'pending' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
          >
            En attente
          </button>
          <button
            onClick={() => setTab('approved')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === 'approved' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
          >
            Approuvés — mise en avant
          </button>
        </div>
        <Link
          to="/app/templates"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Voir le marketplace
        </Link>
      </div>

      {tab === 'approved' ? (
        <ApprovedTemplatesSection onPreview={setPreviewTemplate} />
      ) : !templates ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" tone="admin" />
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-500 mb-4">
            Modèles publiés par des vendeurs, en attente de validation avant d'apparaître dans le marketplace public.
          </p>

          {templates.length === 0 && (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-500">Aucun modèle en attente.</p>
            </div>
          )}

          <div className="space-y-4">
            {templates.map((t) => (
              <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-100">{t.name}</p>
                    <p className="text-xs text-zinc-500 mb-1">
                      Par {t.author?.email || 'utilisateur inconnu'} · {new Date(t.created_at).toLocaleDateString('fr-FR')} · {t.category}
                    </p>
                    {t.description && <p className="text-sm text-zinc-400 mt-2 max-w-2xl">{t.description}</p>}
                    <p className="text-xs text-zinc-600 mt-2">{(t.content?.steps || []).length} page(s)</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                    <button
                      onClick={() => setPreviewTemplate(t)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Aperçu
                    </button>
                    <button
                      onClick={() => handleApprove(t)}
                      disabled={busyId === t.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                    >
                      <Check className="w-4 h-4" /> Approuver
                    </button>
                    <button
                      onClick={() => setRejectingId(rejectingId === t.id ? null : t.id)}
                      disabled={busyId === t.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                      <X className="w-4 h-4" /> Rejeter
                    </button>
                  </div>
                </div>
                {rejectingId === t.id && (
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Motif du rejet (optionnel)"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <button
                      onClick={() => handleReject(t)}
                      disabled={busyId === t.id}
                      className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white disabled:opacity-40"
                    >
                      Confirmer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {previewTemplate && (
        <FunnelPreviewModal
          {...buildTemplatePreviewData(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
