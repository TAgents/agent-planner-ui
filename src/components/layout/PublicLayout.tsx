import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AppSidebar from './AppSidebar';

const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show full sidebar with plans for logged-in users
  // Show simplified sidebar (no plans, with sign in) for logged-out users
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <AppSidebar 
        variant={isAuthenticated ? 'full' : 'public'} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Agent Planner"
              className="w-7 h-7 rounded-lg"
            />
            <span className="font-semibold text-gray-900 dark:text-white">
              Agent Planner
            </span>
          </Link>
          
          {/* Placeholder for right side (keeps logo centered) */}
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;
