import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Clock, ChevronRight, UserPlus, Filter } from 'lucide-react';
import api from '../services/api';
import CollaboratorAvatars from '../components/sharing/CollaboratorAvatars';
import { formatDate } from '../utils/planUtils';

interface SharedPlan {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  role: 'viewer' | 'editor' | 'admin';
  owner: {
    id: string;
    name?: string;
    email: string;
  };
  collaborators: Array<{
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  }>;
  updated_at: string;
  shared_at: string;
}

const SharedPlans: React.FC = () => {
  const [plans, setPlans] = useState<SharedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'viewer' | 'editor' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'role'>('recent');

  useEffect(() => {
    loadSharedPlans();
  }, []);

  const loadSharedPlans = async () => {
    setLoading(true);
    try {
      // This would be a specific endpoint for shared plans
      // For now, we'll use the regular plans endpoint and filter
      const response = await api.plans.getPlans(1, 100);
      
      // Mock filtering for shared plans (in production, this would be server-side)
      const sharedPlans = (response.data || response || []).filter((plan: any) => {
        // In a real implementation, check if the plan has collaborators
        // or if current user is not the owner
        return true; // For demo purposes, show all plans
      }).map((plan: any) => ({
        ...plan,
        role: 'editor', // Mock role
        owner: {
          id: plan.owner_id || 'unknown',
          email: 'owner@example.com',
          name: 'Plan Owner'
        },
        collaborators: [
          { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
          { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
        ],
        shared_at: plan.created_at
      }));
      
      setPlans(sharedPlans);
    } catch (error) {
      console.error('Failed to load shared plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    if (filter === 'all') return true;
    return plan.role === filter;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'role':
        const roleOrder = { admin: 0, editor: 1, viewer: 2 };
        return roleOrder[a.role] - roleOrder[b.role];
      case 'recent':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'editor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'viewer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'completed':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'archived':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Shared with Me
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plans that others have shared with you
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="viewer">Viewer Only</option>
              <option value="editor">Editor Only</option>
              <option value="admin">Admin Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="recent">Recently Updated</option>
              <option value="name">Name</option>
              <option value="role">Role</option>
            </select>
          </div>

          <div className="ml-auto">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {sortedPlans.length} shared {sortedPlans.length === 1 ? 'plan' : 'plans'}
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedPlans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No shared plans yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              When someone shares a plan with you, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedPlans.map((plan) => (
              <Link
                key={plan.id}
                to={`/plans/${plan.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
              >
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(plan.status)}
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {plan.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {plan.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Owner</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {plan.owner.name || plan.owner.email}
                    </span>
                  </div>

                  {/* Your Role */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Your role</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(plan.role)}`}>
                      {plan.role.charAt(0).toUpperCase() + plan.role.slice(1)}
                    </span>
                  </div>

                  {/* Collaborators */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Team</span>
                    <CollaboratorAvatars
                      collaborators={plan.collaborators}
                      size="sm"
                      maxDisplay={3}
                    />
                  </div>

                  {/* Dates */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Shared {formatDate(plan.shared_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Updated {formatDate(plan.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedPlans;
