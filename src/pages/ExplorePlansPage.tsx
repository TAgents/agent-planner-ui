import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicPlans } from '../hooks/usePublicPlans';
import { PublicPlanCard } from '../components/explore/PublicPlanCard';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recent' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'completion', label: 'Progress' },
  { value: 'stars', label: 'Stars' },
];

export const ExplorePlansPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') as 'draft' | 'active' | 'completed' | 'archived' | undefined;
  const hasGithubLink = searchParams.get('hasGithubLink') === 'true' ? true : searchParams.get('hasGithubLink') === 'false' ? false : undefined;
  const sortBy = (searchParams.get('sortBy') as 'recent' | 'alphabetical' | 'completion' | 'stars') || 'recent';

  const { data, isLoading, error } = usePublicPlans({
    page,
    limit: 12,
    search: search || undefined,
    status,
    hasGithubLink,
    sortBy
  });

  // Unified param builder
  const updateParams = (updates: Record<string, string | undefined>) => {
    const params: any = { page: '1' };
    const current = {
      search: search || undefined,
      status: status || undefined,
      hasGithubLink: hasGithubLink !== undefined ? hasGithubLink.toString() : undefined,
      sortBy: sortBy !== 'recent' ? sortBy : undefined,
    };
    const merged = { ...current, ...updates };
    Object.entries(merged).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params: any = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (hasGithubLink !== undefined) params.hasGithubLink = hasGithubLink.toString();
    if (sortBy && sortBy !== 'recent') params.sortBy = sortBy;
    params.page = newPage.toString();
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters = !!(search || status || hasGithubLink !== undefined || sortBy !== 'recent');

  return (
    <>
      <Helmet>
        <title>Explore Public Plans - Agent Planner IO</title>
        <meta name="description" content="Discover how teams are planning and building in public. Browse community plans, find inspiration, and learn from other teams using Agent Planner." />
        <meta name="keywords" content="public plans, community, collaborative planning, open source plans, project planning" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentplanner.io/explore" />
        <meta property="og:title" content="Explore Public Plans - Agent Planner IO" />
        <meta property="og:description" content="Discover how teams are planning and building in public" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://agentplanner.io/explore" />
        <meta property="twitter:title" content="Explore Public Plans - Agent Planner IO" />
        <meta property="twitter:description" content="Discover how teams are planning and building in public" />
        <link rel="canonical" href="https://agentplanner.io/explore" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header — compact, matches plans list */}
        <div className="border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* Title + search row */}
            <div className="flex items-center gap-4 py-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <h1 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Explore</h1>
                {data && (
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">{data.total}</span>
                )}
              </div>

              {/* Search */}
              <div className="flex-1 relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search public plans..."
                  value={search}
                  onChange={(e) => updateParams({ search: e.target.value || undefined })}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                />
              </div>

              {/* Sort + filter */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                <select
                  value={status || ''}
                  onChange={(e) => updateParams({ status: e.target.value || undefined })}
                  className="appearance-none text-[11px] text-gray-500 dark:text-gray-400 bg-transparent border-0 pr-4 py-1 cursor-pointer focus:ring-0 focus:outline-none"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => updateParams({ sortBy: e.target.value === 'recent' ? undefined : e.target.value })}
                  className="appearance-none text-[11px] text-gray-500 dark:text-gray-400 bg-transparent border-0 pr-4 py-1 cursor-pointer focus:ring-0 focus:outline-none"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {hasFilters && (
                  <button
                    onClick={() => setSearchParams({ page: '1' })}
                    className="text-[11px] text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-900/80 h-56 rounded-lg border border-gray-200/80 dark:border-gray-800/80">
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Failed to load plans</p>
              <button onClick={() => window.location.reload()} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                Try again
              </button>
            </div>
          ) : !data || data.plans.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No public plans yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Share a plan to see it here</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.plans.map((plan) => (
                  <PublicPlanCard key={plan.id} plan={plan} />
                ))}
              </div>

              {/* Pagination — minimal */}
              {data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums">
                    {page} / {data.total_pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= data.total_pages}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ExplorePlansPage;
