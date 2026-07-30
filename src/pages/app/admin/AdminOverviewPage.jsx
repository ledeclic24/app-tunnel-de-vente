import React, { useEffect, useState } from 'react';
import { Users, Layers, Rocket, Mail, Shield, ArrowRight, Megaphone } from 'lucide-react';
import { fetchAllProfiles, fetchAllFunnels, fetchAllLeadCounts, setAdminStatus } from '../../../lib/adminApi';
import { fetchSocialProof, updateSocialProof } from '../../../lib/socialProofApi';
import { useAuth } from '../../../context/AuthContext';
import { PLAN_ORDER, getPlan } from '../../../lib/plans';
import Spinner from '../../../components/app/Spinner';

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-300 disabled:opacity-50 ${
        checked ? 'bg-accent' : 'bg-background/15'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

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

export default function AdminOverviewPage() {
  const { user, refreshProfile } = useAuth();
  const [profiles, setProfiles] = useState(null);
  const [funnels, setFunnels] = useState(null);
  const [leadCounts, setLeadCounts] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [socialProofEnabled, setSocialProofEnabled] = useState(false);
  const [socialProofBusy, setSocialProofBusy] = useState(false);

  const load = async () => {
    const [p, f, l, sp] = await Promise.all([
      fetchAllProfiles(),
      fetchAllFunnels(),
      fetchAllLeadCounts(),
      fetchSocialProof(),
    ]);
    setProfiles(p);
    setFunnels(f);
    setLeadCounts(l);
    setSocialProofEnabled(Boolean(sp?.enabled));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleSocialProof = async (next) => {
    setSocialProofBusy(true);
    setSocialProofEnabled(next);
    try {
      await updateSocialProof(next);
    } catch {
      setSocialProofEnabled(!next);
    } finally {
      setSocialProofBusy(false);
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const target = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
      if (!target) throw new Error('NOT_FOUND');
      await setAdminStatus(target.id, true);
      setMessage({ type: 'success', text: `${email.trim()} est maintenant administrateur.` });
      setEmail('');
      await load();
      if (email.trim().toLowerCase() === user?.email?.toLowerCase()) await refreshProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.message === 'NOT_FOUND' ? "Aucun compte avec cet email." : "Une erreur est survenue." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!profiles || !funnels || !leadCounts) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" tone="admin" />
      </div>
    );
  }

  const totalLeads = Object.values(leadCounts).reduce((a, b) => a + b, 0);
  const publishedCount = funnels.filter((f) => f.is_published).length;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Utilisateurs" value={profiles.length} delay={0} />
        <StatCard icon={Layers} label="Tunnels" value={funnels.length} delay={60} />
        <StatCard icon={Rocket} label="Tunnels publiés" value={publishedCount} delay={120} />
        <StatCard icon={Mail} label="Leads capturés" value={totalLeads} delay={180} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6" style={{ animationDelay: '240ms' }}>
          <h2 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">Répartition par plan</h2>
          <div className="space-y-3">
            {PLAN_ORDER.map((key) => {
              const count = profiles.filter((p) => (p.plan || 'starter') === key).length;
              const pct = profiles.length ? Math.round((count / profiles.length) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-background/80">{getPlan(key).name}</span>
                    <span className="text-background/50 font-mono text-xs">{count}</span>
                  </div>
                  <div className="h-2 bg-background/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6" style={{ animationDelay: '300ms' }}>
          <h2 className="text-sm font-semibold text-background mb-1 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" /> Nommer un administrateur
          </h2>
          <p className="text-xs text-background/50 mb-4">La personne doit déjà avoir un compte TonTunnel.</p>
          <form onSubmit={handlePromote} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="flex-1 bg-primary/40 border border-background/10 rounded-xl px-4 py-3 text-sm text-background focus:outline-none focus:border-accent transition-colors"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="magnetic-btn bg-accent text-primary px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center gap-1 shrink-0 hover:brightness-110 transition-colors"
            >
              Nommer <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          {message && (
            <p className={`text-sm mt-3 ${message.type === 'success' ? 'text-accent' : 'text-red-400'}`}>{message.text}</p>
          )}
        </div>
      </div>

      <div className="fade-in-up bg-admin-card border border-background/10 rounded-2xl p-6 mt-6 flex items-center justify-between gap-6" style={{ animationDelay: '360ms' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <Megaphone className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-background uppercase tracking-wider">Preuve sociale sur la landing page</h2>
            <p className="text-xs text-background/50 mt-1 max-w-md">
              Affiche un toast avec les dernières vraies inscriptions et publications de tunnels. Reste désactivé tant qu'il n'y a pas assez de vendeurs actifs pour que ce soit crédible.
            </p>
          </div>
        </div>
        <ToggleSwitch checked={socialProofEnabled} onChange={handleToggleSocialProof} disabled={socialProofBusy} />
      </div>
    </div>
  );
}
