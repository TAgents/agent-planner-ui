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
import ExplorePlansPage from './pages/ExplorePlansPage';
import PlansList from './pages/PlansList'; // v1 redesign
import PlanVisualization from './pages/PlanVisualizationEnhanced'; // Using enhanced version with tree view
import PlanTree from './pages/PlanTree'; // v1 redesign tree view
import PublicPlanView from './pages/PublicPlanView'; // Public plan viewing
import PublicPlanV1 from './pages/PublicPlanV1';
// import SharedPlans from './pages/SharedPlans'; // Hidden - functionality not fully implemented
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Callback from './pages/auth/Callback';
import CreatePlan from './pages/plans/CreatePlan';
import Settings from './pages/Settings';
import IntegrationsSettings from './pages/settings/IntegrationsSettings';
import Connections from './pages/settings/Connections';
import GoalsList from './pages/GoalsV2';
import GoalDetail from './pages/GoalDetailV1'; // v1 redesign — was ./pages/GoalDetail
import ErrorBoundary from './components/common/ErrorBoundary';
import ProfileSettings from './pages/settings/ProfileSettings';
import OrganizationSettings from './pages/settings/OrganizationSettings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import NotFound from './pages/NotFound';
import Dashboard from './pages/MissionControl'; // v1 redesign — was ./pages/Dashboard
import ProtectedRoute from './components/auth/ProtectedRoute';
import SelectOrganization from './pages/auth/SelectOrganization';
import Onboarding from './pages/onboarding/Onboarding';
import ConnectPage from './pages/connect/ConnectPage';
import StrategicOverview from './pages/StrategicOverview';
import ExploreClone from './pages/ExploreClone';

// Lazy-load heavy pages (ReactFlow)
const Knowledge = React.lazy(() => import('./pages/Knowledge'));
const KnowledgeTimelineV1 = React.lazy(() => import('./pages/KnowledgeTimelineV1'));
const KnowledgeCoverageV1 = React.lazy(() => import('./pages/KnowledgeCoverageV1'));
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
              {/* Public Pages with sidebar for logged-in users, top nav for logged-out */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/explore" element={<ExplorePlansPage />} />
                <Route path="/public/plans/:planId" element={<PublicPlanV1 />} />
                <Route path="/public/plans/:planId/legacy" element={<PublicPlanView />} />
              </Route>

              {/* Legal Pages */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiesPolicy />} />

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
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="strategy" element={<StrategicOverview />} />
                  <Route path="plans" element={<PlansList />} />
                  <Route path="plans/create" element={<CreatePlan />} />
                  <Route path="plans/:planId" element={<PlanTree />} />
                  <Route path="plans/:planId/graph" element={<PlanVisualization />} />
                  {/* <Route path="shared" element={<SharedPlans />} /> */}
                  <Route path="goals" element={<ErrorBoundary><GoalsList /></ErrorBoundary>} />
                  <Route path="goals/:goalId" element={<ErrorBoundary><GoalDetail /></ErrorBoundary>} />
                  {/* Legacy v2 routes redirect to unified goals */}
                  <Route path="goals-v2" element={<Navigate to="/app/goals" replace />} />
                  <Route path="goals-v2/:goalId" element={<Navigate to="/app/goals" replace />} />
                  <Route path="knowledge" element={<Navigate to="/app/knowledge/timeline" replace />} />
                  <Route path="knowledge/timeline" element={<ErrorBoundary><KnowledgeTimelineV1 /></ErrorBoundary>} />
                  <Route path="knowledge/coverage" element={<ErrorBoundary><KnowledgeCoverageV1 /></ErrorBoundary>} />
                  <Route path="knowledge/legacy" element={<ErrorBoundary><Knowledge /></ErrorBoundary>} />
                  <Route path="portfolio" element={<ErrorBoundary><PortfolioGraph /></ErrorBoundary>} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/integrations" element={<IntegrationsSettings />} />
                  <Route path="settings/connections" element={<Connections />} />
                  <Route path="settings/organizations" element={<OrganizationSettings />} />
                  <Route path="settings/profile" element={<ProfileSettings />} />
                  <Route path="profile" element={<ProfileSettings />} /> {/* Legacy route */}
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
