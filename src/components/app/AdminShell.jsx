import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Layers, CreditCard, LineChart, LogOut, ArrowLeftCircle, ScrollText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { to: '/app/admin', label: "Vue d'ensemble", icon: LayoutGrid, end: true },
  { to: '/app/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/app/admin/funnels', label: 'Tunnels', icon: Layers },
  { to: '/app/admin/plans', label: 'Tarifs', icon: CreditCard },
  { to: '/app/admin/analytics', label: 'Analytique', icon: LineChart },
  { to: '/app/admin/audit', label: "Journal d'audit", icon: ScrollText },
];

export default function AdminShell() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <span className="text-emerald-400 font-mono font-bold text-sm">V</span>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 leading-none">Admin</p>
              <p className="font-sans font-semibold text-sm text-zinc-100 truncate">Vendeko Control Room</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/app')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeftCircle className="w-4 h-4" /> Retour à l'app
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors"
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
                flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${isActive ? 'border-emerald-400 text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-200'}
              `}
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
