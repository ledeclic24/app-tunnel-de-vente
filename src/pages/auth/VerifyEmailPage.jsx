import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { isApiConfigured } from '../../lib/apiClient';
import SetupRequired from '../../components/app/SetupRequired';
import Spinner from '../../components/app/Spinner';

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('pending'); // 'pending' | 'success' | 'error'

  useEffect(() => {
    if (!isApiConfigured || !token) { setStatus('error'); return; }
    let cancelled = false;
    verifyEmail(token).then(({ error }) => {
      if (cancelled) return;
      setStatus(error ? 'error' : 'success');
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (status !== 'success') return undefined;
    const t = setTimeout(() => navigate('/app'), 2000);
    return () => clearTimeout(t);
  }, [status, navigate]);

  if (!isApiConfigured) return <SetupRequired />;

  if (status === 'success') {
    return (
      <AuthLayout title="Email confirmé">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <CheckCircle2 className="w-10 h-10 text-accent" />
          <p className="text-surface/80">Ton adresse email est confirmée. Redirection vers ton tableau de bord...</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'error') {
    return (
      <AuthLayout
        title="Lien invalide ou expiré"
        footer={<>Retour à <Link to="/app" className="text-accent hover:underline">mon compte</Link></>}
      >
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <XCircle className="w-10 h-10 text-red-400" />
          <p className="text-surface/80 text-sm">
            Ce lien de confirmation n'est plus valide (il expire après 24 heures). Tu peux en redemander un depuis ton compte, dans TonTunnel.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Confirmation en cours...">
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    </AuthLayout>
  );
}
