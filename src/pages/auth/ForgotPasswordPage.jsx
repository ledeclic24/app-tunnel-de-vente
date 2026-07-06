import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, MailCheck } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import SetupRequired from '../../components/app/SetupRequired';

export default function ForgotPasswordPage() {
  const { user, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error.status === 429
        ? "Trop de tentatives en peu de temps. Réessaie dans quelques minutes."
        : "Impossible d'envoyer l'email pour le moment. Réessaie plus tard.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Vérifie ta boîte mail"
        footer={<>Retour à la <Link to="/connexion" className="text-accent hover:underline">connexion</Link></>}
      >
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <MailCheck className="w-10 h-10 text-accent" />
          <p className="text-surface/80">
            Si un compte existe pour <span className="font-semibold text-surface">{email}</span>, un email
            de réinitialisation vient d'être envoyé. Clique sur le lien qu'il contient pour choisir un nouveau mot de passe.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Indique ton email, on t'envoie un lien pour le réinitialiser."
      footer={<>Tu t'en souviens ? <Link to="/connexion" className="text-accent hover:underline">Se connecter</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold text-surface/80 uppercase tracking-wider mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="magnetic-btn btn-fill-slide group relative w-full bg-accent text-background px-6 py-4 rounded-xl text-sm font-semibold mt-4 shadow-lg shadow-accent/20 disabled:opacity-60"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? 'Envoi...' : 'Envoyer le lien'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </span>
          <div className="fill-layer bg-white/30 rounded-xl"></div>
        </button>
      </form>
    </AuthLayout>
  );
}
