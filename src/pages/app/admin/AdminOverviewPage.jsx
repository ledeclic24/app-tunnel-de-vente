import React, { useEffect, useState } from 'react';
import { Users, Layers, Rocket, Mail, Shield, ArrowRight } from 'lucide-react';
import { fetchAllProfiles, fetchAllFunnels, fetchAllLeadCounts, setAdminByEmail } from '../../../lib/adminApi';
import { useAuth } from '../../../context/AuthContext';
import { PLAN_ORDER, getPlan } from '../../../lib/plans';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <div>
        <p className="text-2xl font-mono font-bold text-zinc-50">{value}</p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">{label}</p>
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

  const load = async () => {
    const [p, f, l] = await Promise.all([fetchAllProfiles(), fetchAllFunnels(), fetchAllLeadCounts()]);
    setProfiles(p);
    setFunnels(f);
    setLeadCounts(l);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePromote = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      await setAdminByEmail(email.trim(), true);
      setMessage({ type: 'success', text: `${email.trim()} est maintenant administrateur.` });
      setEmail('');
      await load();
      if (email.trim() === user?.email) await refreshProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.message === 'NOT_FOUND' ? "Aucun compte avec cet email." : "Une erreur est survenue." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!profiles || !funnels || !leadCounts) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const totalLeads = Object.values(leadCounts).reduce((a, b) => a + b, 0);
  const publishedCount = funnels.filter((f) => f.is_published).length;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Utilisateurs" value={profiles.length} />
        <StatCard icon={Layers} label="Tunnels" value={funnels.length} />
        <StatCard icon={Rocket} label="Tunnels publiés" value={publishedCount} />
        <StatCard icon={Mail} label="Leads capturés" value={totalLeads} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Répartition par plan</h2>
          <div className="space-y-3">
            {PLAN_ORDER.map((key) => {
              const count = profiles.filter((p) => (p.plan || 'starter') === key).length;
              const pct = profiles.length ? Math.round((count / profiles.length) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{getPlan(key).name}</span>
                    <span className="text-zinc-500 font-mono text-xs">{count}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-1 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Nommer un administrateur
          </h2>
          <p className="text-xs text-zinc-500 mb-4">La personne doit déjà avoir un compte Vendeko.</p>
          <form onSubmit={handlePromote} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-500 text-zinc-950 px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center gap-1 shrink-0 hover:bg-emerald-400 transition-colors"
            >
              Nommer <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          {message && (
            <p className={`text-sm mt-3 ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{message.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}
