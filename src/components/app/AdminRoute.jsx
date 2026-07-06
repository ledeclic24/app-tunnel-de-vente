import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile?.is_admin) return <Navigate to="/app" replace />;

  return <Outlet />;
}
