import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter as FilterIcon, LayoutGrid, List } from 'lucide-react';
import { PlanListContainer } from '../components/plans/PlanListContainer';

/**
 * New Plans List Page using the redesigned components
 * Matches the landing page design system
 */
const PlansListNew: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'private' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Plans</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organize projects, track progress, and collaborate with your team
              </p>
            </div>

            <Link
              to="/app/plans/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Create Plan
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700">
                {(['all', 'public', 'private', 'mine'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterStatus(filter)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                      filterStatus === filter
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="title">Title A-Z</option>
                <option value="progress">Progress</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <PlanListContainer filter={filterStatus} sortBy={sortBy} />
    </div>
  );
};

export default PlansListNew;
