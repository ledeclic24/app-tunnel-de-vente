import React, { useEffect, useState } from 'react';
import { Check, Info, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { PLANS, PLAN_ORDER, getPlan, formatPrice } from '../../lib/plans';
import { updateBrandingForUser } from '../../lib/funnelsApi';
import { getLivePlans, logPlanChange } from '../../lib/plansApi';
import { createPayment } from '../../lib/paymentsApi';

const PAYMENT_STATUS_MESSAGES = {
  success: { tone: 'ok', text: 'Paiement reçu ! Ton nouveau plan sera actif dans quelques instants (rafraîchis si besoin).' },
  failed: { tone: 'error', text: "Le paiement n'a pas abouti. Tu peux réessayer ci-dessous." },
  cancelled: { tone: 'error', text: 'Paiement annulé. Tu peux réessayer quand tu veux.' },
};

export default function BillingPage() {
  const { profile, refreshProfile } = useAuth();
  const [changing, setChanging] = useState(null);
  const [payingKey, setPayingKey] = useState(null);
  const [error, setError] = useState('');
  const [livePlans, setLivePlans] = useState(PLANS);
  const [returnStatus, setReturnStatus] = useState(null);
  const currentPlan = profile?.plan || 'starter';
  const isAdmin = Boolean(profile?.is_admin);

  useEffect(() => {
    getLivePlans().then(setLivePlans).catch(() => setLivePlans(PLANS));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'retour') return;
    const status = params.get('paymentStatus');
    setReturnStatus(PAYMENT_STATUS_MESSAGES[status] || PAYMENT_STATUS_MESSAGES.success);
    refreshProfile();
    window.history.replaceState({}, '', '/app/billing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = async (planKey) => {
    if (planKey === currentPlan) return;
    setChanging(planKey);
    setError('');
    const { error: updateError } = await supabase.from('profiles').update({ plan: planKey }).eq('id', profile.id);
    if (updateError) {
      setError("Impossible de changer de plan pour le moment. Réessaie.");
      setChanging(null);
      return;
    }
    await updateBrandingForUser(profile.id, getPlan(planKey).showBranding);
    await logPlanChange(profile.id, currentPlan, planKey).catch(() => {});
    await refreshProfile();
    setChanging(null);
  };

  const handlePay = async (planKey) => {
    setPayingKey(planKey);
    setError('');
    try {
      const checkoutUrl = await createPayment(planKey);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message === 'already_on_plan' ? 'Tu es déjà sur ce plan.' : "Impossible de démarrer le paiement pour le moment. Réessaie dans un instant.");
      setPayingKey(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Facturation</h1>
      <p className="text-surface/60 mb-6">Choisis le plan adapté à ton usage.</p>

      {returnStatus && (
        <div className={`flex items-start gap-3 rounded-2xl p-4 mb-6 text-sm ${returnStatus.tone === 'ok' ? 'bg-accent/5 border border-accent/20 text-surface/70' : 'bg-red-500/5 border border-red-500/20 text-red-600'}`}>
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{returnStatus.text}</p>
        </div>
      )}

      {!isAdmin && (
        <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-2xl p-4 mb-8 text-sm text-surface/70">
          <CreditCard className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p>
            Paiement sécurisé par Mobile Money ou carte bancaire (Moneroo). Ton plan s'active automatiquement
            dès la confirmation du paiement, pour 30 jours renouvelables.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLAN_ORDER.map((key) => {
          const plan = livePlans[key];
          const isCurrent = key === currentPlan;
          return (
            <div key={key} className={`rounded-[2rem] p-8 border relative ${isCurrent ? 'bg-primary text-background border-accent/30 shadow-xl' : 'bg-background text-surface border-surface/10'}`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-background font-mono text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Plan actuel
                </div>
              )}
              <h3 className="text-xl font-sans mb-2">{plan.name}</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                {plan.price !== null && plan.price > 0 && <span className={isCurrent ? 'text-background/60 text-sm' : 'text-surface/60 text-sm'}>{plan.period}</span>}
              </div>
              <div className="space-y-2 mb-8">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-accent' : 'text-surface/40'}`} />
                    <span className={isCurrent ? 'text-background/90' : 'text-surface/80'}>{f}</span>
                  </div>
                ))}
              </div>
              {isAdmin ? (
                <button
                  onClick={() => handleChange(key)}
                  disabled={isCurrent || changing === key}
                  className={`magnetic-btn w-full py-3 rounded-full font-semibold disabled:opacity-50 ${isCurrent ? 'bg-background/10 text-background' : 'bg-accent text-background'}`}
                >
                  {isCurrent ? 'Plan actuel' : changing === key ? 'Changement...' : 'Choisir ce plan (admin)'}
                </button>
              ) : isCurrent ? (
                <button disabled className="w-full py-3 rounded-full font-semibold opacity-50 bg-background/10 text-background">
                  Plan actuel
                </button>
              ) : key === 'starter' ? (
                <button disabled className="w-full py-3 rounded-full font-semibold opacity-50 bg-primary/10 text-surface">
                  Plan gratuit
                </button>
              ) : (
                <button
                  onClick={() => handlePay(key)}
                  disabled={payingKey === key}
                  className="magnetic-btn w-full py-3 rounded-full font-semibold bg-accent text-background flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {payingKey === key ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Redirection...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Payer avec Moneroo
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
