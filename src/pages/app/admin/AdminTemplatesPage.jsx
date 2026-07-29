import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { fetchPendingTemplates, reviewTemplate } from '../../../lib/templatesApi';
import { useToast } from '../../../components/app/Toast';
import Spinner from '../../../components/app/Spinner';

export default function AdminTemplatesPage() {
  const toast = useToast();
  const [templates, setTemplates] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  if (!templates) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" tone="admin" />
      </div>
    );
  }

  return (
    <div>
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-zinc-100">{t.name}</p>
                <p className="text-xs text-zinc-500 mb-1">
                  Par {t.author?.email || 'utilisateur inconnu'} · {new Date(t.created_at).toLocaleDateString('fr-FR')} · {t.category}
                </p>
                {t.description && <p className="text-sm text-zinc-400 mt-2 max-w-2xl">{t.description}</p>}
                <p className="text-xs text-zinc-600 mt-2">{(t.content?.steps || []).length} page(s)</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
    </div>
  );
}
