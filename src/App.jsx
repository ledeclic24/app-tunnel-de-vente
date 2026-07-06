import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/app/ProtectedRoute';
import AdminRoute from './components/app/AdminRoute';
import AppShell from './components/app/AppShell';
import AdminShell from './components/app/AdminShell';

import LandingPage from './pages/marketing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/app/DashboardPage';
import NewFunnelPage from './pages/app/NewFunnelPage';
import FunnelEditorPage from './pages/app/FunnelEditorPage';
import BillingPage from './pages/app/BillingPage';
import AccountPage from './pages/app/AccountPage';
import AdminOverviewPage from './pages/app/admin/AdminOverviewPage';
import AdminUsersPage from './pages/app/admin/AdminUsersPage';
import AdminFunnelsPage from './pages/app/admin/AdminFunnelsPage';
import AdminPlansPage from './pages/app/admin/AdminPlansPage';
import AdminAnalyticsPage from './pages/app/admin/AdminAnalyticsPage';
import PublishedFunnelPage from './pages/public/PublishedFunnelPage';

gsap.registerPlugin(ScrollTrigger);

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Page introuvable</h1>
      <Link to="/" className="text-accent font-semibold hover:underline">Retour à l'accueil</Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<SignupPage />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />

          <Route path="/f/:funnelSlug" element={<PublishedFunnelPage />} />
          <Route path="/f/:funnelSlug/:stepSlug" element={<PublishedFunnelPage />} />

          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="funnels/new" element={<NewFunnelPage />} />
              <Route path="funnels/:funnelId/edit" element={<FunnelEditorPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>
            <Route path="admin" element={<AdminRoute />}>
              <Route element={<AdminShell />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="funnels" element={<AdminFunnelsPage />} />
                <Route path="plans" element={<AdminPlansPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
