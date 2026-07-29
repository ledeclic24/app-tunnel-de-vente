import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

export default function AdminRoute() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" tone="admin" />
      </div>
    );
  }

  if (!profile?.is_admin) return <Navigate to="/app" replace />;

  return <Outlet />;
}
