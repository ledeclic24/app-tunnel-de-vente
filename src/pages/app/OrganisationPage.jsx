import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, ShieldCheck, CreditCard, Trash2, Lock, Info, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { fetchOrgMembers, inviteOrgMember, removeOrgMember } from '../../lib/growthApi';
import { useConfirm } from '../../components/app/ConfirmDialog';
import BillingPage from './BillingPage';
import PageHeader from '../../components/ui/PageHeader';
import Tabs from '../../components/ui/Tabs';

const TABS = [
  { key: 'equipe', label: 'Équipe', icon: Users },
  { key: 'securite', label: 'Sécurité', icon: ShieldCheck },
  { key: 'facturation', label: 'Facturation', icon: CreditCard },
];

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
      <div className="bg-background border border-surface/10 rounded-[2rem] shadow-soft p-6 md:p-8">
        <p className="text-sm text-surface/70">Seul le propriétaire du compte peut gérer l'équipe.</p>
      </div>
    );
  }

  if (plan.teamSeats <= 1) {
    return (
      <div className="bg-background border border-surface/10 rounded-[2rem] shadow-soft p-6 md:p-8 flex items-start gap-3">
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
      await inviteOrgMember({ ownerId: effectiveOwnerId, email: inviteEmail });
      setInviteEmail('');
      setInviteSuccess('Invitation envoyée par e-mail.');
      await loadMembers();
    } catch (err) {
      if (err?.code === '23505' || /duplicate|unique/i.test(err?.message || '')) {
        setInviteError('Cette adresse a déjà été invitée.');
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
      <div className="bg-background border border-surface/10 rounded-[2rem] shadow-soft p-6 md:p-8">
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

      <div className="bg-background border border-surface/10 rounded-[2rem] shadow-soft p-6 md:p-8">
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
      <div className="bg-background border border-surface/10 rounded-[2rem] shadow-soft p-6 md:p-8">
        <h2 className="text-sm font-sans font-semibold text-surface mb-2">Mot de passe</h2>
        <p className="text-sm text-surface/60 mb-4">
          Le changement de mot de passe se fait depuis la page de ton compte.
        </p>
        <Link to="/app/account" className="magnetic-btn inline-block bg-primary text-background px-6 py-3 rounded-xl text-sm font-semibold">
          Aller à Mon compte
        </Link>
      </div>

      <div className="bg-background border border-surface/10 rounded-[2rem] shadow-soft p-6 md:p-8 flex items-start justify-between gap-4">
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
      <PageHeader title="Organisation" description="Gère ton équipe, ta sécurité et ta facturation." className="mb-6" />

      <Tabs tabs={TABS} active={activeTab} onChange={handleTabChange} />

      {activeTab === 'equipe' && <TeamTab />}
      {activeTab === 'securite' && <SecurityTab />}
      {activeTab === 'facturation' && <BillingPage />}
    </div>
  );
}
