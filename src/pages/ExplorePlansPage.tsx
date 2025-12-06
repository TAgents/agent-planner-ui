import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { usePublicPlans } from '../hooks/usePublicPlans';
import { PublicPlanCard } from '../components/explore/PublicPlanCard';
import Navigation from '../components/navigation/Navigation';

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

  const handlePageChange = (newPage: number) => {
    const params: any = { page: newPage.toString() };
    if (search) params.search = search;
    if (status) params.status = status;
    if (hasGithubLink !== undefined) params.hasGithubLink = hasGithubLink.toString();
    if (sortBy && sortBy !== 'recent') params.sortBy = sortBy;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (newSearch: string) => {
    const params: any = { page: '1' };
    if (newSearch) params.search = newSearch;
    if (status) params.status = status;
    if (hasGithubLink !== undefined) params.hasGithubLink = hasGithubLink.toString();
    if (sortBy && sortBy !== 'recent') params.sortBy = sortBy;
    setSearchParams(params);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    const params: any = { page: '1' };
    if (search) params.search = search;

    if (filterType === 'status') {
      if (value) params.status = value;
    } else {
      if (status) params.status = status;
    }

    if (filterType === 'hasGithubLink') {
      if (value !== undefined) params.hasGithubLink = value.toString();
    } else {
      if (hasGithubLink !== undefined) params.hasGithubLink = hasGithubLink.toString();
    }

    if (filterType === 'sortBy') {
      if (value && value !== 'recent') params.sortBy = value;
    } else {
      if (sortBy && sortBy !== 'recent') params.sortBy = sortBy;
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 h-80 rounded-lg border border-gray-200"
            >
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load plans</h3>
          <p className="text-gray-600 mb-4">We couldn't load the public plans. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!data || data.plans.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No public plans found</h3>
          <p className="text-gray-600 mb-4">Be the first to share your plan with the community!</p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Get Started
          </a>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.plans.map((plan) => (
            <PublicPlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {data.total_pages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * data.limit) + 1} to {Math.min(page * data.limit, data.total)} of {data.total} plans
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                aria-label="Previous page"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const totalPages = data.total_pages;
                  const showPages = 5;

                  if (totalPages <= showPages) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);

                    if (page > 3) {
                      pages.push('...');
                    }

                    const start = Math.max(2, page - 1);
                    const end = Math.min(totalPages - 1, page + 1);

                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }

                    if (page < totalPages - 2) {
                      pages.push('...');
                    }

                    pages.push(totalPages);
                  }

                  return pages.map((pageNum, idx) => {
                    if (pageNum === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum as number)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}
              </div>

              <div className="sm:hidden px-3 py-2 text-sm text-gray-700">
                Page {page} of {data.total_pages}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= data.total_pages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                aria-label="Next page"
              >
                Next
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Explore Public Plans - Agent Planner IO</title>
        <meta
          name="description"
          content="Discover how teams are planning and building in public. Browse community plans, find inspiration, and learn from other teams using Agent Planner."
        />
        <meta name="keywords" content="public plans, community, collaborative planning, open source plans, project planning" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentplanner.io/explore" />
        <meta property="og:title" content="Explore Public Plans - Agent Planner IO" />
        <meta property="og:description" content="Discover how teams are planning and building in public" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://agentplanner.io/explore" />
        <meta property="twitter:title" content="Explore Public Plans - Agent Planner IO" />
        <meta property="twitter:description" content="Discover how teams are planning and building in public" />

        <link rel="canonical" href="https://agentplanner.io/explore" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Top Navigation Bar */}
        <Navigation />

        {/* Header Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-blue-50 to-white border-b border-gray-200">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore Public Plans
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Discover how teams are planning and building in public
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search plans..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="completion">By Completion</option>
                  <option value="stars">Most Starred</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGithubLink === true}
                    onChange={(e) => handleFilterChange('hasGithubLink', e.target.checked || undefined)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Has GitHub Link</span>
                </label>

                {(search || status || hasGithubLink !== undefined || sortBy !== 'recent') && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear Filters
                  </button>
                )}

                {data && (
                  <span className="text-sm text-gray-600 ml-auto">
                    {data.total} {data.total === 1 ? 'plan' : 'plans'} found
                  </span>
                )}
              </div>
            </div>

            {renderContent()}
          </div>
        </section>
      </div>
    </>
  );
};

export default ExplorePlansPage;
