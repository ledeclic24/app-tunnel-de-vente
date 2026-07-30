import React, { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { fetchAuditLog } from '../../../lib/growthApi';
import Spinner from '../../../components/app/Spinner';

const ACTION_LABELS = {
  'plan.change': 'Changement de plan',
  'admin.grant': 'Statut administrateur activé',
  'admin.revoke': 'Statut administrateur retiré',
  'funnel.delete': 'Suppression de tunnel',
  'account.delete': 'Suppression de compte',
};

function describeMeta(action, meta) {
  if (action === 'plan.change' && meta) return `${meta.previous || '—'} → ${meta.next || '—'}`;
  if (action === 'account.delete' && meta?.self_service) return 'Initiée par le titulaire du compte';
  return '';
}

export default function AdminAuditLogPage() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLog(100).then(setEvents).catch(() => setError("Impossible de charger le journal d'audit."));
  }, []);

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!events) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" tone="admin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <ScrollText className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-sans font-bold text-background">Journal d'audit</h1>
      </div>
      <p className="text-background/50 text-sm mb-6">Trace des actions sensibles : changement de plan, statut administrateur, suppression de tunnel ou de compte.</p>

      <div className="fade-in-up bg-block-card border border-background/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background/10 text-left text-background/50 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Cible</th>
                <th className="px-6 py-4 font-medium">Détail</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-background/5 last:border-0 hover:bg-background/5 transition-colors">
                  <td className="px-6 py-4 text-background/50 whitespace-nowrap">{new Date(e.created_at).toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4 text-background font-medium">{ACTION_LABELS[e.action] || e.action}</td>
                  <td className="px-6 py-4 text-background/60">{e.target || '—'}</td>
                  <td className="px-6 py-4 text-background/50">{describeMeta(e.action, e.meta)}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-background/40">Aucun évènement enregistré pour l'instant.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
