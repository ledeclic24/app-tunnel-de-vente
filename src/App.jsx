import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './components/app/ConfirmDialog';
import { ToastProvider } from './components/app/Toast';
import { resolveDomain } from './lib/domainsApi';
import Spinner from './components/app/Spinner';
import AnalyticsTracker from './components/AnalyticsTracker';

// Lazy elles aussi : ProtectedRoute/AdminRoute/AppShell/AdminShell ne
// servent qu'aux routes /app/*, inutile de les faire peser sur le chunk
// d'entrée pour un visiteur qui ne fait que consulter la landing ou se
// connecter.
const ProtectedRoute = lazy(() => import('./components/app/ProtectedRoute'));
const AdminRoute = lazy(() => import('./components/app/AdminRoute'));
const AppShell = lazy(() => import('./components/app/AppShell'));
const AdminShell = lazy(() => import('./components/app/AdminShell'));

// Chargées à la demande (comme les pages /app/* ci-dessous) plutôt qu'en
// avance : ces 8 routes finissaient toutes dans le même paquet que
// React/react-router/gsap (752 Ko), avec PublishedFunnelPage — la page
// publique vue par CHAQUE visiteur d'un tunnel — qui entraînait avec elle
// tout src/components/blocks/ (~4700 lignes, tous les types de blocs)
// même pour un simple chargement de la page d'accueil ou de connexion.
const LandingPage = lazy(() => import('./pages/marketing/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const PublishedFunnelPage = lazy(() => import('./pages/public/PublishedFunnelPage'));
const LegalPage = lazy(() => import('./pages/marketing/LegalPage'));

const DashboardPage = lazy(() => import('./pages/app/DashboardPage'));
const GuidePage = lazy(() => import('./pages/app/GuidePage'));
const NewFunnelPage = lazy(() => import('./pages/app/NewFunnelPage'));
const AIGeneratorPage = lazy(() => import('./pages/app/AIGeneratorPage'));
const GalleryPage = lazy(() => import('./pages/app/GalleryPage'));
const TemplatesMarketplacePage = lazy(() => import('./pages/app/TemplatesMarketplacePage'));
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
const AdminTemplatesPage = lazy(() => import('./pages/app/admin/AdminTemplatesPage'));
const AdminMetaPixelPage = lazy(() => import('./pages/app/admin/AdminMetaPixelPage'));

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
      <Spinner size="lg" />
    </div>
  );
}

// Domaines TonTunnel connus : tout le reste est traité comme un domaine
// personnalisé connecté par un utilisateur (voir CustomDomainGate).
function isTonTunnelHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
    || hostname.endsWith('.vercel.app')
    || hostname === 'tontunnel.com' || hostname === 'www.tontunnel.com';
}

function DomainNotConfiguredPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-sans font-bold text-surface mb-2">Ce domaine n'est pas encore configuré</h1>
      <p className="text-surface/60">Vérifie la connexion de ce domaine dans les réglages de ton tunnel sur TonTunnel.</p>
    </div>
  );
}

// Un tunnel publié peut être servi depuis le domaine personnalisé d'un
// utilisateur (même projet Vercel, voir DomainsService côté serveur) : ce
// composant détecte ce cas au chargement et affiche directement le tunnel à
// la racine du domaine, sans passer par les routes normales de l'app.
function CustomDomainGate({ children }) {
  const hostname = window.location.hostname;
  const [state, setState] = useState(() => (isTonTunnelHost(hostname) ? 'known-host' : 'resolving'));
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

  if (state === 'known-host') return children;
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
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<SignupPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
            <Route path="/verifier-email" element={<VerifyEmailPage />} />

            <Route path="/mentions-legales" element={<LegalPage doc="mentions-legales" />} />
            <Route path="/cgu" element={<LegalPage doc="cgu" />} />
            <Route path="/cgv" element={<LegalPage doc="cgv" />} />
            <Route path="/confidentialite" element={<LegalPage doc="confidentialite" />} />

            <Route path="/f/:funnelSlug" element={<PublishedFunnelPage />} />
            <Route path="/f/:funnelSlug/:stepSlug" element={<PublishedFunnelPage />} />

            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="guide" element={<GuidePage />} />
                <Route path="funnels/new" element={<NewFunnelPage />} />
                <Route path="funnels/ai" element={<AIGeneratorPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="templates" element={<TemplatesMarketplacePage />} />
                <Route path="funnels/:funnelId/edit" element={<FunnelEditorPage />} />
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
                  <Route path="templates" element={<AdminTemplatesPage />} />
                  <Route path="meta-pixel" element={<AdminMetaPixelPage />} />
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
