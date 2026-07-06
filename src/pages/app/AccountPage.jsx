import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { getPlan } from '../../lib/plans';

export default function AccountPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const plan = getPlan(profile?.plan);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-sans font-bold text-surface mb-6">Mon compte</h1>

      <form onSubmit={handleSave} className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">Email</label>
          <input value={user?.email || ''} disabled className="w-full bg-surface/5 border border-surface/10 rounded-xl px-4 py-3 text-sm text-surface/50" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">Prénom</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface/70 uppercase tracking-wider mb-1">Plan</label>
          <p className="text-sm text-surface px-4 py-3 bg-surface/5 rounded-xl">{plan.name}</p>
        </div>
        <button type="submit" disabled={saving} className="magnetic-btn bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
          {saving ? 'Enregistrement...' : saved ? 'Enregistré ✓' : 'Enregistrer'}
        </button>
      </form>

      <button onClick={handleSignOut} className="hover-lift flex items-center gap-2 text-sm text-surface/60 hover:text-red-500 transition-colors">
        <LogOut className="w-4 h-4" /> Se déconnecter
      </button>
    </div>
  );
}
