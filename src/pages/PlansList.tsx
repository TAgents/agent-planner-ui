import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Filter, Clock, CheckCircle, Archive, 
  Edit2, Star, MoreVertical, Users, CheckSquare, Calendar,
  Tag, FileText, Sparkles
} from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import { Plan, PlanStatus } from '../types';
import { formatDate } from '../utils/planUtils';

const PlansList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PlanStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { plans, isLoading, error, total, totalPages } = usePlans(currentPage, 10, statusFilter);

  // Check authentication only once on mount
  useEffect(() => {
    const checkAuth = () => {
      // Check if we have a session token
      const sessionStr = localStorage.getItem('auth_session');
      if (!sessionStr) {
        navigate('/login');
        return;
      }

      try {
        const session = JSON.parse(sessionStr);
        if (!session || !session.access_token) {
          navigate('/login');
        }
      } catch (e) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]); // Add navigate to dependencies

  // Memoize status badge rendering
  const getStatusBadge = useCallback((status: PlanStatus) => {
    const badges = {
      active: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', label: 'Active' },
      completed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', label: 'Completed' },
      draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', label: 'Draft' },
      archived: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Archived' }
    };
    
    const badge = badges[status];
    if (!badge) return null;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  }, []);

  // Memoize status icon rendering
  const getStatusIcon = useCallback((status: PlanStatus) => {
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
  }, []);

  // Get progress color based on status and percentage
  const getProgressColor = useCallback((status: PlanStatus, progress: number) => {
    if (status === 'completed') return 'bg-green-500';
    if (progress === 0) return 'bg-gray-400';
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  }, []);

  // Memoize handlers
  const handleStatusFilter = useCallback((status?: PlanStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setSearchQuery('');
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);
  
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Prevent action propagation on card hover actions
  const handleActionClick = useCallback((e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  }, []);

  // Memoize filtered plans
  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return plans.filter((plan: Plan) => 
      plan.title.toLowerCase().includes(query) || 
      (plan.description && plan.description.toLowerCase().includes(query))
    );
  }, [searchQuery, plans]);

  const isSearching = searchQuery.trim() !== '';
  const displayedPlans = isSearching ? filteredPlans : plans;

  // Mock data for enhanced cards (in real app, this would come from the API)
  // Use a ref to store metadata persistently across renders
  const planMetadataRef = React.useRef<Map<string, any>>(new Map());

  const getPlanMetadata = useCallback((planId: string) => {
    // Check if we already have metadata for this plan
    if (planMetadataRef.current.has(planId)) {
      return planMetadataRef.current.get(planId);
    }

    // Generate metadata only once per plan ID
    const totalTasks = Math.floor(Math.random() * 30) + 10;
    const metadata = {
      assignees: Math.floor(Math.random() * 5) + 1,
      totalTasks,
      completedTasks: Math.min(Math.floor(Math.random() * totalTasks), totalTasks),
      dueInDays: Math.floor(Math.random() * 30) + 1,
    };

    // Store it in the ref for future use
    planMetadataRef.current.set(planId, metadata);
    return metadata;
  }, []);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Plans</h1>
          <div className="flex gap-3">
            <Link
              to="/plans/ai-create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create with AI
            </Link>
            <Link
              to="/plans/new"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Manually
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
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
                className="absolute inset-y-0 right-10 px-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition duration-150"
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
              className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              aria-label="Search"
              disabled={!searchQuery.trim()}
            >
              <span className="sr-only">Search</span>
              <Search className="h-4 w-4" />
            </button>
          </form>
          
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                statusFilter === undefined 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800' 
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleStatusFilter(undefined)}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                statusFilter === 'active' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800' 
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleStatusFilter('active')}
            >
              Active
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                statusFilter === 'completed' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800' 
                  : 'bg-white text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleStatusFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Filter status bar */}
        {(isSearching || statusFilter) && (
          <div className="mb-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-3 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <span className="text-blue-700 dark:text-blue-300 text-sm">
                  {searchQuery ? (
                    <>Filtering plans for <strong>"{searchQuery}"</strong></>
                  ) : statusFilter ? (
                    <>Showing <strong>{statusFilter}</strong> plans</>
                  ) : (
                    <>Filtering plans</>
                  )}
                  <span className="ml-2 text-xs bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded-full">
                    {isSearching ? filteredPlans.length : total} {(isSearching ? filteredPlans.length : total) === 1 ? 'result' : 'results'}
                  </span>
                </span>
              </div>
              <button
                onClick={() => {
                  clearSearch();
                  handleStatusFilter(undefined);
                }}
                className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 text-sm font-medium transition duration-200"
              >
                Clear filters
              </button>
            </div>
            
            {((isSearching && filteredPlans.length === 0) || (!isSearching && plans.length === 0)) && !isLoading && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? (
                    <>No plans found matching "{searchQuery}"</>
                  ) : statusFilter ? (
                    <>No {statusFilter} plans found</>
                  ) : (
                    <>No plans found</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Enhanced Plans List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="spinner w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No plans yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first plan</p>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/plans/ai-create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition duration-200"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create with AI
                </Link>
                <Link
                  to="/plans/new"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Manually
                </Link>
              </div>
            </div>
          ) : isSearching && filteredPlans.length === 0 ? (
            null
          ) : (
            <div className="grid gap-4">
              {displayedPlans.map((plan: Plan) => {
                const metadata = getPlanMetadata(plan.id);
                const progress = typeof plan.progress === 'number' ? plan.progress : 0;
                
                return (
                  <Link 
                    key={plan.id}
                    to={`/plans/${plan.id}`}
                    className="group relative block"
                    onMouseEnter={() => setHoveredPlanId(plan.id)}
                    onMouseLeave={() => setHoveredPlanId(null)}
                  >
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
                      {/* Progress background indicator */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                        style={{width: `${progress}%`}} 
                      />
                      
                      {/* Quick actions on hover */}
                      <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-200 z-10 ${hoveredPlanId === plan.id ? 'opacity-100' : 'opacity-0'}`}>
                        <button 
                          onClick={(e) => handleActionClick(e, () => navigate(`/plans/${plan.id}/edit`))}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600"
                          aria-label="Edit plan"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button 
                          onClick={(e) => handleActionClick(e, () => console.log('Star plan:', plan.id))}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600"
                          aria-label="Star plan"
                        >
                          <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button 
                          onClick={(e) => handleActionClick(e, () => console.log('More options:', plan.id))}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600"
                          aria-label="More options"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                      
                      {/* Plan content */}
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center relative z-0">
                              {getStatusIcon(plan.status)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {plan.title}
                              </h3>
                              {plan.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                  {plan.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            {getStatusBadge(plan.status)}
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${getProgressColor(plan.status, progress)}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              <span>{metadata.assignees} assignees</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CheckSquare className="w-4 h-4" />
                              <span>{metadata.completedTasks}/{metadata.totalTasks} tasks</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>Due in {metadata.dueInDays} days</span>
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Updated {formatDate(plan.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isSearching && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg mr-2 bg-white shadow-sm border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <div className="flex space-x-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1.5 rounded-lg shadow-sm transition duration-200 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg ml-2 bg-white shadow-sm border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
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