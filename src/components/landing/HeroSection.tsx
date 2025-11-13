import React, { useState, useEffect } from 'react';
import { DEMO_PLANS, DemoPlan, DemoNode } from './demoPlansData';
import { PlanSelectorDropdown } from './PlanSelectorDropdown';
import { InteractiveDashboard } from './InteractiveDashboard';
import { planService } from '../../services/api';

// Helper function to convert API node structure to demo format
const convertNodeToDemoFormat = (node: any, level: 'phase' | 'task' | 'subtask' = 'phase'): DemoNode => {
  const demoNode: DemoNode = {
    id: node.id,
    title: node.title,
    type: level,
    status: node.status === 'completed' ? 'completed' :
            node.status === 'in_progress' ? 'in_progress' : 'not_started',
  };

  if (node.children && node.children.length > 0) {
    const nextLevel = level === 'phase' ? 'task' : 'subtask';
    demoNode.children = node.children.map((child: any) =>
      convertNodeToDemoFormat(child, nextLevel as any)
    );
  }

  return demoNode;
};

// Helper function to convert API plan to demo format
const convertPlanToDemoFormat = (apiPlan: any, structure: any): DemoPlan => {
  const plan = apiPlan.plan || apiPlan;

  // Convert the node structure (skip root node, use its children as phases)
  const phases = structure.children || [];
  const nodes = phases.map((phase: any) => convertNodeToDemoFormat(phase, 'phase'));

  // Calculate total and completed tasks from progress
  const totalTasks = Math.round(plan.progress ? 20 * (100 / Math.max(plan.progress, 1)) : 20);
  const completedTasks = Math.round(totalTasks * (plan.progress || 0) / 100);

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    githubRepo: {
      owner: plan.github_repo_owner || 'agentplanner',
      name: plan.github_repo_name || 'community',
      stars: 0,
      url: plan.github_repo_owner && plan.github_repo_name
        ? `https://github.com/${plan.github_repo_owner}/${plan.github_repo_name}`
        : 'https://github.com/talkingagents/agent-planner'
    },
    lastUpdated: new Date(plan.updated_at),
    lastUpdatedBy: plan.owner?.name || plan.owner?.email?.split('@')[0] || 'user',
    progress: plan.progress || 0,
    totalTasks: totalTasks,
    completedTasks: completedTasks,
    nodes: nodes
  };
};

export const HeroSection: React.FC = () => {
  const [plans, setPlans] = useState(DEMO_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState(DEMO_PLANS[0].id);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real public plans on mount
  useEffect(() => {
    const fetchPublicPlans = async () => {
      try {
        const response = await planService.getPublicPlans('recent', 3, 0);

        if (response.plans && response.plans.length > 0) {
          console.log('Fetched public plans:', response.plans);

          // Fetch full structure for each plan
          const plansWithStructure = await Promise.all(
            response.plans.slice(0, 3).map(async (plan: any) => {
              try {
                const fullPlan = await planService.getPublicPlanWithStructure(plan.id);
                return convertPlanToDemoFormat(fullPlan, fullPlan.structure);
              } catch (error) {
                console.error(`Failed to fetch structure for plan ${plan.id}:`, error);
                return null;
              }
            })
          );

          // Filter out any failed fetches and use the converted plans
          const validPlans = plansWithStructure.filter(p => p !== null) as DemoPlan[];

          if (validPlans.length > 0) {
            setPlans(validPlans);
            setSelectedPlanId(validPlans[0].id);
          } else {
            // Fallback to demo plans if all fetches failed
            setPlans(DEMO_PLANS);
          }
        } else {
          // No public plans available, use demo data
          setPlans(DEMO_PLANS);
        }
      } catch (error) {
        console.error('Failed to fetch public plans:', error);
        // Fallback to demo plans
        setPlans(DEMO_PLANS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicPlans();
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handlePlanChange = (planId: string) => {
    if (planId !== selectedPlanId) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedPlanId(planId);
        setIsTransitioning(false);
      }, 150);
    }
  };

  return (
    <section className="relative py-12 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Tagline */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Plan in public with your team and AI agents
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Explore how open source teams use Agent Planner
          </p>
        </div>

        {/* Plan Selector */}
        <PlanSelectorDropdown
          plans={plans}
          selectedPlanId={selectedPlanId}
          onSelectPlan={handlePlanChange}
        />

        {/* Interactive Dashboard */}
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <InteractiveDashboard plan={selectedPlan} />
        </div>

        {/* CTAs */}
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/auth/github"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Sign in with GitHub</span>
          </a>
          <a
            href="/explore"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <span>Explore Public Plans</span>
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        {/* Hint */}
        <p className="text-center mt-6 text-sm text-gray-600 leading-relaxed">
          <span className="inline-flex items-center gap-2 flex-wrap justify-center">
            <span>👁️</span>
            <span>Public plans are view-only</span>
            <span className="text-gray-400">•</span>
            <span>🔑</span>
            <span>Sign in to create your own</span>
          </span>
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
