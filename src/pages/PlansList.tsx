import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Clock, CheckCircle, AlertTriangle, Archive } from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import { Plan, PlanStatus } from '../types';
import { formatDate } from '../utils/planUtils';
import { createClient } from '@supabase/supabase-js';
import API_CONFIG from '../config/api.config';

// Define an interface for filtered plans
interface FilterResult {
  plan: Plan;
  matches: boolean;
}

const PlansList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PlanStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const navigate = useNavigate();
  
  const { plans, isLoading, error, total, totalPages } = usePlans(currentPage, 10, statusFilter);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a session in localStorage
        const sessionStr = localStorage.getItem('supabase_session');
        if (!sessionStr) {
          console.error('No Supabase session found in localStorage');
          navigate('/login');
          return;
        }

        // Parse the session
        let session;
        try {
          session = JSON.parse(sessionStr);
        } catch (e) {
          console.error('Failed to parse Supabase session:', e);
          navigate('/login');
          return;
        }

        // Create a Supabase client
        const supabase = createClient(
          API_CONFIG.SUPABASE_URL,
          API_CONFIG.SUPABASE_ANON_KEY
        );

        // Check if the session is valid
        const { data, error } = await supabase.auth.getUser(session.access_token);
        if (error || !data.user) {
          console.error('Invalid Supabase session:', error);
          navigate('/login');
          return;
        }

        console.log('Authenticated user:', data.user);

      } catch (err) {
        console.error('Authentication check error:', err);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Status badges
  const getStatusBadge = (status: PlanStatus) => {
    switch(status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Draft</span>;
      case 'archived':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Archived</span>;
      default:
        return null;
    }
  };

  // Status icons
  const getStatusIcon = (status: PlanStatus) => {
    switch(status) {
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'archived':
        return <Archive className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Filter by status
  const handleStatusFilter = (status?: PlanStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The actual filtering is handled by the useEffect below
  };
  
  // Clear search functionality
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredPlans([]);
  };

  // Update filtered plans when search query or plans change
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = plans.filter((plan: Plan) => 
        plan.title.toLowerCase().includes(query) || 
        (plan.description && plan.description.toLowerCase().includes(query))
      );
      
      setFilteredPlans(filtered);
    } else {
      setFilteredPlans([]);
    }
  }, [searchQuery, plans]);

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error loading plans</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{String(error)}</p>
        </div>
      </div>
    );
  }

  // Determine which plans to display: filtered or all
  const displayedPlans = searchQuery.trim() ? filteredPlans : plans;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Plans</h1>
          <Link
            to="/plans/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  clearSearch();
                }
              }}
              aria-label="Search plans"
            />
            {searchQuery && (
              <button 
                type="button"
                className="absolute inset-y-0 right-10 px-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <span className="sr-only">Clear</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button 
              type="submit"
              className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search"
              disabled={!searchQuery.trim()}
            >
              <span className="sr-only">Search</span>
              <Search className="h-4 w-4" />
            </button>
          </form>
          
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                statusFilter === undefined 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleStatusFilter(undefined)}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                statusFilter === 'active' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleStatusFilter('active')}
            >
              Active
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                statusFilter === 'completed' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleStatusFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Search status bar - only show when filtering */}
        {searchQuery.trim() && (
          <div className="mb-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-3 rounded-md">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <span className="text-blue-700 dark:text-blue-300 text-sm">
                  Filtering plans for <strong>"{searchQuery}"</strong>
                  {filteredPlans.length > 0 && (
                    <span className="ml-2 text-xs bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded-full">
                      {filteredPlans.length} {filteredPlans.length === 1 ? 'result' : 'results'}
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={clearSearch}
                className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 text-sm font-medium"
              >
                Clear filter
              </button>
            </div>
            
            {/* Show "no results" message when filtering returns empty results */}
            {filteredPlans.length === 0 && !isLoading && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow text-center">
                <p className="text-gray-600 dark:text-gray-400">No plans found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
        
        {/* Plans List */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="spinner w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">No plans found</p>
              <Link
                to="/plans/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first plan
              </Link>
            </div>
          ) : searchQuery.trim() && filteredPlans.length === 0 ? (
            // Don't show anything here since we already show a message above
            <div></div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedPlans.map((plan: any) => (
                <li key={plan.id}>
                  <Link to={`/plans/${plan.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(plan.status)}
                          <p className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{plan.title}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          {getStatusBadge(plan.status)}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div 
                                className={`h-2.5 rounded-full ${plan.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${plan.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="ml-2">{plan.progress || 0}%</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                          <p>Updated {formatDate(plan.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination - only show when not filtering and there are multiple pages */}
        {totalPages > 1 && !searchQuery.trim() && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md mr-2 bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md ml-2 bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansList;