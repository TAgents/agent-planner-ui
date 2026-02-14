import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  HelpCircle,
  X,
  Settings,
  MessageSquare as MessageSquareIcon,
} from 'lucide-react';

// Import new components
import EmptyStateGuide from '../components/visualization/EmptyStateGuide';
import OnboardingTour from '../components/visualization/OnboardingTour';
import ShareButton from '../components/sharing/ShareButton';
import { PlanTreeView } from '../components/tree/PlanTreeView';
import { getNextStatus } from '../components/tree/StatusBadge';
import VisibilityToggle from '../components/plans/VisibilityToggle';
import GitHubRepoBadge from '../components/github/GitHubRepoBadge';
import PlanBreadcrumb from '../components/plan/PlanBreadcrumb';
import { DecisionBadge, DecisionPanel, DecisionDetailModal } from '../components/decisions';
import { PlanSettingsModal } from '../components/plan/PlanSettingsModal';
import PlanChatPanel from '../components/chat/PlanChatPanel';
import AgentStatusIndicator from '../components/agent/AgentStatusIndicator';
import { useAgentRequestEvents } from '../hooks/useAgentRequests';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useFocusNavigation } from '../hooks/useFocusNavigation';
import { useViewPresence } from '../contexts/PresenceContext';
import { PresenceIndicator } from '../components/presence/PresenceIndicator';
  // UI state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setActiveDetailTab] = useState<'details' | 'comments' | 'logs'>('details');
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('task');
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
  
  // Decision UI state
  const [showDecisionPanel, setShowDecisionPanel] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  
  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
            {/* Settings button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Plan Settings"
            >
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {/* WebSocket connection status indicator - hidden on mobile */}
            <div className="hidden sm:flex px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg" title="Real-time updates">
              <WebSocketStatus showDetails={false} />
            </div>

            {/* Fullscreen button - hidden on mobile (most mobile browsers don't support it well) */}
            <button
              onClick={toggleFullScreen}
              className="hidden sm:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            
            {/* Help button - hidden on mobile (keyboard shortcuts aren't relevant) */}
            <button
              onClick={() => setShowHelp(true)}
              className="hidden sm:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Help (?)"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation - shows when a node is selected */}
      {uiState.nodeDetails.selectedNodeId && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <PlanBreadcrumb
            planId={planId || ''}
            planTitle={plan.title}
            nodes={planNodes}
            selectedNodeId={uiState.nodeDetails.selectedNodeId}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      )}

      {/* Main Content - Split Pane Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Tree View - Takes remaining space with independent scrolling */}
        <div className="flex-1 min-w-0 overflow-hidden border-r border-gray-200 dark:border-gray-700">
          {planNodes.length === 0 && !isPlanLoading && !isNodesLoading ? (
            <EmptyStateGuide
              planTitle={plan.title}
              onCreateFirstNode={handleCreateNode}
            />
          ) : (
            <PlanTreeView
              nodes={planNodes}
              selectedNodeId={uiState.nodeDetails.selectedNodeId}
              onNodeSelect={handleNodeSelect}
              onNodeStatusChange={handleStatusChange}
              onNodeCreate={() => handleCreateNode()}
              onNodeCreateInline={handleInlineNodeCreate}
              onNodeMove={handleNodeMove}
              className="h-full"
            />
          )}
        </div>

        {/* Node creation modal */}
        {isCreatingNode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Node</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="phase">Phase</option>
                    <option value="task">Task</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent</label>
                  <select
                    value={newNodeParentId || ''}
                    onChange={(e) => setNewNodeParentId(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">No Parent (Root)</option>
                    {planNodes.map(node => (
                      <option key={node.id} value={node.id}>{node.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter node title"
                    id="new-node-title"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreatingNode(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const titleInput = document.getElementById('new-node-title') as HTMLInputElement;
                      if (titleInput.value) {
                        submitNewNode(titleInput.value);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop & Tablet (Fixed width split pane) */}
        {uiState.sidebar.isOpen && uiState.nodeDetails.isOpen && selectedNode && (
          <aside className="hidden md:flex flex-col flex-shrink-0 w-[480px] lg:w-[560px] xl:w-[640px] border-l border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
            <UnifiedNodeDetails
              node={selectedNode}
              planId={planId || ''}
              currentUser={{ id: '1', name: 'Current User', email: 'user@example.com', role: 'user' }}
              activeUsers={[]}
              onStatusChange={(newStatus) => handleStatusChange(selectedNode.id, newStatus)}
              onLogAdd={handleLogAdd}
              onActivityReact={(activityId, emoji) => console.log('React:', activityId, emoji)}
              onActivityReply={(activityId, text) => console.log('Reply:', activityId, text)}
              onClose={closeNodeDetails}
            />
          </aside>
        )}

        {/* Node Details Modal - Mobile Only */}
        {uiState.nodeDetails.isOpen && selectedNode && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeNodeDetails}
            />

            {/* Modal Content */}
            <div className="relative w-full h-[90vh] sm:h-[85vh] sm:max-w-2xl sm:rounded-t-xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-slide-up">
              <UnifiedNodeDetails
                node={selectedNode}
                planId={planId || ''}
                currentUser={{ id: '1', name: 'Current User', email: 'user@example.com', role: 'user' }}
                activeUsers={[]}
                onStatusChange={(newStatus) => handleStatusChange(selectedNode.id, newStatus)}
                onLogAdd={handleLogAdd}
                onActivityReact={(activityId, emoji) => console.log('React:', activityId, emoji)}
                onActivityReply={(activityId, text) => console.log('Reply:', activityId, text)}
                onClose={closeNodeDetails}
              />
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour 
        isVisible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Decision Panel */}
      <DecisionPanel
        planId={planId || ''}
        isOpen={showDecisionPanel}
        onClose={() => setShowDecisionPanel(false)}
        onSelectDecision={(decision) => {
          setSelectedDecision(decision);
          setShowDecisionPanel(false);
        }}
      />

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <DecisionDetailModal
          decision={selectedDecision}
          planId={planId || ''}
          isOpen={!!selectedDecision}
          onClose={() => setSelectedDecision(null)}
          onDecisionMade={() => {
            setSelectedDecision(null);
          }}
        />
      )}

      {/* Plan Settings Modal */}
      <PlanSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        planId={planId || ''}
        planTitle={plan.title}
      />

      {/* Chat Panel - Fixed right side overlay */}
      {showChat && (
        <div className="fixed right-0 top-14 bottom-0 z-30 shadow-xl">
          <PlanChatPanel
            planId={planId || ''}
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}