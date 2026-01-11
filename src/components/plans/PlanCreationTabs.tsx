import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';

export type PlanCreationTab = 'ai' | 'mcp';

interface PlanCreationTabsProps {
  activeTab: PlanCreationTab;
  onTabChange: (tab: PlanCreationTab) => void;
}

const PlanCreationTabs: React.FC<PlanCreationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onTabChange('ai')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'ai'
            ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
            : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        Plan with AI
      </button>
      <button
        onClick={() => onTabChange('mcp')}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'mcp'
            ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
            : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
        }`}
      >
        <Terminal className="w-4 h-4" />
        Use MCP with Claude
      </button>
    </div>
  );
};

export default PlanCreationTabs;
