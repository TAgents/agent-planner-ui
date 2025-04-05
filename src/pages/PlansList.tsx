import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Clock, CheckCircle, AlertTriangle, Archive } from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import { Plan, PlanStatus } from '../types';
import { formatDate } from '../utils/planUtils';

const PlansList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PlanStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { plans, isLoading, error, total, totalPages } = usePlans(currentPage, 10, statusFilter);

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

  // Search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically call an API with the search query
    console.log('Searching for:', searchQuery);
  };

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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {plans.map((plan: any) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
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
