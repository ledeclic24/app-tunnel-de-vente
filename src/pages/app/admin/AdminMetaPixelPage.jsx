import React, { useEffect, useState } from 'react';
import { Megaphone, UserPlus, Wallet, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  fetchMetaPixelSettings, updateMetaPixelSettings, fetchMetaPixelEvents, fetchMetaPixelStats,
} from '../../../lib/metaPixelApi';
import { formatPrice } from '../../../lib/currency';
import { CenteredSpinner } from '../../../components/app/Spinner';
import { useToast } from '../../../components/app/Toast';

const EVENT_LABELS = { CompleteRegistration: 'Inscription', Purchase: 'Achat' };
const STATUS_LABELS = { sent: 'Envoyé', failed: 'Échec', skipped: 'Ignoré' };
const STATUS_CLASS = {
  sent: 'bg-accent/10 text-accent',
  failed: 'bg-red-500/10 text-red-400',
  skipped: 'bg-background/10 text-background/40',
};

function StatCard({ icon: Icon, label, value, delay = 0 }) {
  return (
    <div
      className="hover-card fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6 flex items-center gap-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <div>
        <p className="text-2xl font-mono font-bold text-background">{value}</p>
        <p className="text-xs text-background/50 uppercase tracking-wider font-mono">{label}</p>
      </div>
    </div>
  );
}

function SettingsCard({ settings, onSaved }) {
  const toast = useToast();
  const [pixelId, setPixelId] = useState(settings.pixelId || '');
  const [capiAccessToken, setCapiAccessToken] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const patch = { pixelId };
      if (capiAccessToken) patch.capiAccessToken = capiAccessToken;
      const next = await updateMetaPixelSettings(patch);
      setCapiAccessToken('');
      toast.success('Réglages Pixel Meta enregistrés.');
      onSaved(next);
    } catch {
      toast.error("L'enregistrement a échoué. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveToken = async () => {
    setSaving(true);
    try {
      const next = await updateMetaPixelSettings({ capiAccessToken: '' });
      toast.success('Token Conversions API retiré.');
      onSaved(next);
    } catch {
      toast.error('Impossible de retirer le token. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Megaphone className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-background uppercase tracking-wider">Pixel Meta de l'app</h2>
          <p className="text-xs text-background/50 mt-1 max-w-lg">
            Suit les inscriptions et les passages en plan payant sur TonTunnel — pour tes publicités Facebook faites autour de l'app, pas pour les tunnels des vendeurs.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-background/70 uppercase tracking-wider mb-1">Identifiant du Pixel</label>
          <input
            className="w-full bg-primary/40 border border-background/10 rounded-xl px-4 py-2.5 text-sm font-mono text-background focus:outline-none focus:border-accent transition-colors"
            placeholder="1234567890123456"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value.trim())}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-background/70 uppercase tracking-wider">Token Conversions API</label>
            {settings.hasCapiToken && (
              <button type="button" onClick={handleRemoveToken} disabled={saving} className="text-xs text-background/40 hover:text-red-400 underline">
                Retirer
              </button>
            )}
          </div>
          <input
            type="password"
            className="w-full bg-primary/40 border border-background/10 rounded-xl px-4 py-2.5 text-sm font-mono text-background focus:outline-none focus:border-accent transition-colors"
            placeholder={settings.hasCapiToken ? '•••• déjà configuré — laisse vide pour ne pas changer' : 'Colle le token généré dans Meta Events Manager'}
            value={capiAccessToken}
            onChange={(e) => setCapiAccessToken(e.target.value.trim())}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="magnetic-btn mt-5 bg-accent text-primary px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 hover:brightness-110 transition-colors"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
}

export default function AdminMetaPixelPage() {
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState(null);
  const [page, setPage] = useState(1);
  const [eventFilter, setEventFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    Promise.all([fetchMetaPixelSettings(), fetchMetaPixelStats()]).then(([s, st]) => {
      setSettings(s);
      setStats(st);
    });
  }, []);

  useEffect(() => {
    setEvents(null);
    fetchMetaPixelEvents({ page, eventName: eventFilter || undefined, status: statusFilter || undefined })
      .then(setEvents);
  }, [page, eventFilter, statusFilter]);

  if (!settings || !stats) {
    return (
      <div className="flex items-center justify-center py-16">
        <CenteredSpinner tone="admin" />
      </div>
    );
  }

  const registrations = stats.byEvent.CompleteRegistration || { sent: 0, failed: 0, skipped: 0 };
  const purchases = stats.byEvent.Purchase || { sent: 0, failed: 0, skipped: 0 };
  const totalFailed = registrations.failed + purchases.failed;
  const totalPages = events ? Math.max(1, Math.ceil(events.total / events.pageSize)) : 1;

  return (
    <div>
      <SettingsCard settings={settings} onSaved={setSettings} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={UserPlus} label="Inscriptions suivies" value={registrations.sent} delay={0} />
        <StatCard icon={Wallet} label="Achats suivis" value={purchases.sent} delay={60} />
        <StatCard icon={Wallet} label="Revenu suivi" value={formatPrice(stats.trackedRevenue, 'XOF')} delay={120} />
        <StatCard icon={AlertTriangle} label="Envois en échec" value={totalFailed} delay={180} />
      </div>

      <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl overflow-hidden" style={{ animationDelay: '240ms' }}>
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-background/10">
          <select
            value={eventFilter}
            onChange={(e) => { setPage(1); setEventFilter(e.target.value); }}
            className="bg-primary/40 border border-background/10 rounded-lg px-3 py-1.5 text-xs text-background focus:outline-none"
          >
            <option value="">Tous les évènements</option>
            <option value="CompleteRegistration">Inscription</option>
            <option value="Purchase">Achat</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            className="bg-primary/40 border border-background/10 rounded-lg px-3 py-1.5 text-xs text-background focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="sent">Envoyé</option>
            <option value="failed">Échec</option>
            <option value="skipped">Ignoré</option>
          </select>
        </div>

        {!events ? (
          <CenteredSpinner tone="admin" />
        ) : events.items.length === 0 ? (
          <p className="text-center py-12 text-background/50 text-sm">Aucun évènement pour l'instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-background/40 text-[10px] uppercase tracking-wider font-mono border-b border-background/10">
                  <th className="px-6 py-3 font-normal">Évènement</th>
                  <th className="px-6 py-3 font-normal">Compte</th>
                  <th className="px-6 py-3 font-normal">Valeur</th>
                  <th className="px-6 py-3 font-normal">Statut</th>
                  <th className="px-6 py-3 font-normal">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background/5">
                {events.items.map((e) => (
                  <tr key={e.id}>
                    <td className="px-6 py-4 text-background font-medium">{EVENT_LABELS[e.eventName] || e.eventName}</td>
                    <td className="px-6 py-4 text-background/60 text-xs">{e.userEmail || '—'}</td>
                    <td className="px-6 py-4 text-background/70 font-mono text-xs">
                      {e.value !== null ? formatPrice(e.value, e.currency) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_CLASS[e.status]}`}>
                        {STATUS_LABELS[e.status] || e.status}
                      </span>
                      {e.errorMessage && (
                        <p className="text-[10px] text-background/30 mt-1 max-w-xs truncate" title={e.errorMessage}>{e.errorMessage}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-background/40 text-xs font-mono">
                      {new Date(e.createdAt).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {events && events.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-background/10 text-xs text-background/50">
            <span>Page {page} / {totalPages} · {events.total} évènement{events.total > 1 ? 's' : ''}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-background/10 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-background/10 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
