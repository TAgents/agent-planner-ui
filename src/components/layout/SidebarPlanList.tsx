/**
 * SidebarPlanList — plan list section extracted from AppSidebar.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Plan, PlanStatus } from '../../types';

const statusColors: Record<PlanStatus, string> = {
  draft: 'bg-gray-400 dark:bg-gray-500',
  active: 'bg-amber-500',
  completed: 'bg-emerald-500',
  archived: 'bg-gray-300 dark:bg-gray-600',
};

const statusBorderColors: Record<PlanStatus, string> = {
  draft: 'border-l-gray-300 dark:border-l-gray-600',
  active: 'border-l-amber-400',
  completed: 'border-l-emerald-400',
  archived: 'border-l-gray-300 dark:border-l-gray-600',
};

interface SidebarPlanListProps {
  plans: Plan[] | undefined;
  filteredPlans: Plan[];
  isLoading: boolean;
  searchQuery: string;
  activePlanId: string | null;
  onNavClick: () => void;
}

const SidebarPlanList: React.FC<SidebarPlanListProps> = ({
  plans,
  filteredPlans,
  isLoading,
  searchQuery,
  activePlanId,
  onNavClick,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 pt-2 pb-1">
        <h3 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Plans
        </h3>
      </div>

      <nav className="px-2 space-y-0.5">
        {isLoading ? (
          <div className="px-2 py-3">
            <div className="animate-pulse space-y-1.5">
              <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
              <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
              <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
            </div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="px-2 py-3 text-xs text-gray-400 dark:text-gray-500">
            {searchQuery ? 'No plans found' : 'No plans yet'}
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <Link
              key={plan.id}
              to={`/app/plans/${plan.id}`}
              onClick={onNavClick}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all border-l-2 ${
                activePlanId === plan.id
                  ? `bg-gray-100 dark:bg-gray-800/80 ${statusBorderColors[plan.status]}`
                  : `border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:${statusBorderColors[plan.status]}`
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[plan.status]}`}
                title={plan.status}
              />
              <span className={`text-xs truncate flex-1 ${
                activePlanId === plan.id
                  ? 'font-medium text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
              }`} title={plan.title}>{plan.title}</span>
              {typeof plan.progress === 'number' && plan.progress > 0 && (
                <span className="text-[9px] tabular-nums text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {plan.progress}%
                </span>
              )}
            </Link>
          ))
        )}

        {plans && plans.length > 10 && (
          <Link
            to="/app/plans"
            onClick={onNavClick}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-md transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </nav>
    </div>
  );
};

export default SidebarPlanList;
