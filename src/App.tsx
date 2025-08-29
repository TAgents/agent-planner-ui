import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { UIProvider } from './contexts/UIContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import PlansList from './pages/PlansListSimplified'; // Using simplified version
import PlanVisualization from './pages/PlanVisualizationEnhanced'; // Using enhanced version with tree view
// import SharedPlans from './pages/SharedPlans'; // Hidden - functionality not fully implemented
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CreatePlan from './pages/plans/CreatePlan';
import AICreatePlan from './pages/plans/AICreatePlan';
import Settings from './pages/Settings';
import UserProfile from './pages/profile/UserProfile';

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
      <UIProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Main Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/plans" replace />} />
                <Route path="plans" element={<PlansList />} />
                <Route path="plans/new" element={<CreatePlan />} />
                <Route path="plans/ai-create" element={<AICreatePlan />} />
                <Route path="plans/:planId" element={<PlanVisualization />} />
                {/* <Route path="shared" element={<SharedPlans />} /> */}
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </UIProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
};

export default App;
