import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './components/app/ConfirmDialog';
import { ToastProvider } from './components/app/Toast';
import ProtectedRoute from './components/app/ProtectedRoute';
import AdminRoute from './components/app/AdminRoute';
import AppShell from './components/app/AppShell';
import AdminShell from './components/app/AdminShell';
import { resolveDomain } from './lib/domainsApi';

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
const EbooksPage = lazy(() => import('./pages/app/EbooksPage'));
const EbookEditorPage = lazy(() => import('./pages/app/EbookEditorPage'));
const EbookReaderPage = lazy(() => import('./pages/app/EbookReaderPage'));
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

// Domaines Vendeko connus : tout le reste est traité comme un domaine
// personnalisé connecté par un utilisateur (voir CustomDomainGate).
function isVendekoHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
    || hostname.endsWith('.vercel.app')
    || hostname.endsWith('.vendeko.app');
}

function DomainNotConfiguredPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Ce domaine n'est pas encore configuré</h1>
      <p className="text-surface/60">Vérifie la connexion de ce domaine dans les réglages de ton tunnel sur Vendeko.</p>
    </div>
  );
}

// Un tunnel publié peut être servi depuis le domaine personnalisé d'un
// utilisateur (même projet Vercel, voir DomainsService côté serveur) : ce
// composant détecte ce cas au chargement et affiche directement le tunnel à
// la racine du domaine, sans passer par les routes normales de l'app.
function CustomDomainGate({ children }) {
  const hostname = window.location.hostname;
  const [state, setState] = useState(() => (isVendekoHost(hostname) ? 'vendeko' : 'resolving'));
  const [resolvedSlug, setResolvedSlug] = useState(null);

  useEffect(() => {
    if (state !== 'resolving') return;
    let cancelled = false;
    resolveDomain(hostname).then((slug) => {
      if (cancelled) return;
      if (slug) { setResolvedSlug(slug); setState('resolved'); } else setState('unconfigured');
    }).catch(() => { if (!cancelled) setState('unconfigured'); });
    return () => { cancelled = true; };
  }, [state, hostname]);

  if (state === 'vendeko') return children;
  if (state === 'resolving') return <RouteFallback />;
  if (state === 'unconfigured') return <DomainNotConfiguredPage />;

  return (
    <Routes>
      <Route path="/" element={<PublishedFunnelPage funnelSlugOverride={resolvedSlug} />} />
      <Route path="/:stepSlug" element={<PublishedFunnelPage funnelSlugOverride={resolvedSlug} />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ToastProvider>
      <ConfirmProvider>
        <Suspense fallback={<RouteFallback />}>
          <CustomDomainGate>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<SignupPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />

            <Route path="/f/:funnelSlug" element={<PublishedFunnelPage />} />
            <Route path="/f/:funnelSlug/:stepSlug" element={<PublishedFunnelPage />} />

            <Route path="/app" element={<ProtectedRoute />}>
              {/* Hors AppShell : l'éditeur a besoin de tout l'écran, comme
                  n'importe quel éditeur de page pro (pas de sidebar de nav
                  pendant qu'on construit un tunnel). */}
              <Route path="funnels/:funnelId/edit" element={<FunnelEditorPage />} />
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="funnels/new" element={<NewFunnelPage />} />
                <Route path="funnels/ai" element={<AIGeneratorPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="ads" element={<AdsPage />} />
                <Route path="images" element={<ImageStudioPage />} />
                <Route path="ebooks" element={<EbooksPage />} />
                <Route path="ebooks/:ebookId" element={<EbookEditorPage />} />
                <Route path="ebooks/:ebookId/lire" element={<EbookReaderPage />} />
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
          </CustomDomainGate>
        </Suspense>
      </ConfirmProvider>
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
