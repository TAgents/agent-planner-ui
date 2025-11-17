import React from 'react';
import { DemoPlan } from './demoPlansData';
import { formatStars, formatTimeAgo } from './formatters';

interface PlanSelectorDropdownProps {
  plans: DemoPlan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
}

export const PlanSelectorDropdown: React.FC<PlanSelectorDropdownProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6 justify-center">
      {plans.map((plan) => (
        <button
          key={plan.id}
          onClick={() => onSelectPlan(plan.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
            selectedPlanId === plan.id
              ? 'bg-blue-600 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
          }`}
          title={plan.githubRepo ? `${plan.githubRepo.owner}/${plan.githubRepo.name} • ${formatStars(plan.githubRepo.stars)} stars • Updated ${formatTimeAgo(plan.lastUpdated)}` : `${plan.title} • Updated ${formatTimeAgo(plan.lastUpdated)}`}
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold">{plan.title}</span>
            {plan.githubRepo && (
              <span className="text-xs opacity-80">
                {plan.githubRepo.owner}/{plan.githubRepo.name}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
