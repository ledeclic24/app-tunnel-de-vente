import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { useAuth } from '../../context/AuthContext';
import { isApiConfigured } from '../../lib/apiClient';
import SetupRequired from '../../components/app/SetupRequired';

export default function ResetPasswordPage() {
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!isApiConfigured) return <SetupRequired />;

  if (!token) {
    return (
      <AuthLayout
        title="Lien invalide ou expiré"
        footer={<>Retour à la <Link to="/connexion" className="text-accent hover:underline">connexion</Link></>}
      >
        <p className="text-surface/80 text-sm">
          Ce lien de réinitialisation n'est plus valide. Demande un nouveau lien depuis la page{' '}
          <Link to="/mot-de-passe-oublie" className="text-accent hover:underline">mot de passe oublié</Link>.
        </p>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const { error } = await confirmPasswordReset(token, password);
    setLoading(false);
    if (error) {
      setError(error.status === 400
        ? 'Ce lien de réinitialisation a expiré ou a déjà été utilisé.'
        : "Impossible de mettre à jour le mot de passe. Réessaie.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate('/connexion'), 1500);
  };

  if (done) {
    return (
      <AuthLayout title="Mot de passe mis à jour">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <CheckCircle2 className="w-10 h-10 text-accent" />
          <p className="text-surface/80">Ton mot de passe a été changé. Redirection vers la connexion...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choisis un nouveau mot de passe">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reset-password" className="block text-xs font-semibold text-surface/80 uppercase tracking-wider mb-1">Nouveau mot de passe</label>
          <PasswordInput id="reset-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="reset-confirm-password" className="block text-xs font-semibold text-surface/80 uppercase tracking-wider mb-1">Confirme le mot de passe</label>
          <PasswordInput id="reset-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} autoComplete="new-password" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="magnetic-btn btn-fill-slide group relative w-full bg-accent text-background px-6 py-4 rounded-xl text-sm font-semibold mt-4 shadow-lg shadow-accent/20 disabled:opacity-60"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </span>
          <div className="fill-layer bg-white/30 rounded-xl"></div>
        </button>
      </form>
    </AuthLayout>
  );
}
