import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Circle,
  Folder,
  FileText,
  Flag,
  Info
} from 'lucide-react';

interface StatusLegendProps {
  show: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

const StatusLegend: React.FC<StatusLegendProps> = ({ show, position = 'bottom-left' }) => {
  if (!show) return null;
  
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-20 left-4',
    'top-right': 'top-20 right-4',
  };
  
  return (
    <div className={`
      fixed ${positionClasses[position]} 
      bg-white dark:bg-gray-800 
      rounded-lg shadow-lg 
      border border-gray-200 dark:border-gray-700 
      p-4 z-10 
      max-w-xs
    `}>
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Visual Guide
        </h3>
      </div>
      
      <div className="space-y-3">
        {/* Status indicators */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Not Started</span>
            </div>
          </div>
        </div>
        
        {/* Node types */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Node Types
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded">
                <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Phase - Group of tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Task - Action item</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded">
                <Flag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Milestone - Key achievement</span>
            </div>
          </div>
        </div>
        
        {/* Visual cues */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Visual Cues
          </h4>
          <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            <div>• Larger nodes = Phases/Groups</div>
            <div>• Rounded pills = Milestones</div>
            <div>• Progress bars = Parent nodes</div>
            <div>• Colored borders = Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusLegend;
