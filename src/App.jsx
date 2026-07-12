import React, { Suspense, lazy } from 'react';
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
import PublishedFunnelPage from './pages/public/PublishedFunnelPage';

const DashboardPage = lazy(() => import('./pages/app/DashboardPage'));
const NewFunnelPage = lazy(() => import('./pages/app/NewFunnelPage'));
const AIGeneratorPage = lazy(() => import('./pages/app/AIGeneratorPage'));
const FunnelEditorPage = lazy(() => import('./pages/app/FunnelEditorPage'));
const BillingPage = lazy(() => import('./pages/app/BillingPage'));
const AccountPage = lazy(() => import('./pages/app/AccountPage'));
const LeadsPage = lazy(() => import('./pages/app/LeadsPage'));
const AnalyticsPage = lazy(() => import('./pages/app/AnalyticsPage'));
const IntegrationsPage = lazy(() => import('./pages/app/IntegrationsPage'));
const AdsPage = lazy(() => import('./pages/app/AdsPage'));
const ImageStudioPage = lazy(() => import('./pages/app/ImageStudioPage'));
const OrganisationPage = lazy(() => import('./pages/app/OrganisationPage'));
const AdminOverviewPage = lazy(() => import('./pages/app/admin/AdminOverviewPage'));
const AdminUsersPage = lazy(() => import('./pages/app/admin/AdminUsersPage'));
const AdminFunnelsPage = lazy(() => import('./pages/app/admin/AdminFunnelsPage'));
const AdminPlansPage = lazy(() => import('./pages/app/admin/AdminPlansPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/app/admin/AdminAnalyticsPage'));
const AdminAuditLogPage = lazy(() => import('./pages/app/admin/AdminAuditLogPage'));

gsap.registerPlugin(ScrollTrigger);

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Page introuvable</h1>
      <Link to="/" className="text-accent font-semibold hover:underline">Retour à l'accueil</Link>
    </div>
  );
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
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
                <Route path="funnels/ai" element={<AIGeneratorPage />} />
                <Route path="funnels/:funnelId/edit" element={<FunnelEditorPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="ads" element={<AdsPage />} />
                <Route path="images" element={<ImageStudioPage />} />
                <Route path="organisation" element={<OrganisationPage />} />
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
                  <Route path="audit" element={<AdminAuditLogPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
