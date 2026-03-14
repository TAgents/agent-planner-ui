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
import PlansList from './pages/PlansListSimplified'; // Using simplified version
import PlanVisualization from './pages/PlanVisualizationEnhanced'; // Using enhanced version with tree view
import PublicPlanView from './pages/PublicPlanView'; // Public plan viewing
// import SharedPlans from './pages/SharedPlans'; // Hidden - functionality not fully implemented
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Callback from './pages/auth/Callback';
import CreatePlan from './pages/plans/CreatePlan';
import Settings from './pages/Settings';
import IntegrationsSettings from './pages/settings/IntegrationsSettings';
import GoalsList from './pages/GoalsV2';
import GoalDetail from './pages/GoalDetail';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProfileSettings from './pages/settings/ProfileSettings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy-load heavy pages (ReactFlow)
const Knowledge = React.lazy(() => import('./pages/Knowledge'));
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
                <Route path="/public/plans/:planId" element={<PublicPlanView />} />
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
                <Route path="/app" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="plans" element={<PlansList />} />
                  <Route path="plans/create" element={<CreatePlan />} />
                  <Route path="plans/:planId" element={<PlanVisualization />} />
                  {/* <Route path="shared" element={<SharedPlans />} /> */}
                  <Route path="goals" element={<ErrorBoundary><GoalsList /></ErrorBoundary>} />
                  <Route path="goals/:goalId" element={<ErrorBoundary><GoalDetail /></ErrorBoundary>} />
                  {/* Legacy v2 routes redirect to unified goals */}
                  <Route path="goals-v2" element={<Navigate to="/app/goals" replace />} />
                  <Route path="goals-v2/:goalId" element={<Navigate to="/app/goals" replace />} />
                  <Route path="knowledge" element={<ErrorBoundary><Knowledge /></ErrorBoundary>} />
                  <Route path="portfolio" element={<ErrorBoundary><PortfolioGraph /></ErrorBoundary>} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/integrations" element={<IntegrationsSettings />} />
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
