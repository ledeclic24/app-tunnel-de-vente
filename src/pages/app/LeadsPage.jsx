import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Lock, Mail, AlertTriangle, CheckCircle2, RefreshCw, Clock, XCircle, Undo2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchLeadsForUser, resendLeadEmail, setLeadRefunded } from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';
import { formatPrice } from '../../lib/currency';
import { useToast } from '../../components/app/Toast';
import GradientBanner from '../../components/ui/GradientBanner';
import Spinner from '../../components/app/Spinner';
import SortMenu from '../../components/app/SortMenu';

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Plus récent' },
  { value: 'created_asc', label: 'Plus ancien' },
];

// Tri côté client (liste déjà entièrement chargée) — 'created_desc' par
// défaut reproduit l'ordre déjà renvoyé par l'API (order: createdAt DESC).
function sortLeads(list, sortBy) {
  const dir = sortBy === 'created_desc' ? -1 : 1;
  return [...list].sort((a, b) => dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
}

// Un lead payé peut avoir n'importe quelle devise (selon le moyen de
// paiement utilisé) — on regroupe donc le total par devise plutôt que de
// tout additionner en un seul nombre qui n'aurait pas de sens.
function computeRevenueByCurrency(leads) {
  const totals = new Map();
  for (const lead of leads) {
    if (lead.payment_status !== 'paid' || !lead.paid_amount || lead.refunded_at) continue;
    const currency = lead.paid_currency || 'XOF';
    const amount = Number(lead.paid_amount) || 0;
    totals.set(currency, (totals.get(currency) || 0) + amount);
  }
  return Array.from(totals.entries());
}

function exportToCsv(leads) {
  const header = ['Nom', 'Email', 'Tunnel', 'Date', 'Statut paiement', 'Montant payé', 'Devise'];
  const rows = leads.map((l) => [
    l.name || '', l.email, l.funnelName, new Date(l.created_at).toLocaleString('fr-FR'),
    l.payment_status || '', l.paid_amount || '', l.paid_currency || '',
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vendeko-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadsPage() {
  const { effectiveOwnerId, effectiveProfile } = useAuth();
  const toast = useToast();
  const [leads, setLeads] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [refundingId, setRefundingId] = useState(null);
  const [sortBy, setSortBy] = useState('created_desc');
  const plan = getPlan(effectiveProfile?.plan);

  useEffect(() => {
    if (!effectiveOwnerId) return;
    fetchLeadsForUser(effectiveOwnerId).then(setLeads).catch(() => setLeads([]));
  }, [effectiveOwnerId]);

  const handleResend = async (leadId) => {
    setResendingId(leadId);
    try {
      const sent = await resendLeadEmail(leadId);
      setLeads((prev) => prev.map((l) => (l.id === leadId
        ? { ...l, email_status: sent ? 'sent' : 'failed' }
        : l)));
      if (sent) toast.success('E-mail renvoyé avec succès.');
      else toast.error("Le renvoi a échoué — vérifie la configuration email du service.");
    } catch (err) {
      toast.error(err.message || "Impossible de renvoyer cet e-mail.");
    } finally {
      setResendingId(null);
    }
  };

  const handleToggleRefund = async (lead) => {
    const nextRefunded = !lead.refunded_at;
    setRefundingId(lead.id);
    try {
      await setLeadRefunded(lead.id, nextRefunded);
      setLeads((prev) => prev.map((l) => (l.id === lead.id
        ? { ...l, refunded_at: nextRefunded ? new Date().toISOString() : null }
        : l)));
      toast.success(nextRefunded ? 'Marqué comme remboursé.' : 'Remboursement annulé.');
    } catch (err) {
      toast.error(err.message || "Impossible d'enregistrer ce remboursement.");
    } finally {
      setRefundingId(null);
    }
  };

  if (leads === null) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const visibleLimit = plan.leadsHistoryLimit ?? Infinity;
  const sortedLeads = sortLeads(leads, sortBy);
  const visibleLeads = sortedLeads.slice(0, visibleLimit === Infinity ? sortedLeads.length : visibleLimit);
  const hiddenCount = leads.length - visibleLeads.length;
  const revenueByCurrency = computeRevenueByCurrency(leads);
  // Exclut les leads remboursés, comme le total du revenu juste à côté —
  // sinon "2 ventes payées : 5 000 FCFA" semblerait incohérent si l'une
  // des deux a été remboursée entre-temps.
  const paidCount = leads.filter((l) => l.payment_status === 'paid' && !l.refunded_at).length;

  return (
    <div>
      <GradientBanner
        icon={Mail}
        title="Tes leads"
        description={
          revenueByCurrency.length > 0
            ? `${leads.length} prospect(s) capturé(s) — ${paidCount} vente(s) payée(s) : ${revenueByCurrency.map(([currency, total]) => formatPrice(total, currency)).join(' + ')}`
            : `${leads.length} prospect(s) capturé(s) au total.`
        }
        actions={
          plan.leadsExport ? (
            <button
              onClick={() => exportToCsv(leads)}
              disabled={leads.length === 0}
              className="magnetic-btn inline-flex items-center gap-2 bg-background text-primary px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-40"
            >
              <Download className="w-4 h-4" /> Exporter en CSV
            </button>
          ) : (
            <Link to="/app/billing" className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-3 rounded-full text-sm font-semibold">
              <Lock className="w-4 h-4" /> Export CSV — plan Pro
            </Link>
          )
        }
      />

      {leads.length === 0 && (
        <div className="text-center py-16 border border-dashed border-surface/20 rounded-[2rem]">
          <Mail className="w-8 h-8 text-surface/20 mx-auto mb-3" />
          <p className="text-surface/60">Aucun lead capturé pour l'instant.</p>
        </div>
      )}

      {leads.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <SortMenu value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
          </div>
          <div className="bg-background border border-surface/10 rounded-[2rem] overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface/10 bg-primary/5 text-left text-surface/50 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Nom</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Tunnel</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Paiement</th>
                  <th className="px-6 py-4 font-medium">Contenu envoyé</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead, i) => (
                  // Lignes alternées (zébrure légère, teinte accent) pour
                  // faciliter la lecture d'un tableau dense.
                  <tr key={lead.id} className={`border-b border-surface/5 last:border-0 ${i % 2 === 1 ? 'bg-accent/[0.03]' : ''}`}>
                    <td className="px-6 py-4 text-surface">{lead.name || '—'}</td>
                    <td className="px-6 py-4 text-surface/80">{lead.email}</td>
                    <td className="px-6 py-4 text-surface/60">{lead.funnelName}</td>
                    <td className="px-6 py-4 text-surface/40">{new Date(lead.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      {lead.payment_status === 'paid' && lead.refunded_at && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface/40 line-through">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Payé{lead.paid_amount ? ` — ${formatPrice(Number(lead.paid_amount), lead.paid_currency)}` : ''}
                          </span>
                          <button
                            onClick={() => handleToggleRefund(lead)}
                            disabled={refundingId === lead.id}
                            title="Annuler le marquage remboursé"
                            className="text-xs font-semibold text-surface/50 hover:text-accent disabled:opacity-50"
                          >
                            Remboursé
                          </button>
                        </div>
                      )}
                      {lead.payment_status === 'paid' && !lead.refunded_at && (
                        <div className="flex items-center gap-2 group">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Payé{lead.paid_amount ? ` — ${formatPrice(Number(lead.paid_amount), lead.paid_currency)}` : ''}
                          </span>
                          <button
                            onClick={() => handleToggleRefund(lead)}
                            disabled={refundingId === lead.id}
                            title="Marquer comme remboursé (pour ta propre comptabilité)"
                            className="opacity-0 group-hover:opacity-100 text-surface/30 hover:text-orange-500 transition-opacity disabled:opacity-50"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {lead.payment_status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500">
                          <Clock className="w-3.5 h-3.5" /> En attente
                        </span>
                      )}
                      {lead.payment_status === 'failed' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Échoué
                        </span>
                      )}
                      {!lead.payment_status && <span className="text-surface/30 text-xs">—</span>}
                      {lead.parent_lead_id && (
                        <span
                          className="block mt-1 text-[10px] font-mono uppercase tracking-wider text-accent/70"
                          title="Achat complémentaire (upsell) lié à une vente principale"
                        >
                          Vente complémentaire
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.email_status === 'sent' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reçu
                        </span>
                      )}
                      {lead.email_status === 'failed' && (
                        <button
                          onClick={() => handleResend(lead.id)}
                          disabled={resendingId === lead.id}
                          title={lead.email_error || 'Échec de l\'envoi'}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-400 disabled:opacity-50"
                        >
                          {resendingId === lead.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {resendingId === lead.id ? 'Renvoi...' : 'Échec — renvoyer'}
                        </button>
                      )}
                      {!lead.email_status && <span className="text-surface/30 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hiddenCount > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none h-24 -top-24" />
              <div className="flex flex-col items-center gap-3 py-8 border-t border-surface/10 bg-surface/[0.02]">
                <Lock className="w-5 h-5 text-surface/30" />
                <p className="text-sm text-surface/60">
                  {hiddenCount} lead{hiddenCount > 1 ? 's' : ''} supplémentaire{hiddenCount > 1 ? 's' : ''} masqué{hiddenCount > 1 ? 's' : ''} — le plan Starter garde tes {visibleLimit} derniers leads visibles.
                </p>
                <Link to="/app/billing" className="text-accent font-semibold text-sm hover:underline">Débloquer l'historique complet →</Link>
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
}
