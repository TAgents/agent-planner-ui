import React, { useState, useEffect } from 'react';
import { DemoPlan } from './demoPlansData';
import { DashboardHeader } from './DashboardHeader';
import { NodeTreeItem } from './NodeTreeItem';

interface InteractiveDashboardProps {
  plan: DemoPlan;
}

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  plan
}) => {
  // Track which nodes are expanded - start with all phases expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    // Expand all phase nodes by default
    plan.nodes.forEach((node) => {
      if (node.type === 'phase') {
        initialExpanded.add(node.id);
      }
    });
    return initialExpanded;
  });

  // Reset expanded nodes when plan changes
  useEffect(() => {
    const newExpanded = new Set<string>();
    plan.nodes.forEach((node) => {
      if (node.type === 'phase') {
        newExpanded.add(node.id);
      }
    });
    setExpandedNodes(newExpanded);
  }, [plan.id]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-gray-300">
      {/* Dashboard Header */}
      <DashboardHeader plan={plan} />

      {/* Node Tree */}
      <div className="p-4 md:p-6 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {plan.nodes.length > 0 ? (
          plan.nodes.map((node) => (
            <NodeTreeItem
              key={node.id}
              node={node}
              isExpanded={expandedNodes.has(node.id)}
              onToggle={toggleNode}
              depth={0}
              expandedNodes={expandedNodes}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No tasks in this plan yet
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-xs md:text-sm text-gray-600 text-center leading-relaxed">
          <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
            <span>👁️</span>
            <span>
              This is a view-only demo. Sign in with GitHub to create your own
              plans.
            </span>
          </span>
        </p>
      </div>
    </div>
  );
};
