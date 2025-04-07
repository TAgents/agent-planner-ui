import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { UIProvider } from './contexts/UIContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import PlansList from './pages/PlansList';
import PlanVisualization from './pages/PlanVisualization';
import Login from './pages/auth/Login';
import CreatePlan from './pages/plans/CreatePlan';
import Settings from './pages/Settings';

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
            
            {/* Protected Main Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/plans" replace />} />
                <Route path="plans" element={<PlansList />} />
                <Route path="plans/new" element={<CreatePlan />} />
                <Route path="plans/:planId" element={<PlanVisualization />} />
                <Route path="settings" element={<Settings />} />
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
