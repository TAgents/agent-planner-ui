import React from 'react';
import { 
  Lightbulb, 
  Plus, 
  Target, 
  GitBranch,
  MousePointer,
  Layers,
  Sparkles
} from 'lucide-react';

interface EmptyStateGuideProps {
  onCreateFirstNode: () => void;
  planTitle: string;
}

const EmptyStateGuide: React.FC<EmptyStateGuideProps> = ({ onCreateFirstNode, planTitle }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto p-8 text-center">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Your Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            "{planTitle}" is ready for structure
          </p>
        </div>

        {/* Quick Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Getting Started
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Create Phases</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Break your project into major phases or milestones
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Add Tasks</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Define specific tasks within each phase
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Set Dependencies</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Connect related tasks to show workflow
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
                <MousePointer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Drag & Drop</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Arrange nodes to visualize your plan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onCreateFirstNode}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create Your First Node
        </button>

        {/* Additional Help Text */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Need help? Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">?</kbd> for keyboard shortcuts
        </p>
      </div>
    </div>
  );
};

export default EmptyStateGuide;
