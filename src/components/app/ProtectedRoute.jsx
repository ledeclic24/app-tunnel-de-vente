import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import SetupRequired from './SetupRequired';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) return <SetupRequired />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/connexion" replace />;

  return <Outlet />;
}
