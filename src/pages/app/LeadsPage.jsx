import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchLeadsForUser } from '../../lib/funnelsApi';
import { getPlan } from '../../lib/plans';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';

function exportToCsv(leads) {
  const header = ['Nom', 'Email', 'Tunnel', 'Date'];
  const rows = leads.map((l) => [l.name || '', l.email, l.funnelName, new Date(l.created_at).toLocaleString('fr-FR')]);
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
  const [leads, setLeads] = useState(null);
  const plan = getPlan(effectiveProfile?.plan);

  useEffect(() => {
    if (!effectiveOwnerId) return;
    fetchLeadsForUser(effectiveOwnerId).then(setLeads).catch(() => setLeads([]));
  }, [effectiveOwnerId]);

  if (leads === null) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const visibleLimit = plan.leadsHistoryLimit ?? Infinity;
  const visibleLeads = leads.slice(0, visibleLimit === Infinity ? leads.length : visibleLimit);
  const hiddenCount = leads.length - visibleLeads.length;

  return (
    <div>
      <PageHeader
        title="Tes leads"
        description={`${leads.length} prospect(s) capturé(s) au total.`}
        actions={plan.leadsExport ? (
          <Button variant="dark" onClick={() => exportToCsv(leads)} disabled={leads.length === 0}>
            <Download className="w-4 h-4" /> Exporter en CSV
          </Button>
        ) : (
          <Button as={Link} to="/app/billing" variant="ghost" className="bg-surface/10 text-surface/60">
            <Lock className="w-4 h-4" /> Export CSV — plan Pro
          </Button>
        )}
      />

      {leads.length === 0 && (
        <EmptyState icon={Mail} title="Aucun lead pour l'instant" description="Les prospects capturés par tes tunnels apparaîtront ici." />
      )}

      {leads.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface/10 text-left text-surface/50 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Nom</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Tunnel</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-surface/5 last:border-0">
                    <td className="px-6 py-4 text-surface">{lead.name || '—'}</td>
                    <td className="px-6 py-4 text-surface/80">{lead.email}</td>
                    <td className="px-6 py-4 text-surface/60">{lead.funnelName}</td>
                    <td className="px-6 py-4 text-surface/40">{new Date(lead.created_at).toLocaleDateString('fr-FR')}</td>
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
        </Card>
      )}
    </div>
  );
}
