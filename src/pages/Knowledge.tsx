import React, { useState } from 'react';
import { Network, Clock } from 'lucide-react';
import KnowledgeGraph from './KnowledgeGraph';
import KnowledgeTimeline from './KnowledgeTimeline';

type KnowledgeTab = 'graph' | 'timeline';

const Knowledge: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('timeline');

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 sm:px-6">
        <div className="flex items-center gap-4 py-2.5">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Knowledge</h1>
          <nav className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Clock className="w-3 h-3" />
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                activeTab === 'graph'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Network className="w-3 h-3" />
              Graph
            </button>
          </nav>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'graph' && <KnowledgeGraph />}
        {activeTab === 'timeline' && <KnowledgeTimeline />}
      </div>
    </div>
  );
};

export default Knowledge;
