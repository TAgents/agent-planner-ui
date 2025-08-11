import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getStatusColor } from '../../utils/planUtils';
import { PlanNode } from '../../types';
import { Flag, Calendar, CheckCircle, AlertTriangle, Target, Trophy } from 'lucide-react';

const MilestoneNode: React.FC<NodeProps> = ({ data, selected }) => {
  const node: PlanNode = data.node;
  
  // Add defensive checks
  if (!node) {
    console.error('MilestoneNode: No node data provided');
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
  const title = node.title || 'Untitled Milestone';
  const status = node.status || 'not_started';
  
  // Layer and view settings from parent
  const activeLayer = data.activeLayer || 'overview';
  const currentZoom = data.currentZoom || 1;
  const showLabels = data.showLabels !== false;
  
  // Mock milestone data
  const dueDate = node.due_date || new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000);
  const dependencies = Math.floor(Math.random() * 5) + 1;
  const isKeyMilestone = Math.random() > 0.5;
  const completionCriteria = [
    'All development tasks complete',
    'Testing phase passed',
    'Documentation finalized'
  ];
  const progress = status === 'completed' ? 100 : Math.floor(Math.random() * 80);
  const hasRisk = status !== 'completed' && Math.random() > 0.7;
  
  // Minimal view
  if (currentZoom < 0.5) {
    return (
      <>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <div className={`w-4 h-4 transform rotate-45 ${getStatusColor(status)} ${selected ? 'ring-4 ring-purple-500' : ''}`} />
      </>
    );
  }
  
  // Compact view
  if (currentZoom < 0.8) {
    return (
      <>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <div className={`p-2 rounded-lg min-w-[120px] ${selected ? 'bg-purple-200 border-2 border-purple-600 dark:bg-purple-800' : 'bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700'} shadow-sm`}>
          <div className="flex items-center gap-2">
            <Flag className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            {showLabels && <h3 className="text-xs font-medium text-purple-800 dark:text-purple-200 truncate">{title}</h3>}
          </div>
          {status === 'completed' && (
            <CheckCircle className="w-3 h-3 text-green-600 mt-1" />
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
      
      <div className={`p-4 rounded-lg min-w-[220px] max-w-[300px] ${selected ? 'bg-purple-200 border-2 border-purple-600 shadow-xl dark:bg-purple-800' : 'bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 dark:border-purple-700 shadow-md'} transition-all duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 transform rotate-45 ${getStatusColor(status)}`}></div>
            {isKeyMilestone ? (
              <Trophy className="w-5 h-5 text-yellow-600" />
            ) : (
              <Flag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            )}
            {showLabels && <h3 className="font-semibold text-purple-800 dark:text-purple-200">{title}</h3>}
          </div>
          {activeLayer === 'risks' && hasRisk && (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          )}
        </div>
        
        {/* Layer-specific content */}
        {activeLayer === 'overview' && (
          <>
            <div className="space-y-2 text-xs text-purple-700 dark:text-purple-300">
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3" />
                <span>{isKeyMilestone ? 'Key Milestone' : 'Milestone'}</span>
              </div>
              {status === 'completed' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Achieved</span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1.5">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {activeLayer === 'progress' && (
          <div className="space-y-3">
            {status === 'completed' ? (
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-700">Milestone Achieved</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Completed on {new Date(node.updated_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{progress}%</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Complete</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Criteria:</div>
                  {completionCriteria.slice(0, 2).map((criteria, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                      <div className={`w-2 h-2 rounded-full ${i < progress / 50 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="truncate">{criteria}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {activeLayer === 'timeline' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300">Timeline</span>
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
              <div>Target: {new Date(dueDate).toLocaleDateString()}</div>
              <div className={`font-medium ${new Date() > new Date(dueDate) && status !== 'completed' ? 'text-red-600' : 'text-green-600'}`}>
                {status === 'completed' ? 'Completed' : 
                 new Date() > new Date(dueDate) ? 'Overdue' : 
                 `${Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`}
              </div>
            </div>
          </div>
        )}
        
        {activeLayer === 'resources' && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Dependencies
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
              <div>{dependencies} prerequisite tasks</div>
              <div>Blocks {Math.floor(Math.random() * 3) + 1} downstream tasks</div>
            </div>
            {isKeyMilestone && (
              <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-1 text-xs font-medium text-yellow-600">
                  <Trophy className="w-3 h-3" />
                  <span>Critical Path Item</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeLayer === 'risks' && (
          <div className="space-y-2">
            {hasRisk ? (
              <>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">At Risk</span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Dependencies not meeting timeline. May miss target date.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">On Track</span>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  All dependencies progressing as planned
                </p>
              </>
            )}
          </div>
        )}
        
        <div className="mt-3 pt-2 border-t border-purple-200 dark:border-purple-700 text-xs text-purple-500 dark:text-purple-400">
          Milestone
        </div>
      </div>
    </>
  );
};

export default memo(MilestoneNode);