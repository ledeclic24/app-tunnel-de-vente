import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, User, LogOut, Menu, X, Shield, Mail, BarChart3, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlan, PLAN_ORDER } from '../../lib/plans';

const NAV_ITEMS = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/app/leads', label: 'Leads', icon: Mail },
  { to: '/app/analytics', label: 'Analytique', icon: BarChart3, requires: 'analytics' },
  { to: '/app/billing', label: 'Facturation', icon: CreditCard },
  { to: '/app/account', label: 'Compte', icon: User },
];

function NavLinks({ onNavigate, isAdmin, plan }) {
  const navigate = useNavigate();
  const items = isAdmin ? [...NAV_ITEMS, { to: '/app/admin', label: 'Administration', icon: Shield }] : NAV_ITEMS;

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon, end, requires }) => {
        const locked = requires && !plan[requires];
        if (locked) {
          return (
            <button
              key={to}
              onClick={() => { navigate('/app/billing'); onNavigate?.(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-surface/35 hover:bg-surface/5 transition-colors text-left"
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
              ${isActive ? 'bg-accent/10 text-accent' : 'text-surface/70 hover:bg-surface/5 hover:text-surface'}
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        );
      })}
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
      className="block bg-primary text-background rounded-xl p-4 mb-3 hover:opacity-90 transition-opacity"
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

export default function AppShell() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const plan = getPlan(profile?.plan);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-background border-r border-surface/10 p-6">
        <div className="font-sans font-bold text-xl text-surface mb-8">Vendeko</div>
        <NavLinks isAdmin={profile?.is_admin} plan={plan} />
        <div className="mt-auto pt-6 border-t border-surface/10">
          <UpgradeNudge plan={plan} />
          <div className="px-4 py-3 rounded-xl bg-surface/5 mb-2">
            <p className="text-xs text-surface/50 uppercase tracking-wider font-mono mb-1">Plan actuel</p>
            <p className="text-sm font-semibold text-surface">{plan.name}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="hover-lift w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-surface/70 hover:bg-surface/5 hover:text-surface transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-background border-b border-surface/10">
        <div className="font-sans font-bold text-lg text-surface">Vendeko</div>
        <button onClick={() => setDrawerOpen(true)} className="p-2 text-surface" aria-label="Ouvrir le menu">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
          <div className="relative w-72 bg-background h-full p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="font-sans font-bold text-xl text-surface">Vendeko</div>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-surface" aria-label="Fermer le menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setDrawerOpen(false)} isAdmin={profile?.is_admin} plan={plan} />
            <div className="mt-auto pt-6 border-t border-surface/10">
              <UpgradeNudge plan={plan} />
              <div className="px-4 py-3 rounded-xl bg-surface/5 mb-2">
                <p className="text-xs text-surface/50 uppercase tracking-wider font-mono mb-1">Plan actuel</p>
                <p className="text-sm font-semibold text-surface">{plan.name}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-surface/70 hover:bg-surface/5 hover:text-surface transition-colors"
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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
