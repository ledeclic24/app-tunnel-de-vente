import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isApiConfigured } from '../../lib/apiClient';
import SetupRequired from './SetupRequired';
import Spinner from './Spinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (!isApiConfigured) return <SetupRequired />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/connexion" replace />;

  return <Outlet />;
}
