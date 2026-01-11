import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AppSidebar from './AppSidebar';

const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Show full sidebar with plans for logged-in users
  // Show simplified sidebar (no plans, with sign in) for logged-out users
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <AppSidebar variant={isAuthenticated ? 'full' : 'public'} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;
