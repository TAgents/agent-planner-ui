import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getStatusColor } from '../../utils/planUtils';
import { PlanNode } from '../../types';
import { Folder, Users, CheckSquare, Calendar, AlertCircle } from 'lucide-react';

const PhaseNode: React.FC<NodeProps> = ({ data, selected }) => {
  const node: PlanNode = data.node;
  
  // Add defensive checks
  if (!node) {
    console.error('PhaseNode: No node data provided');
    return (
      <>
        <Handle type="target" position={Position.Top} />
        <div className="p-3 shadow-sm bg-red-50 border border-red-200 rounded">
          <div className="text-red-500 font-medium">Invalid Node</div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </>
    );
  }
  
  // Use fallback values for required properties
  const title = node.title || 'Untitled Phase';
  const status = node.status || 'not_started';
  
  // Layer and view settings from parent
  const activeLayer = data.activeLayer || 'overview';
  const currentZoom = data.currentZoom || 1;
  const showLabels = data.showLabels !== false;
  const showProgress = data.showProgress !== false;
  
  // Mock data for phase (in real app, this would come from the API)
  const progress = Math.floor(Math.random() * 100);
  const totalTasks = Math.floor(Math.random() * 20) + 5;
  const completedTasks = Math.floor(progress / 100 * totalTasks);
  const childPhases = Math.floor(Math.random() * 3) + 1;
  const teamSize = Math.floor(Math.random() * 10) + 3;
  const hasRisk = Math.random() > 0.8;
  const dueDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
  
  // Minimal view
  if (currentZoom < 0.5) {
    return (
      <>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <div className={`w-6 h-6 rounded ${getStatusColor(status)} ${selected ? 'ring-4 ring-blue-500' : ''}`} />
      </>
    );
  }
  
  // Compact view
  if (currentZoom < 0.8) {
    return (
      <>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <div className={`p-2 rounded-lg min-w-[140px] ${selected ? 'bg-blue-200 border-2 border-blue-600 dark:bg-blue-800' : 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'} shadow-sm`}>
          <div className="flex items-center gap-2">
            <Folder className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            {showLabels && <h3 className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">{title}</h3>}
          </div>
          {showProgress && activeLayer !== 'risks' && (
            <div className="mt-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </>
    );
  }
  
  // Full view with layer-specific content
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <div className={`p-4 rounded-lg min-w-[240px] max-w-[320px] ${selected ? 'bg-blue-200 border-2 border-blue-600 shadow-xl dark:bg-blue-800' : 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 shadow-sm'} transition-all duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${getStatusColor(status)}`}></div>
            <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {showLabels && <h3 className="font-semibold text-blue-800 dark:text-blue-200">{title}</h3>}
          </div>
          {activeLayer === 'risks' && hasRisk && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
        
        {/* Layer-specific content */}
        {activeLayer === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3 text-xs text-blue-700 dark:text-blue-300 mb-3">
              <div className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                <span>{completedTasks}/{totalTasks} tasks</span>
              </div>
              <div className="flex items-center gap-1">
                <Folder className="w-3 h-3" />
                <span>{childPhases} phases</span>
              </div>
            </div>
            {showProgress && (
              <div>
                <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
                  <span>Phase Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      progress === 100 ? 'bg-green-500' :
                      progress > 70 ? 'bg-blue-600' :
                      progress > 30 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
        
        {activeLayer === 'progress' && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{progress}%</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Overall Progress</div>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
              <div>
                <span className="font-medium">{completedTasks}</span> completed
              </div>
              <div className="text-right">
                <span className="font-medium">{totalTasks - completedTasks}</span> remaining
              </div>
            </div>
          </div>
        )}
        
        {activeLayer === 'timeline' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">Phase Timeline</span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <div>Due: {dueDate.toLocaleDateString()}</div>
              <div>Duration: {Math.floor(Math.random() * 30) + 10} days</div>
              <div className={`font-medium ${new Date() > dueDate ? 'text-red-600' : 'text-green-600'}`}>
                {new Date() > dueDate ? 'Overdue' : 'On Track'}
              </div>
            </div>
          </div>
        )}
        
        {activeLayer === 'resources' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Team</span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <div>Team Size: {teamSize} members</div>
              <div>Sub-teams: {childPhases}</div>
              <div>Workload: {totalTasks} tasks total</div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Avg. {Math.round(totalTasks / teamSize)} tasks/person
              </div>
            </div>
          </div>
        )}
        
        {activeLayer === 'risks' && (
          <div className="space-y-2">
            {hasRisk ? (
              <>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Phase at Risk</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Multiple blockers detected. {Math.floor(Math.random() * 5) + 1} tasks are blocked.
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Impact: High - May delay dependent phases
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Phase Healthy</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  No critical issues identified
                </p>
              </>
            )}
          </div>
        )}
        
        <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-700 text-xs text-blue-500 dark:text-blue-400">
          Phase Node
        </div>
      </div>
    </>
  );
};

export default memo(PhaseNode);