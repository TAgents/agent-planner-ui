import React, { useState } from 'react';
import { 
  Eye, 
  BarChart3, 
  Calendar, 
  Settings2, 
  ChevronDown,
  Tag,
  GitBranch,
  Layers
} from 'lucide-react';

export type ViewMode = 'overview' | 'progress' | 'timeline';

interface ViewControlsProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  showLabels: boolean;
  showProgress: boolean;
  showDependencies: boolean;
  onToggleLabels: () => void;
  onToggleProgress: () => void;
  onToggleDependencies: () => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  activeView,
  onViewChange,
  showLabels,
  showProgress,
  showDependencies,
  onToggleLabels,
  onToggleProgress,
  onToggleDependencies,
}) => {
  const [showViewOptions, setShowViewOptions] = useState(false);

  const views = [
    { id: 'overview', label: 'Overview', icon: Eye, description: 'Structure and status' },
    { id: 'progress', label: 'Progress', icon: BarChart3, description: 'Completion metrics' },
    { id: 'timeline', label: 'Timeline', icon: Calendar, description: 'Dates and schedule' },
  ];

  const activeViewData = views.find(v => v.id === activeView);

  return (
    <div className="flex items-center gap-3">
      {/* Simplified View Selector - Dropdown instead of tabs */}
      <div className="relative">
        <button
          onClick={() => setShowViewOptions(!showViewOptions)}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {activeViewData && (
            <>
              <activeViewData.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {activeViewData.label}
              </span>
            </>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showViewOptions ? 'rotate-180' : ''}`} />
        </button>

        {showViewOptions && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => {
                  onViewChange(view.id as ViewMode);
                  setShowViewOptions(false);
                }}
                className={`
                  w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                  ${activeView === view.id ? 'bg-blue-50 dark:bg-gray-700' : ''}
                  ${view.id === 'overview' ? 'rounded-t-lg' : ''}
                  ${view.id === 'timeline' ? 'rounded-b-lg' : ''}
                `}
              >
                <view.icon className={`w-4 h-4 ${activeView === view.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <div className="text-left">
                  <div className={`text-sm font-medium ${activeView === view.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                    {view.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {view.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View Options - Grouped in a single button */}
      <div className="relative">
        <button
          className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          title="View Options"
        >
          <Settings2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 hidden group-hover:block">
          <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={onToggleLabels}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-200">Show Labels</span>
          </label>
          <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={showProgress}
              onChange={onToggleProgress}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-200">Show Progress</span>
          </label>
          <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={showDependencies}
              onChange={onToggleDependencies}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <GitBranch className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-200">Dependencies</span>
          </label>
        </div>
      </div>

      {/* Compact Toggle Buttons - Alternative to dropdown */}
      <div className="flex items-center gap-1 border-l pl-3 border-gray-200 dark:border-gray-700">
        <button
          onClick={onToggleLabels}
          className={`p-1.5 rounded-lg transition-colors ${
            showLabels ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Toggle labels"
        >
          <Tag className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleProgress}
          className={`p-1.5 rounded-lg transition-colors ${
            showProgress ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Toggle progress"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleDependencies}
          className={`p-1.5 rounded-lg transition-colors ${
            showDependencies ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Toggle dependencies"
        >
          <GitBranch className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ViewControls;
