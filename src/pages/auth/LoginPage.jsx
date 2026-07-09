import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import SetupRequired from '../../components/app/SetupRequired';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(/not confirmed/i.test(error.message)
        ? "Confirme d'abord ton adresse email : vérifie le lien reçu par email à l'inscription."
        : 'Email ou mot de passe incorrect.');
      return;
    }
    navigate('/app');
  };

  return (
    <AuthLayout
      title="Content de te revoir"
      subtitle="Connecte-toi pour retrouver tes tunnels de vente."
      footer={<>Pas encore de compte ? <Link to="/inscription" className="text-accent hover:underline">Essayer gratuitement</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-surface/80 uppercase tracking-wider mb-1">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="block text-xs font-semibold text-surface/80 uppercase tracking-wider">Mot de passe</label>
            <Link to="/mot-de-passe-oublie" className="text-xs text-accent hover:underline">Oublié ?</Link>
          </div>
          <PasswordInput id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="magnetic-btn btn-fill-slide group relative w-full bg-accent text-background px-6 py-4 rounded-xl text-sm font-semibold mt-4 shadow-lg shadow-accent/20 disabled:opacity-60"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? 'Connexion...' : 'Se connecter'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </span>
          <div className="fill-layer bg-white/30 rounded-xl"></div>
        </button>
      </form>
    </AuthLayout>
  );
}
