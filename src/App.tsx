import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AICreatePlan from './pages/plans/AICreatePlan';
import Settings from './pages/Settings';
import OrganizationSettings from './pages/settings/OrganizationSettings';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import GoalSettings from './pages/settings/GoalSettings';
import KnowledgeSettings from './pages/settings/KnowledgeSettings';
import UserProfile from './pages/profile/UserProfile';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Dashboard from './pages/Dashboard';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';

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
                  <Route path="plans/new" element={<CreatePlan />} />
                  <Route path="plans/ai-create" element={<AICreatePlan />} />
                  <Route path="plans/:planId" element={<PlanVisualization />} />
                  {/* <Route path="shared" element={<SharedPlans />} /> */}
                  <Route path="goals" element={<Goals />} />
                  <Route path="goals/:goalId" element={<GoalDetail />} />
                  <Route path="knowledge" element={<KnowledgeSettings />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/organization" element={<OrganizationSettings />} />
                  <Route path="settings/goals" element={<GoalSettings />} />
                  <Route path="settings/knowledge" element={<KnowledgeSettings />} />
                  <Route path="profile" element={<UserProfile />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </UIProvider>
        </PresenceProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
};

export default App;
