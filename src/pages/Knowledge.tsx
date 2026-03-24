import React, { useState } from 'react';
import { Network, Clock, BarChart3 } from 'lucide-react';
import KnowledgeGraph from './KnowledgeGraph';
import KnowledgeTimeline from './KnowledgeTimeline';
import KnowledgeCoverageTab from './KnowledgeCoverageTab';

type KnowledgeTab = 'coverage' | 'timeline' | 'graph';

const Knowledge: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('coverage');

  const tabs: { id: KnowledgeTab; label: string; icon: typeof Clock }[] = [
    { id: 'coverage', label: 'Coverage', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'graph', label: 'Graph', icon: Network },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 sm:px-6">
        <div className="flex items-center gap-4 py-2.5">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Knowledge</h1>
          <nav className="flex items-center gap-1 ml-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'coverage' && (
          <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <KnowledgeCoverageTab />
          </div>
        )}
        {activeTab === 'timeline' && <KnowledgeTimeline />}
        {activeTab === 'graph' && <KnowledgeGraph />}
      </div>
    </div>
  );
};

export default Knowledge;
