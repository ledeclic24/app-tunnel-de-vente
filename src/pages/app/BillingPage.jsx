import React, { useEffect, useState } from 'react';
import { Check, Info, CreditCard, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateUserPlanAsAdmin } from '../../lib/adminApi';
import { PLANS, PLAN_ORDER, getPlan, formatPrice } from '../../lib/plans';
import { updateBrandingForUser } from '../../lib/funnelsApi';
import { getLivePlans } from '../../lib/plansApi';
import { createPayment } from '../../lib/paymentsApi';
import { fetchCreditsBalance, fetchCreditPacks, purchaseCreditPack, fetchCreditTransactions } from '../../lib/creditsApi';
import GradientBanner from '../../components/ui/GradientBanner';
import CollapsibleSection from '../../components/app/CollapsibleSection';
import Spinner from '../../components/app/Spinner';

const PACK_LABELS = {
  boost: 'Boost',
  'pro-plus': 'Pro+',
  studio: 'Studio',
};

// Mêmes chaînes que celles passées à CreditsService.deduct/addCredits côté
// serveur (voir ai.service.ts, ebooks.service.ts, images.service.ts) —
// purement cosmétique, aucun impact sur le calcul du solde.
const REASON_LABELS = {
  monthly_refill: 'Recharge mensuelle',
  tunnel_generation: 'Génération de tunnel',
  tunnel_edit: 'Modification de tunnel (IA)',
  block_regeneration: 'Régénération de bloc',
  element_improvement: 'Amélioration de texte',
  image_generation: "Génération d'image",
  signature_visual_generation: 'Visuel signature',
  ebook_outline: "Sommaire d'ebook",
  ebook_chapter: "Chapitre d'ebook",
  ebook_chapter_regenerate: 'Régénération de chapitre',
  ebook_more_chapters: 'Chapitres supplémentaires',
};

function formatReason(reason) {
  if (reason.startsWith('pack_purchase:')) {
    const key = reason.split(':')[1];
    return `Achat pack ${PACK_LABELS[key] || key}`;
  }
  return REASON_LABELS[reason] || reason;
}

function CreditsHistorySection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchCreditTransactions({ limit: 30 }).then(setData).catch(() => setData({ rows: [] }));
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  if (data.rows.length === 0) {
    return <p className="text-sm text-surface/50">Aucun mouvement de crédits pour l'instant.</p>;
  }

  return (
    <div className="space-y-1">
      {data.rows.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between gap-4 py-2 border-b border-surface/5 last:border-0 text-sm">
          <div className="min-w-0">
            <p className="text-surface/80 truncate">{formatReason(tx.reason)}</p>
            <p className="text-xs text-surface/40">{new Date(tx.createdAt).toLocaleString('fr-FR')}</p>
          </div>
          <span className={`font-mono text-sm shrink-0 ${tx.amount > 0 ? 'text-accent' : 'text-surface/60'}`}>
            {tx.amount > 0 ? '+' : ''}{tx.amount}
          </span>
        </div>
      ))}
    </div>
  );
}

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
  const [balance, setBalance] = useState(null);
  const [packs, setPacks] = useState(null);
  const [buyingPack, setBuyingPack] = useState(null);
  const [packError, setPackError] = useState('');
  const currentPlan = profile?.plan || 'starter';
  const isAdmin = Boolean(profile?.is_admin);

  useEffect(() => {
    getLivePlans().then(setLivePlans).catch(() => setLivePlans(PLANS));
  }, []);

  useEffect(() => {
    fetchCreditsBalance().then(setBalance).catch(() => setBalance(null));
    fetchCreditPacks().then(setPacks).catch(() => setPacks([]));
  }, []);

  const handleBuyPack = async (packKey) => {
    setBuyingPack(packKey);
    setPackError('');
    try {
      const checkoutUrl = await purchaseCreditPack(packKey);
      window.location.href = checkoutUrl;
    } catch (err) {
      setPackError(err.message || "Impossible de démarrer l'achat pour le moment. Réessaie.");
      setBuyingPack(null);
    }
  };

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
    try {
      await updateUserPlanAsAdmin(profile.id, planKey);
      await updateBrandingForUser(profile.id, getPlan(planKey).showBranding);
      await refreshProfile();
    } catch {
      setError("Impossible de changer de plan pour le moment. Réessaie.");
    }
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
      <GradientBanner icon={CreditCard} title="Facturation" description="Choisis le plan adapté à ton usage." />

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
            Paiement sécurisé par Mobile Money ou carte bancaire. Ton plan s'active automatiquement
            dès la confirmation du paiement, pour 30 jours renouvelables.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLAN_ORDER.map((key) => {
          const plan = livePlans[key];
          const isCurrent = key === currentPlan;
          const isRecommended = !isCurrent && key === 'createur';
          return (
            <div key={key} className={`rounded-[2rem] p-8 border relative ${isCurrent ? 'bg-primary text-background border-accent/30 shadow-xl' : 'bg-background text-surface border-surface/10 shadow-soft'}`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-background font-mono text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Plan actuel
                </div>
              )}
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background font-mono text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Recommandé
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
                      <CreditCard className="w-4 h-4" /> Passer à ce plan
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {profile?.plan && profile.plan !== 'starter' && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-sans font-bold text-surface">Crédits IA</h2>
          </div>
          <p className="text-surface/60 mb-6 text-sm">
            {balance
              ? `Solde actuel : ${balance.balance} crédit${balance.balance > 1 ? 's' : ''} — ${balance.includedCredits} inclus chaque mois avec ton plan.`
              : 'Chargement du solde...'}
          </p>

          {packError && <p className="text-sm text-red-500 mb-4">{packError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(packs || []).map((pack) => (
              <div key={pack.key} className="bg-background border border-surface/10 rounded-[2rem] p-6 shadow-soft">
                <h3 className="font-sans font-semibold text-surface mb-1">{PACK_LABELS[pack.key] || pack.key}</h3>
                <p className="text-surface/60 text-sm mb-4">{pack.credits} crédits</p>
                <p className="text-2xl font-bold text-surface mb-4">{formatPrice(pack.price)}</p>
                <button
                  onClick={() => handleBuyPack(pack.key)}
                  disabled={buyingPack === pack.key}
                  className="magnetic-btn w-full py-3 rounded-full font-semibold bg-accent text-background flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {buyingPack === pack.key ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Redirection...
                    </>
                  ) : (
                    'Acheter ce pack'
                  )}
                </button>
              </div>
            ))}
          </div>

          <CollapsibleSection title="Historique des crédits">
            <CreditsHistorySection />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
