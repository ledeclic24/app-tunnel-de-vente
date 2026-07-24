import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, ShieldCheck, CreditCard, Trash2, Lock, Info, UserPlus, Wallet, ExternalLink, Zap, Copy, Check as CheckIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { fetchOrgMembers, inviteOrgMember, removeOrgMember } from '../../lib/growthApi';
import { fetchPaymentMethods, createPaymentMethod, deletePaymentMethod } from '../../lib/paymentMethodsApi';
import { API_URL } from '../../lib/apiClient';
import { useConfirm } from '../../components/app/ConfirmDialog';
import BillingPage from './BillingPage';

const TABS = [
  { key: 'equipe', label: 'Équipe', icon: Users },
  { key: 'paiements', label: 'Paiements', icon: Wallet },
  { key: 'securite', label: 'Sécurité', icon: ShieldCheck },
  { key: 'facturation', label: 'Facturation', icon: CreditCard },
];

const fieldClass = "flex-1 bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface";

function CopyableWebhookUrl({ url }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="w-full flex items-center justify-between gap-2 bg-primary/5 border border-surface/10 rounded-lg px-3 py-2 text-left"
    >
      <span className="font-mono text-xs text-surface/70 truncate">{url}</span>
      {copied ? <CheckIcon className="w-3.5 h-3.5 text-accent shrink-0" /> : <Copy className="w-3.5 h-3.5 text-surface/40 shrink-0" />}
    </button>
  );
}

function PaymentMethodsTab() {
  const [methods, setMethods] = useState(null);
  const [provider, setProvider] = useState('external_link');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const confirm = useConfirm();

  const load = useCallback(() => {
    fetchPaymentMethods().then(setMethods).catch(() => setMethods([]));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setLabel(''); setUrl(''); setSecretKey(''); setWebhookSecret('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    if (provider === 'external_link' && !url.trim()) return;
    if (provider === 'moneroo' && (!secretKey.trim() || !webhookSecret.trim())) return;
    setSaving(true);
    setError('');
    try {
      await createPaymentMethod(
        provider === 'moneroo'
          ? { label: label.trim(), provider, secretKey: secretKey.trim(), webhookSecret: webhookSecret.trim(), currency }
          : { label: label.trim(), provider, url: url.trim() },
      );
      resetForm();
      load();
    } catch {
      setError(provider === 'moneroo'
        ? 'Impossible de connecter ce compte Moneroo. Vérifie ta clé secrète et ton secret de webhook.'
        : "Impossible d'ajouter ce moyen de paiement. Vérifie que le lien est une URL valide (https://...).");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (method) => {
    if (!(await confirm(`Supprimer "${method.label}" ? Il ne sera plus disponible pour de nouveaux tunnels, mais restera inchangé sur les tunnels déjà publiés.`))) return;
    setRemovingId(method.id);
    try {
      await deletePaymentMethod(method.id);
      load();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
        <h2 className="text-sm font-sans font-semibold text-surface mb-1">Tes moyens de paiement</h2>
        <p className="text-sm text-surface/60 mb-4">
          Un simple lien externe (Wave, Orange Money, ou autre), ou un vrai flux de paiement intégré via Moneroo — le client paie sans jamais quitter ton tunnel, et l'argent va directement sur ton compte.
        </p>

        {methods === null ? (
          <p className="text-sm text-surface/40">Chargement...</p>
        ) : methods.length === 0 ? (
          <p className="text-sm text-surface/50">Aucun moyen de paiement enregistré pour l'instant.</p>
        ) : (
          <ul className="space-y-3 mb-2">
            {methods.map((m) => (
              <li key={m.id} className="bg-surface/5 rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-surface font-medium truncate">{m.label}</p>
                      {m.provider === 'moneroo' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/10 text-accent shrink-0">
                          <Zap className="w-3 h-3" /> Moneroo · {m.currency}
                        </span>
                      )}
                    </div>
                    {m.provider === 'external_link' ? (
                      <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-surface/50 hover:text-accent inline-flex items-center gap-1 truncate">
                        {m.url} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-xs text-surface/50">Paiement intégré au tunnel, redirection vers Moneroo à la validation.</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(m)}
                    disabled={removingId === m.id}
                    aria-label={`Supprimer ${m.label}`}
                    className="hover-lift text-surface/40 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {m.provider === 'moneroo' && (
                  <div>
                    <label className="block text-[11px] text-surface/50 mb-1">
                      URL de webhook à coller dans ton dashboard Moneroo (Paramètres → Webhooks) :
                    </label>
                    <CopyableWebhookUrl url={`${API_URL}/payments/moneroo/webhook/${m.id}`} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
        <h2 className="text-sm font-sans font-semibold text-surface mb-4">Ajouter un moyen de paiement</h2>

        <div className="inline-flex bg-surface/5 rounded-xl p-1 mb-4">
          {[
            { key: 'external_link', label: 'Lien externe' },
            { key: 'moneroo', label: 'Moneroo (intégré)' },
          ].map(({ key, label: tabLabel }) => (
            <button
              key={key}
              type="button"
              onClick={() => setProvider(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${provider === key ? 'bg-background text-surface shadow-sm' : 'text-surface/50 hover:text-surface/80'}`}
            >
              {tabLabel}
            </button>
          ))}
        </div>

        <form onSubmit={handleAdd} className="space-y-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={provider === 'moneroo' ? 'Ex : Moneroo — compte principal' : 'Ex : Wave, Orange Money...'}
            required
            className={fieldClass}
          />
          {provider === 'external_link' ? (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              type="url"
              required
              className={fieldClass}
            />
          ) : (
            <>
              <p className="text-xs text-surface/50">
                Récupère ces informations dans ton dashboard Moneroo (Paramètres → API). L'argent des paiements va directement sur ton compte Moneroo, Vendeko ne le touche jamais.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Clé secrète Moneroo"
                  type="password"
                  required
                  className={fieldClass}
                />
                <input
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Secret de webhook Moneroo"
                  type="password"
                  required
                  className={fieldClass}
                />
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${fieldClass} flex-none sm:w-28`}>
                  <option value="XOF">XOF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GHS">GHS</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={saving}
            className="magnetic-btn bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Ajout...' : provider === 'moneroo' ? 'Connecter ce compte Moneroo' : 'Ajouter'}
          </button>
        </form>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>
    </div>
  );
}

function TeamTab() {
  const { user, profile, effectiveOwnerId, effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);
  const isOwner = user?.id === effectiveOwnerId;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const confirm = useConfirm();

  const loadMembers = useCallback(async () => {
    if (!isOwner || !effectiveOwnerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchOrgMembers(effectiveOwnerId);
      setMembers(data);
    } catch {
      setLoadError("Impossible de charger l'équipe pour le moment. Réessaie.");
    } finally {
      setLoading(false);
    }
  }, [isOwner, effectiveOwnerId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  if (!isOwner) {
    return (
      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
        <p className="text-sm text-surface/70">Seul le propriétaire du compte peut gérer l'équipe.</p>
      </div>
    );
  }

  if (plan.teamSeats <= 1) {
    return (
      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 flex items-start gap-3">
        <Lock className="w-5 h-5 text-surface/40 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-surface/70 mb-3">La gestion d'équipe est réservée au plan Entreprise.</p>
          <Link to="/app/billing" className="magnetic-btn inline-block bg-accent text-background px-5 py-2.5 rounded-full text-sm font-semibold">
            Voir les plans
          </Link>
        </div>
      </div>
    );
  }

  const seatLimit = plan.teamSeats - 1;
  const occupiedSeats = members.length;
  const seatsFull = occupiedSeats >= seatLimit;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      await inviteOrgMember({ email: inviteEmail });
      setInviteEmail('');
      setInviteSuccess('Invitation envoyée par e-mail.');
      await loadMembers();
    } catch (err) {
      if (err?.status === 409) {
        setInviteError('Cette adresse a déjà été invitée.');
      } else if (err?.status === 403) {
        setInviteError(err.message || "Limite de places d'équipe atteinte.");
      } else {
        setInviteError("Impossible d'envoyer l'invitation. Réessaie.");
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (member) => {
    const label = member.invited_email || 'ce membre';
    if (!(await confirm(`Retirer ${label} de l'équipe ?`))) return;
    setRemovingId(member.id);
    try {
      await removeOrgMember(member.id);
      await loadMembers();
    } catch {
      setLoadError("Impossible de retirer ce membre pour le moment. Réessaie.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
        <h2 className="text-sm font-sans font-semibold text-surface mb-4">Membres de l'équipe</h2>

        {loadError && <p className="text-sm text-red-500 mb-4">{loadError}</p>}

        <ul className="space-y-3 mb-2">
          <li className="flex items-center justify-between gap-3 bg-surface/5 rounded-xl px-4 py-3">
            <span className="text-sm text-surface truncate">{effectiveProfile?.email || profile?.email}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary shrink-0">Propriétaire</span>
          </li>

          {loading && <li className="text-sm text-surface/50 px-1 py-2">Chargement...</li>}

          {!loading && members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 bg-surface/5 rounded-xl px-4 py-3">
              <span className="text-sm text-surface truncate">{member.invited_email}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    member.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                  }`}
                >
                  {member.status === 'active' ? 'Actif' : 'Invitation en attente'}
                </span>
                <button
                  onClick={() => handleRemove(member)}
                  disabled={removingId === member.id}
                  aria-label={`Retirer ${member.invited_email}`}
                  className="hover-lift text-surface/40 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-xs text-surface/50 mt-4">
          Un collaborateur invité peut créer et modifier vos tunnels, mais ne peut pas accéder à la facturation ni supprimer le compte.
        </p>
      </div>

      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
        <h2 className="text-sm font-sans font-semibold text-surface mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Inviter un collaborateur
        </h2>

        {seatsFull ? (
          <p className="text-sm text-surface/60">Vous avez atteint la limite de places de votre plan.</p>
        ) : (
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
              className="flex-1 bg-primary/5 border border-surface/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors text-surface"
            />
            <button
              type="submit"
              disabled={inviting}
              className="magnetic-btn bg-accent text-background px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 shrink-0"
            >
              {inviting ? 'Envoi...' : 'Inviter'}
            </button>
          </form>
        )}

        {inviteError && <p className="text-sm text-red-500 mt-3">{inviteError}</p>}
        {inviteSuccess && <p className="text-sm text-green-600 mt-3">{inviteSuccess}</p>}

        <p className="text-xs text-surface/50 mt-4">
          {occupiedSeats} / {seatLimit} place{seatLimit > 1 ? 's' : ''} d'équipe utilisée{occupiedSeats > 1 ? 's' : ''}.
        </p>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8">
        <h2 className="text-sm font-sans font-semibold text-surface mb-2">Mot de passe</h2>
        <p className="text-sm text-surface/60 mb-4">
          Le changement de mot de passe se fait depuis la page de ton compte.
        </p>
        <Link to="/app/account" className="magnetic-btn inline-block bg-primary text-background px-6 py-3 rounded-xl text-sm font-semibold">
          Aller à Mon compte
        </Link>
      </div>

      <div className="bg-background border border-surface/10 rounded-[2rem] p-6 md:p-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-sans font-semibold text-surface mb-1">Authentification à deux facteurs</h2>
          <p className="text-sm text-surface/60">Ajoute une couche de sécurité supplémentaire à ta connexion.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-surface/10 text-surface/50 shrink-0 whitespace-nowrap">
          Bientôt disponible
        </span>
      </div>

      <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-2xl p-4 text-sm text-surface/70">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p>Seul le compte administrateur désigné de Vendeko peut modifier les plans manuellement.</p>
      </div>
    </div>
  );
}

export default function OrganisationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = TABS.some((t) => t.key === searchParams.get('tab')) ? searchParams.get('tab') : 'equipe';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams(key === 'equipe' ? {} : { tab: key });
  };

  return (
    <div>
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Organisation</h1>
      <p className="text-surface/60 mb-6">Gère ton équipe, ta sécurité et ta facturation.</p>

      <div className="inline-flex bg-surface/5 rounded-xl p-1 mb-8">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === key ? 'bg-background text-surface shadow-sm' : 'text-surface/50 hover:text-surface/80'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'equipe' && <TeamTab />}
      {activeTab === 'paiements' && <PaymentMethodsTab />}
      {activeTab === 'securite' && <SecurityTab />}
      {activeTab === 'facturation' && <BillingPage />}
    </div>
  );
}
