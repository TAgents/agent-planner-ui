import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { UIProvider } from './contexts/UIContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { PresenceProvider } from './contexts/PresenceContext';

// Layout
import MainLayout from './components/layout/MainLayout';
import PublicLayout from './components/layout/PublicLayout';

// Pages
import Landing from './pages/Landing';
import Explore from './pages/ExploreV1';
import PlansList from './pages/PlansList';
import PlanTree from './pages/PlanTree';
import PublicPlan from './pages/PublicPlanV1';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Callback from './pages/auth/Callback';
import CreatePlan from './pages/plans/CreatePlan';
import Settings from './pages/Settings';
import IntegrationsSettings from './pages/settings/IntegrationsSettings';
import Connections from './pages/settings/Connections';
import NotificationsSettings from './pages/settings/NotificationsSettings';
import BillingSettings from './pages/settings/BillingSettings';
import DangerZone from './pages/settings/DangerZone';
import SettingsLayout from './components/settings/SettingsLayout';
import GoalsList from './pages/GoalsV2';
import GoalDetail from './pages/GoalDetailV1';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProfileSettings from './pages/settings/ProfileSettings';
import OrganizationSettings from './pages/settings/OrganizationSettings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import NotFound from './pages/NotFound';
import MissionControl from './pages/MissionControl';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SelectOrganization from './pages/auth/SelectOrganization';
import Onboarding from './pages/onboarding/Onboarding';
import ConnectPage from './pages/connect/ConnectPage';
import ConnectIndex from './pages/connect/ConnectIndex';
import StrategicOverview from './pages/StrategicOverview';
import ExploreClone from './pages/ExploreClone';

// Lazy-load heavy pages (ReactFlow)
const KnowledgeTimeline = React.lazy(() => import('./pages/KnowledgeTimelineV1'));
const KnowledgeCoverage = React.lazy(() => import('./pages/KnowledgeCoverageV1'));
const KnowledgeGraph = React.lazy(() => import('./pages/KnowledgeGraphV1'));
const PortfolioGraph = React.lazy(() => import('./pages/PortfolioGraph'));

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <PresenceProvider>
        <UIProvider>
          <BrowserRouter>
            <React.Suspense fallback={null}>
            <Routes>
              {/* Landing has its own marketing chrome (dark obsidian) — render
                  outside PublicLayout so the in-app cream header doesn't clash. */}
              <Route path="/" element={<Landing />} />

              {/* Public Pages with shared layout (theme-aware top nav) */}
              <Route element={<PublicLayout />}>
                <Route path="/explore" element={<Explore />} />
                <Route path="/public/plans/:planId" element={<PublicPlan />} />
              </Route>

              {/* Legal Pages */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiesPolicy />} />

              {/* Public Connect Picker (deep-linked from marketing) */}
              <Route path="/connect" element={<ConnectIndex />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<Callback />} />

              {/* Protected Main Application Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/select-org" element={<SelectOrganization />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/connect/:client" element={<ConnectPage />} />
                <Route path="/explore/clone/:sourceId" element={<ExploreClone />} />
                <Route path="/app" element={<MainLayout />}>
                  <Route index element={<MissionControl />} />
                  <Route path="dashboard" element={<MissionControl />} />
                  <Route path="strategy" element={<StrategicOverview />} />
                  <Route path="plans" element={<PlansList />} />
                  <Route path="plans/create" element={<CreatePlan />} />
                  <Route path="plans/:planId" element={<PlanTree />} />
                  <Route path="goals" element={<ErrorBoundary><GoalsList /></ErrorBoundary>} />
                  <Route path="goals/:goalId" element={<ErrorBoundary><GoalDetail /></ErrorBoundary>} />
                  <Route path="knowledge" element={<Navigate to="/app/knowledge/timeline" replace />} />
                  <Route path="knowledge/timeline" element={<ErrorBoundary><KnowledgeTimeline /></ErrorBoundary>} />
                  <Route path="knowledge/coverage" element={<ErrorBoundary><KnowledgeCoverage /></ErrorBoundary>} />
                  <Route path="knowledge/graph" element={<ErrorBoundary><KnowledgeGraph /></ErrorBoundary>} />
                  <Route path="portfolio" element={<ErrorBoundary><PortfolioGraph /></ErrorBoundary>} />
                  <Route path="settings" element={<SettingsLayout />}>
                    <Route index element={<Navigate to="profile" replace />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="organization" element={<OrganizationSettings />} />
                    <Route path="organizations" element={<Navigate to="../organization" replace />} />
                    <Route path="agents" element={<IntegrationsSettings />} />
                    <Route path="integrations" element={<Navigate to="../agents" replace />} />
                    <Route path="connections" element={<Connections />} />
                    <Route path="tokens" element={<Settings />} />
                    <Route path="notifications" element={<NotificationsSettings />} />
                    <Route path="billing" element={<BillingSettings />} />
                    <Route path="danger" element={<DangerZone />} />
                  </Route>
                </Route>
              </Route>

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </React.Suspense>
          </BrowserRouter>
        </UIProvider>
        </PresenceProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
};

export default App;
