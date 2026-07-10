import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, MailCheck } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { useAuth } from '../../context/AuthContext';
import { isApiConfigured } from '../../lib/apiClient';
import SetupRequired from '../../components/app/SetupRequired';

export default function SignupPage() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  if (!isApiConfigured) return <SetupRequired />;
  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      if (error.message === 'User already registered') {
        setError('Un compte existe déjà avec cet email.');
      } else if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
        setError("Trop de tentatives d'inscription en peu de temps. Réessaie dans quelques minutes.");
      } else {
        setError("Impossible de créer le compte. Vérifie les informations saisies.");
      }
      return;
    }
    if (!data.session) {
      setConfirmationPending(true);
      return;
    }
    navigate('/app');
  };

  if (confirmationPending) {
    return (
      <AuthLayout
        title="Vérifie ta boîte mail"
        footer={<>Déjà confirmé ? <Link to="/connexion" className="text-accent hover:underline">Se connecter</Link></>}
      >
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <MailCheck className="w-10 h-10 text-accent" />
          <p className="text-surface/80">
            Un email de confirmation a été envoyé à <span className="font-semibold text-surface">{email}</span>.
            Clique sur le lien qu'il contient pour activer ton compte.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crée ton compte Vendeko"
      subtitle="Aucune carte bancaire requise. Ton premier tunnel est prêt en quelques minutes."
      footer={<>Déjà un compte ? <Link to="/connexion" className="text-accent hover:underline">Se connecter</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signup-fullname" className="block text-xs font-semibold text-surface/80 uppercase tracking-wider mb-1">Prénom</label>
          <input
            id="signup-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="block text-xs font-semibold text-surface/80 uppercase tracking-wider mb-1">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-xs font-semibold text-surface/80 uppercase tracking-wider mb-1">Mot de passe</label>
          <PasswordInput id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} autoComplete="new-password" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="magnetic-btn btn-fill-slide group relative w-full bg-accent text-background px-6 py-4 rounded-xl text-sm font-semibold mt-4 shadow-lg shadow-accent/20 disabled:opacity-60"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? 'Création...' : 'Créer mon tunnel gratuitement'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </span>
          <div className="fill-layer bg-white/30 rounded-xl"></div>
        </button>
      </form>
    </AuthLayout>
  );
}
