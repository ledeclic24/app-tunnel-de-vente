import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Layers, CreditCard, LineChart, LogOut, ArrowLeftCircle, ScrollText, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { to: '/app/admin', label: "Vue d'ensemble", icon: LayoutGrid, end: true },
  { to: '/app/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/app/admin/funnels', label: 'Tunnels', icon: Layers },
  { to: '/app/admin/plans', label: 'Tarifs', icon: CreditCard },
  { to: '/app/admin/analytics', label: 'Analytique', icon: LineChart },
  { to: '/app/admin/audit', label: "Journal d'audit", icon: ScrollText },
  { to: '/app/admin/templates', label: 'Modèles', icon: Store },
];

// Reprend la palette réelle de la marque (primary/accent/background, voir
// index.css) plutôt que le zinc/emerald générique utilisé jusqu'ici — même
// traitement "dark premium" que les blocs Hero du tunnel (voir .bg-block-card),
// pour que le panneau admin se sente comme une PARTIE de TonTunnel plutôt
// qu'un outil interne à part avec sa propre identité visuelle.
export default function AdminShell() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-primary text-background font-sans">
      <header className="border-b border-background/10 bg-primary/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/favicon.png" alt="TonTunnel" className="w-8 h-8 shrink-0" />
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent leading-none">Admin</p>
              <p className="font-sans font-semibold text-sm text-background truncate">TonTunnel Control Room</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/app')}
              className="hover-lift hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-background/60 hover:text-background hover:bg-background/10 transition-colors"
            >
              <ArrowLeftCircle className="w-4 h-4" /> Retour à l'app
            </button>
            <button
              onClick={handleSignOut}
              className="hover-lift flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-background/60 hover:text-red-400 hover:bg-background/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-1 overflow-x-auto pb-1">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `
                flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 rounded-t-lg transition-colors
                ${isActive ? 'border-accent text-background bg-background/5' : 'border-transparent text-background/40 hover:text-background/80 hover:bg-background/5'}
              `}
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="gradient-divider" />
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
