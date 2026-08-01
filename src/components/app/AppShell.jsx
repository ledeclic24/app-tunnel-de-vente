import React, { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, LogOut, Menu, X, Shield, Mail, BarChart3, Lock, Sparkles, ArrowRight,
  Search, Bell, Building2, Webhook, Megaphone, Image as ImageIcon, BookOpen, Gem, CreditCard, Compass, MailWarning, Store,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan, PLAN_ORDER } from '../../lib/plans';
import { fetchLeadsForUser, fetchUserFunnels } from '../../lib/funnelsApi';
import CommandPalette from './CommandPalette';
import { useToast } from './Toast';

const NAV_GROUPS = [
  {
    label: 'Créer',
    items: [
      { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
      { to: '/app/images', label: 'Visuels IA', icon: ImageIcon, requires: 'imageGeneration' },
      { to: '/app/ebooks', label: 'Ebooks', icon: BookOpen, requires: 'ebookAccess' },
      { to: '/app/gallery', label: 'Inspiration', icon: Compass, requires: 'gallery' },
      { to: '/app/templates', label: 'Modèles', icon: Store },
    ],
  },
  {
    label: 'Croissance',
    items: [
      { to: '/app/leads', label: 'Leads', icon: Mail },
      { to: '/app/analytics', label: 'Analytique', icon: BarChart3, requires: 'analytics' },
      { to: '/app/integrations', label: 'Intégrations', icon: Webhook, requires: 'webhooks' },
      { to: '/app/ads', label: 'Publicité', icon: Megaphone, requires: 'adsManagement', comingSoon: true },
    ],
  },
  {
    label: 'Organisation',
    items: [
      { to: '/app/organisation', label: 'Organisation', icon: Building2 },
      { to: '/app/billing', label: 'Tarifs', icon: CreditCard },
      { to: '/app/account', label: 'Compte', icon: User },
    ],
  },
  {
    label: 'Aide',
    items: [
      { to: '/app/guide', label: 'Guide d’utilisation', icon: HelpCircle },
    ],
  },
];

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform || '');

function formatRelativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

// Un seul événement mérite d'être fêté, pas chaque lead qui arrive ensuite —
// le drapeau "déjà célébré" persiste en localStorage (même pattern que
// tontunnel_notif_seen_at_*) pour ne se déclencher qu'une fois par
// utilisateur, même après un rechargement.
function celebrateMilestones(leads, ownerId, toast) {
  if (!ownerId || !leads || leads.length === 0) return;
  const leadKey = `tontunnel_celebrated_first_lead_${ownerId}`;
  const saleKey = `tontunnel_celebrated_first_sale_${ownerId}`;
  try {
    if (!window.localStorage.getItem(leadKey)) {
      window.localStorage.setItem(leadKey, '1');
      toast.success('🎉 Ton premier lead est arrivé ! Ton tunnel fonctionne.');
      return;
    }
    const hasPaidLead = leads.some((l) => l.payment_status === 'paid');
    if (hasPaidLead && !window.localStorage.getItem(saleKey)) {
      window.localStorage.setItem(saleKey, '1');
      toast.success('🎉 Première vente ! Félicitations, ton tunnel convertit.');
    }
  } catch {
    // stockage indisponible, tant pis pour la persistance — pas de célébration répétée cette fois
  }
}

function NavLinks({ onNavigate, isAdmin, plan }) {
  const navigate = useNavigate();
  const groups = isAdmin
    ? [...NAV_GROUPS, { label: 'Admin', items: [{ to: '/app/admin', label: 'Administration', icon: Shield }] }]
    : NAV_GROUPS;

  return (
    <nav className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-4 mb-1 text-[10px] uppercase tracking-wider text-background/30 font-mono">{group.label}</p>
          <div className="flex flex-col gap-1">
            {group.items.map(({ to, label, icon: Icon, end, requires, comingSoon }) => {
              if (comingSoon) {
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200
                      ${isActive ? 'bg-background/10 text-background' : 'text-background/60 hover:bg-background/5 hover:text-background'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    <span className="ml-auto text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-background/10 text-background/50">
                      Bientôt
                    </span>
                  </NavLink>
                );
              }
              const locked = requires && !plan[requires];
              if (locked) {
                return (
                  <button
                    key={to}
                    onClick={() => { navigate('/app/billing'); onNavigate?.(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-background/30 hover:bg-background/5 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    <Lock className="w-3 h-3 ml-auto" />
                  </button>
                );
              }
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200
                    ${isActive ? 'bg-accent text-primary font-semibold' : 'text-background/60 hover:bg-background/5 hover:text-background'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UpgradeNudge({ plan }) {
  const nextKey = PLAN_ORDER[PLAN_ORDER.indexOf(plan.key) + 1];
  if (!nextKey) return null;
  const next = getPlan(nextKey);
  return (
    <NavLink
      to="/app/billing"
      className="block bg-accent/10 border border-accent/20 rounded-xl p-4 mb-3 hover:bg-accent/15 transition-colors"
    >
      <div className="flex items-center gap-1.5 text-accent text-xs font-semibold mb-1.5">
        <Sparkles className="w-3.5 h-3.5" /> Passer à {next.name}
      </div>
      <p className="text-xs text-background/60 mb-2">
        {nextKey === 'createur' ? 'Tunnels illimités + IA + Brand Kit' : 'Statistiques de conversion par tunnel'}
      </p>
      <div className="flex items-center gap-1 text-xs font-medium text-background/90">
        Découvrir <ArrowRight className="w-3 h-3" />
      </div>
    </NavLink>
  );
}

function PlanUsageCard({ plan, funnelsCount }) {
  const unlimited = plan.maxFunnels === Infinity;
  const pct = unlimited ? 100 : Math.min(100, Math.round(((funnelsCount ?? 0) / plan.maxFunnels) * 100));
  return (
    <Link to="/app/billing" className="block px-4 py-3.5 rounded-xl bg-background/5 mb-2 hover:bg-background/10 transition-colors">
      <div className="flex items-center gap-2 mb-2.5">
        <Gem className="w-3.5 h-3.5 text-accent" />
        <p className="text-[10px] text-background/40 uppercase tracking-wider font-mono">Plan actuel</p>
      </div>
      <p className="text-sm font-semibold text-background mb-2.5">{plan.name}</p>
      <div className="flex items-center justify-between text-[11px] text-background/45 mb-1">
        <span>Tunnels</span>
        <span>{funnelsCount ?? '…'} / {unlimited ? '∞' : plan.maxFunnels}</span>
      </div>
      <div className="h-1.5 rounded-full bg-background/10 overflow-hidden">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}

function SearchButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-4 py-2.5 mb-6 rounded-xl border border-background/15 text-sm text-background/40 hover:bg-background/5 hover:text-background/60 transition-colors"
    >
      <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Rechercher...</span>
      <kbd className="text-[10px] font-mono bg-background/10 text-background/50 px-1.5 py-0.5 rounded">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
    </button>
  );
}

function NotificationBell({ leads, dark = false, ownerId }) {
  const [open, setOpen] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(0);
  const navigate = useNavigate();
  const storageKey = ownerId ? `tontunnel_notif_seen_at_${ownerId}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      setLastSeenAt(Number(window.localStorage.getItem(storageKey)) || 0);
    } catch {
      setLastSeenAt(0);
    }
  }, [storageKey]);

  const recent = (leads || []).slice(0, 8);
  const hasUnread = recent.some((l) => new Date(l.created_at).getTime() > lastSeenAt);

  const markAllRead = () => {
    const now = Date.now();
    setLastSeenAt(now);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, String(now));
      } catch {
        // stockage indisponible, tant pis pour la persistance
      }
    }
  };

  const goToLead = (lead) => {
    setOpen(false);
    if (lead.funnel_id) navigate(`/app/funnels/${lead.funnel_id}/edit`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className={`relative p-2 rounded-xl transition-colors ${dark ? 'text-background/60 hover:bg-background/10 hover:text-background' : 'text-surface/60 hover:bg-surface/5 hover:text-surface'}`}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {hasUnread && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-background rounded-2xl shadow-2xl max-w-lg mx-auto mt-24 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-surface/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-surface/40" />
                <p className="text-sm font-semibold text-surface">Activité récente</p>
              </div>
              <div className="flex items-center gap-3">
                {hasUnread && (
                  <button onClick={markAllRead} className="text-xs font-semibold text-accent hover:underline">
                    Tout marquer comme lu
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-surface/40 hover:text-surface" aria-label="Fermer les notifications">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto py-2">
              {recent.length === 0 ? (
                <p className="px-5 py-8 text-sm text-surface/40 text-center">Aucune activité récente</p>
              ) : (
                <div className="px-2">
                  {recent.map((lead) => {
                    const unread = new Date(lead.created_at).getTime() > lastSeenAt;
                    return (
                      <button
                        key={lead.id}
                        onClick={() => goToLead(lead)}
                        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-accent/10 transition-colors"
                      >
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${unread ? 'bg-accent' : 'bg-transparent'}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-surface truncate">{lead.name || lead.email}</span>
                          <span className="block text-xs text-surface/50 truncate">{lead.funnelName}</span>
                        </span>
                        <span className="text-[10px] text-surface/40 font-mono shrink-0 mt-0.5">{formatRelativeTime(lead.created_at)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-surface/10 px-5 py-3">
              <Link to="/app/leads" onClick={() => setOpen(false)} className="text-xs font-semibold text-accent hover:underline">
                Voir tous les leads →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShellLogo({ className = '' }) {
  return (
    <Link to="/app" className={`flex items-center gap-2 ${className}`}>
      <img src="/icon-app.png" alt="" className="h-7 w-7 rounded-lg shrink-0" />
      <span className="font-sans font-bold text-background">TonTunnel</span>
    </Link>
  );
}

// Nudge informatif, jamais bloquant : voir la discussion produit derrière
// ce choix — Moneroo (pas TonTunnel) gère l'argent, donc le risque
// technique de ne pas vérifier l'email est faible. Sert surtout à
// s'assurer que le vendeur possède bien l'adresse à laquelle il recevra
// notifications et alertes.
function EmailVerificationBanner() {
  const { resendVerificationEmail } = useAuth();
  const toast = useToast();
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    const { error } = await resendVerificationEmail();
    setSending(false);
    if (error) toast.error("Impossible d'envoyer le lien pour le moment. Réessaie dans un instant.");
    else toast.success('Lien de confirmation envoyé — vérifie ta boîte mail.');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm px-4 py-2.5 rounded-xl mb-4">
      <MailWarning className="w-4 h-4 shrink-0" />
      <span className="flex-1 min-w-[200px]">Confirme ton adresse email pour être sûr de recevoir les notifications importantes de ton compte.</span>
      <button
        onClick={handleResend}
        disabled={sending}
        className="font-semibold hover:underline disabled:opacity-50 shrink-0"
      >
        {sending ? 'Envoi...' : 'Renvoyer le lien'}
      </button>
    </div>
  );
}

export default function AppShell() {
  const { profile, effectiveOwnerId, effectiveProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifLeads, setNotifLeads] = useState([]);
  const [funnelsCount, setFunnelsCount] = useState(null);
  const plan = getPlan(effectiveProfile?.plan);
  const toast = useToast();

  useEffect(() => {
    if (!effectiveOwnerId) return;
    fetchLeadsForUser(effectiveOwnerId).then((leads) => {
      setNotifLeads(leads);
      celebrateMilestones(leads, effectiveOwnerId, toast);
    }).catch(() => setNotifLeads([]));
    fetchUserFunnels(effectiveOwnerId).then((f) => setFunnelsCount(f.length)).catch(() => setFunnelsCount(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveOwnerId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-primary p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <ShellLogo />
          <NotificationBell leads={notifLeads} ownerId={effectiveOwnerId} dark />
        </div>
        <SearchButton onClick={() => setPaletteOpen(true)} />
        <NavLinks isAdmin={profile?.is_admin} plan={plan} />
        <div className="mt-auto pt-6 border-t border-background/10">
          <UpgradeNudge plan={plan} />
          <PlanUsageCard plan={plan} funnelsCount={funnelsCount} />
          <button
            onClick={handleSignOut}
            className="hover-lift w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-background/60 hover:bg-background/5 hover:text-background transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-background border-b border-surface/10">
        <img src="/logo.png" alt="TonTunnel" className="h-6 w-auto" />
        <div className="flex items-center gap-1">
          <button onClick={() => setPaletteOpen(true)} className="p-2 text-surface/60" aria-label="Rechercher">
            <Search className="w-5 h-5" />
          </button>
          <NotificationBell leads={notifLeads} ownerId={effectiveOwnerId} />
          <button onClick={() => setDrawerOpen(true)} className="p-2 text-surface" aria-label="Ouvrir le menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
          <div className="relative w-72 bg-primary h-full p-6 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <ShellLogo />
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-background/70" aria-label="Fermer le menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SearchButton onClick={() => { setPaletteOpen(true); setDrawerOpen(false); }} />
            <NavLinks onNavigate={() => setDrawerOpen(false)} isAdmin={profile?.is_admin} plan={plan} />
            <div className="mt-auto pt-6 border-t border-background/10">
              <UpgradeNudge plan={plan} />
              <PlanUsageCard plan={plan} funnelsCount={funnelsCount} />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-background/60 hover:bg-background/5 hover:text-background transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {effectiveProfile?.email_verified === false && <EmailVerificationBanner />}
          <Outlet />
        </div>
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
