import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Calendar,
  ChevronRight,
  ChevronDown,
  Edit3,
  Check,
  X,
  MoreHorizontal,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  PlayCircle,
  Circle,
  Activity,
  Brain,
  AlertTriangle,
  Target,
  Code2,
  Save,
  Copy,
  Eye,
  EyeOff,
  Layers,
  Square,
  Trash2,
  Copy as CopyIcon,
  Move,
  Archive,
  Loader2,
  Tag,
  Clock,
  GitBranch,
  Pencil,
  Cpu
} from 'lucide-react';
import { PlanNode, NodeStatus, NodeType, TaskMode, User as UserType } from '../../types';
import { formatDate } from '../../utils/planUtils';
import { useNodeLogs } from '../../hooks/useNodeLogs';
import { useCollaborators } from '../../hooks/useCollaborators';
import { useNodeAssignments } from '../../hooks/useNodeAssignments';
import { useNodeInstructions } from '../../hooks/useNodeInstructions';
import api from '../../services/api';
import NodeDependenciesTab from './NodeDependenciesTab';
import NodeKnowledgeTab from './NodeKnowledgeTab';
import AgentContextPanel from './AgentContextPanel';

// Types
interface UnifiedNodeDetailsProps {
  node: PlanNode;
  planId: string;
  currentUser: UserType;
  activeUsers?: UserType[];
  typingUsers?: UserType[];
  onStatusChange: (status: NodeStatus) => void;
  onLogAdd?: (content: string, logType: string, tags?: string[]) => void;
  onActivityReact?: (activityId: string, emoji: string) => void;
  onActivityReply?: (activityId: string, text: string) => void;
  onAssignUser?: (userId: string) => void;
  onUnassignUser?: (userId: string) => void;
  onClose?: () => void;
  /** All nodes in the plan, for dependency picker */
  allNodes?: PlanNode[];
  onUpdateNode?: (nodeId: string, data: Partial<PlanNode>) => Promise<void>;
}

type ActivityType =
  | 'log'
  | 'status_change'
  | 'assignment'
  | 'edit'
  | 'dependency_added'
  | 'dependency_removed';

type LogType = 'progress' | 'reasoning' | 'challenge' | 'decision';

type ActivityFilter = 'all' | 'logs';

interface UnifiedActivity {
  id: string;
  nodeId: string;
  type: ActivityType;
  actor: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  timestamp: Date;
  data: any; // Polymorphic based on type
  metadata?: {
    isEdited?: boolean;
    editedAt?: Date;
    reactions?: Map<string, string[]>;
    thread?: UnifiedActivity[];
  };
}

// Utility: Time formatting
const formatTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

// Component: Log Type Icon
const LogTypeIcon: React.FC<{ logType: LogType }> = ({ logType }) => {
  const config = {
    progress: { icon: Activity, color: 'text-blue-500 dark:text-blue-400' },
    reasoning: { icon: Brain, color: 'text-purple-500 dark:text-purple-400' },
    challenge: { icon: AlertTriangle, color: 'text-yellow-500 dark:text-yellow-400' },
    decision: { icon: Target, color: 'text-green-500 dark:text-green-400' }
  };

  const Icon = config[logType].icon;
  return <Icon className={`w-3.5 h-3.5 ${config[logType].color}`} />;
};

// Component: Node Type Icon
const NodeTypeIcon: React.FC<{ nodeType: string }> = ({ nodeType }) => {
  const config = {
    phase: { icon: Layers, color: 'text-purple-500 dark:text-purple-400' },
    task: { icon: Square, color: 'text-blue-500 dark:text-blue-400' },
    milestone: { icon: Target, color: 'text-green-500 dark:text-green-400' }
  };

  const Icon = config[nodeType as keyof typeof config]?.icon || Square;
  const color = config[nodeType as keyof typeof config]?.color || 'text-gray-500 dark:text-gray-400';

  return <Icon className={`w-4 h-4 ${color}`} />;
};

// Component: Status Badge
const StatusBadge: React.FC<{ status: NodeStatus; onChange?: (status: NodeStatus) => void; nodeId?: string }> = ({
  status,
  onChange,
  nodeId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<NodeStatus | null>(null);

  // Reset local status when node changes or when status prop changes
  React.useEffect(() => {
    setLocalStatus(null);
    setIsOpen(false);
  }, [nodeId, status]);

  // Use local status if set (after user selection), otherwise use prop
  const displayStatus = localStatus || status;

  const statusConfig = {
    not_started: { icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' },
    in_progress: { icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200' },
    blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-200' },
    plan_ready: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-200' }
  };

  const Icon = (statusConfig[displayStatus] || statusConfig.not_started).icon;

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${(statusConfig[displayStatus] || statusConfig.not_started).bg} ${(statusConfig[displayStatus] || statusConfig.not_started).text}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{displayStatus.replace('_', ' ')}</span>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${(statusConfig[displayStatus] || statusConfig.not_started).bg} ${(statusConfig[displayStatus] || statusConfig.not_started).text} hover:opacity-90 transition-all duration-200`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{displayStatus.replace('_', ' ')}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] min-w-[160px]">
          {(['not_started', 'in_progress', 'completed', 'blocked', 'plan_ready'] as NodeStatus[]).map(s => {
            const SIcon = statusConfig[s].icon;
            return (
              <button
                key={s}
                onClick={() => {
                  setLocalStatus(s);
                  onChange(s);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
              >
                <SIcon className={`w-3.5 h-3.5 ${statusConfig[s].color}`} />
                <span className="capitalize">{s.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Component: User Avatar with real initials
const Avatar: React.FC<{
  user: { name?: string; email?: string; avatar?: string };
  size?: 'xs' | 'sm' | 'md'
}> = ({
  user,
  size = 'sm'
}) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm'
  };

  if (user.avatar) {
    return <img src={user.avatar} alt={user.name || user.email || ''} className={`${sizeClasses[size]} rounded-full`} />;
  }

  // Get initials from name or email
  const displayName = user.name || user.email || 'U';
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate consistent color based on name/email
  const colors = [
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-red-500 to-pink-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-blue-500',
    'from-purple-500 to-pink-500'
  ];
  const colorIndex = (displayName.charCodeAt(0) + displayName.charCodeAt(displayName.length - 1)) % colors.length;

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-medium`}>
      {initials}
    </div>
  );
};

// Component: Actions Menu (NEW)
const ActionsMenu: React.FC<{
  onEdit?: () => void;
  onCopyId?: () => void;
  onMove?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}> = ({ onEdit, onCopyId, onMove, onDuplicate, onArchive, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-150"
        title="More actions"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] min-w-[180px]">
          {onEdit && (
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300 min-h-[44px]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit details
            </button>
          )}
          {onCopyId && (
            <button
              onClick={() => { onCopyId(); setIsOpen(false); }}
              className="w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300 min-h-[44px]"
            >
              <CopyIcon className="w-3.5 h-3.5" />
              Copy node ID
            </button>
          )}
          {onMove && (
            <button
              onClick={() => { onMove(); setIsOpen(false); }}
              className="w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300 min-h-[44px]"
            >
              <Move className="w-3.5 h-3.5" />
              Move to...
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={() => { onDuplicate(); setIsOpen(false); }}
              className="w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300 min-h-[44px]"
            >
              <CopyIcon className="w-3.5 h-3.5" />
              Duplicate
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => { onArchive(); setIsOpen(false); }}
              className="w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300 min-h-[44px]"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive
            </button>
          )}
          {onDelete && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={() => { onDelete(); setIsOpen(false); }}
                className="w-full px-3 py-2.5 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors duration-200 min-h-[44px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Component: Unified Assignment Selector (People)
const UnifiedAssignmentSelector: React.FC<{
  assignedUser?: { id: string; name?: string; email?: string };
  collaborators: any[];
  onAssignUser: (userId: string) => void;
  onUnassignUser: () => void;
  isLoading?: boolean;
  isUpdating?: boolean;
}> = ({ assignedUser, collaborators, onAssignUser, onUnassignUser, isLoading = false, isUpdating = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const hasAssignment = !!assignedUser;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || isUpdating}
        className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-3 h-3 border-2 border-gray-400 dark:border-gray-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 dark:text-gray-300">Loading...</span>
          </>
        ) : isUpdating ? (
          <>
            <div className="w-3 h-3 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 dark:text-gray-300">Updating...</span>
          </>
        ) : assignedUser ? (
          <>
            <Avatar user={assignedUser} size="xs" />
            <span className="text-gray-700 dark:text-gray-300">{assignedUser.name || assignedUser.email || 'Assigned'}</span>
          </>
        ) : (
          <>
            <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
          </>
        )}
        {!isLoading && !isUpdating && <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] min-w-[260px] max-h-[400px] overflow-y-auto">
          {/* Unassign option */}
          {hasAssignment && (
            <>
              <button
                onClick={() => {
                  onUnassignUser();
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300"
              >
                <X className="w-3 h-3" />
                Unassign
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700" />
            </>
          )}

          {/* 👤 People section */}
          <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span>👤</span> People
          </div>
          {collaborators.length > 0 ? collaborators.map(collab => {
            const userData = collab.user || collab;
            const userId = userData.id || collab.id;
            const isSelected = assignedUser?.id === userId;
            return (
              <button
                key={userId}
                onClick={() => {
                  onAssignUser(userId);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                disabled={isSelected}
              >
                <Avatar user={userData} size="xs" />
                <span className="flex-1">{userData.name || userData.email || 'Unknown'}</span>
                {isSelected && <Check className="w-3 h-3 text-green-500 dark:text-green-400" />}
              </button>
            );
          }) : (
            <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">No collaborators</div>
          )}

        </div>
      )}
    </div>
  );
};

// Component: Activity Item
const ActivityItem: React.FC<{
  activity: UnifiedActivity;
  onReact?: (emoji: string) => void;
  onReply?: (text: string) => void;
}> = ({ activity, onReact, onReply }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const renderContent = () => {
    switch (activity.type) {
      case 'log':
        return (
          <div className="flex gap-2">
            <Avatar user={activity.actor} size="xs" />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs text-gray-900 dark:text-white">{activity.actor.name}</span>
                <LogTypeIcon logType={activity.data.logType} />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{activity.data.logType}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {activity.data.content}
              </p>
              {activity.data.tags && activity.data.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {activity.data.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-1.5 py-0 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] text-gray-600 dark:text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'status_change':
        return (
          <div className="flex items-center gap-3 py-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900 dark:text-white">{activity.actor.name}</span>
              <span className="text-gray-500 dark:text-gray-400">changed status to</span>
              <StatusBadge status={activity.data.newStatus} />
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
            </div>
          </div>
        );

      case 'assignment':
        return (
          <div className="flex items-center gap-3 py-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <User className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900 dark:text-white">{activity.actor.name}</span>
              <span className="text-gray-500 dark:text-gray-400">assigned</span>
              <span className="font-medium text-gray-900 dark:text-white">{activity.data.assignee.name}</span>
              <span className="text-gray-500 dark:text-gray-400">to this task</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {renderContent()}

      {/* Reply Input */}
      {showReply && (
        <div className="ml-9 mt-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && replyText.trim()) {
                  onReply?.(replyText);
                  setReplyText('');
                  setShowReply(false);
                }
              }}
            />
            <button
              onClick={() => {
                if (replyText.trim()) {
                  onReply?.(replyText);
                  setReplyText('');
                  setShowReply(false);
                }
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!replyText.trim()}
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Thread */}
      {activity.metadata?.thread && activity.metadata.thread.length > 0 && (
        <div className="ml-9 mt-2 space-y-2">
          {activity.metadata.thread.map(reply => (
            <ActivityItem key={reply.id} activity={reply} onReact={onReact} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

// Component: Log Composer
const LogComposer: React.FC<{
  onLogAdd: (content: string, logType: string, tags?: string[]) => void;
}> = ({ onLogAdd }) => {
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<LogType>('progress');

  const handleSubmit = () => {
    if (logContent.trim()) {
      onLogAdd(logContent, logType);
      setLogContent('');
    }
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-800/60 px-3 py-2 bg-white dark:bg-gray-900">
      <div className="flex items-end gap-1.5">
        <select
          value={logType}
          onChange={(e) => setLogType(e.target.value as LogType)}
          className="appearance-none text-[10px] text-gray-500 dark:text-gray-400 bg-transparent border-0 py-1 pr-4 cursor-pointer focus:ring-0 focus:outline-none flex-shrink-0"
        >
          <option value="progress">Progress</option>
          <option value="reasoning">Reasoning</option>
          <option value="challenge">Challenge</option>
          <option value="decision">Decision</option>
        </select>
        <textarea
          value={logContent}
          onChange={(e) => setLogContent(e.target.value)}
          placeholder="Write a log..."
          className="flex-1 px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-white placeholder-gray-400 resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          style={{ minHeight: '32px', maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!logContent.trim()}
          className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-30 rounded transition-colors flex-shrink-0"
          aria-label="Send"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Component: Agent Instructions Editor
const AgentInstructionsTab: React.FC<{
  node: PlanNode;
  onUpdate?: (instructions: string) => Promise<void>;
  readOnly?: boolean;
}> = ({ node, onUpdate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [instructions, setInstructions] = useState(node.agent_instructions || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset when node changes
  useEffect(() => {
    setInstructions(node.agent_instructions || '');
    setIsEditing(false);
  }, [node.id, node.agent_instructions]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [instructions, isEditing]);

  const handleSave = async () => {
    if (!onUpdate) {
      console.error('No update handler provided');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(instructions);
      setIsEditing(false);
      console.log('Agent instructions saved successfully');
    } catch (error) {
      console.error('Failed to save agent instructions:', error);
      alert('Failed to save agent instructions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setInstructions(node.agent_instructions || '');
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (!instructions && !isEditing) {
      return (
        <div className="py-8 text-center text-gray-400 dark:text-gray-500">
          <p className="text-[11px] italic">No instructions defined</p>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-1 text-[11px] text-blue-500 dark:text-blue-400 hover:underline"
            >
              + Add
            </button>
          )}
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-900 dark:text-white">Editing Instructions</span>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter instructions for AI agents..."
            className="w-full px-3 py-2 text-xs font-mono border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
            style={{ minHeight: '200px' }}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || instructions === node.agent_instructions}
              className="px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1.5 transition-colors font-medium"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // Read-only view
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded relative transition-colors"
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-500 dark:text-green-400" />
                <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg">
                  Copied!
                </span>
              </>
            ) : (
              <Copy className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Edit instructions"
              aria-label="Edit instructions"
            >
              <Edit3 className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>

        <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300 leading-relaxed max-h-[600px] overflow-y-auto">
          {instructions}
        </pre>

        {node.updated_at && (
          <div className="text-[10px] text-gray-400 dark:text-gray-500">
            Last updated: {formatTimeAgo(node.updated_at)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      {renderContent()}
    </div>
  );
};

// Component: Collapsible Section (NEW - for Overview tab)
const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
}> = ({ title, children, defaultExpanded = true, icon }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-1.5 flex items-center justify-between hover:opacity-80 transition-opacity duration-150"
      >
        <div className="flex items-center gap-1.5">
          {icon}
          <h4 className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h4>
        </div>
        {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />}
      </button>
      {isExpanded && (
        <div className="pb-2">
          {children}
        </div>
      )}
    </div>
  );
};

// Inline editable field component
const InlineEditField: React.FC<{
  value: string;
  placeholder?: string;
  onSave: (value: string) => Promise<void>;
  multiline?: boolean;
  className?: string;
  editClassName?: string;
  readClassName?: string;
}> = ({ value, placeholder = 'Click to add...', onSave, multiline = false, className = '', editClassName = '', readClassName = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = editValue.trim();
    if (trimmed === value) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      handleCancel();
    }
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (multiline && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    const sharedClasses = `w-full bg-white dark:bg-gray-800 border border-blue-400 dark:border-blue-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${editClassName}`;
    return (
      <div className={`relative ${className}`}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${sharedClasses} min-h-[60px] resize-y text-xs text-gray-700 dark:text-gray-300`}
            disabled={isSaving}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${sharedClasses} text-sm font-semibold text-gray-900 dark:text-white`}
            disabled={isSaving}
          />
        )}
        {isSaving && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    );
  }

  const hasValue = value && value.trim().length > 0;
  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`group cursor-pointer rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${className} ${readClassName}`}
      title="Click to edit"
    >
      {hasValue ? (
        <div className="flex items-start gap-1">
          <span className="flex-1">{value}</span>
          <Edit3 className="w-3 h-3 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        </div>
      ) : (
        <span className="italic text-gray-400 dark:text-gray-500 flex items-center gap-1">
          {placeholder}
          <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      )}
    </div>
  );
};

// Inline select component for dropdowns (node type, task mode)
const InlineSelect: React.FC<{
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => Promise<void>;
  className?: string;
}> = ({ value, options, onSave, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async (newValue: string) => {
    if (newValue === value) {
      setIsOpen(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(newValue);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
      setIsOpen(false);
    }
  };

  const currentLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium capitalize bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {isSaving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : currentLabel}
        <ChevronDown className="w-2.5 h-2.5" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[100px]">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-1 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  opt.value === value ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main Component
const UnifiedNodeDetails: React.FC<UnifiedNodeDetailsProps> = ({
  node,
  planId,
  currentUser,
  activeUsers = [],
  typingUsers = [],
  onStatusChange,
  onLogAdd,
  onActivityReact,
  onActivityReply,
  onAssignUser,
  onUnassignUser,
  onClose,
  allNodes = [],
  onUpdateNode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'instructions' | 'agent-context' | 'dependencies' | 'knowledge'>('overview');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [assignedUser, setAssignedUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showRedirectInput, setShowRedirectInput] = useState(false);
  const [redirectText, setRedirectText] = useState('');

  // Reset tab and edit mode when node changes
  React.useEffect(() => {
    setActiveTab('overview');
    setIsEditMode(false);
    setShowRedirectInput(false);
    setRedirectText('');
  }, [node.id]);

  // Fetch logs from API
  const { logs, isLoading: logsLoading, addLogEntry, refetch: refetchLogs } = useNodeLogs(node.plan_id || planId, node.id);

  // Refetch logs when node changes or status updates
  React.useEffect(() => {
    if (node.id) {
      refetchLogs();
    }
  }, [node.id, node.status, refetchLogs]);

  // Fetch collaborators for assignment
  const { collaborators } = useCollaborators(planId);

  // Handle agent instructions updates
  const { updateInstructions } = useNodeInstructions(planId, node.id);

  // Fetch and manage node assignments
  const {
    assignments,
    isLoading: assignmentsLoading,
    assignUser: assignUserToNode,
    unassignUser: unassignUserFromNode,
    isAssigning,
    isUnassigning
  } = useNodeAssignments(planId, node.id);

  // Set assigned user from assignments when they load
  React.useEffect(() => {
    if (assignments && assignments.length > 0 && collaborators.length > 0) {
      const assignment = assignments[0];
      const user = collaborators.find(c => {
        const userData = c.user || c;
        return (userData.id || c.id) === assignment.user_id;
      });

      if (user) {
        const userData = user.user || user;
        setAssignedUser({
          id: assignment.user_id,
          name: userData.name,
          email: userData.email
        });
      }
    } else if (assignments && assignments.length === 0) {
      setAssignedUser(null);
    }
  }, [assignments, collaborators]);

  // Calculate progress
  const progress = node.status === 'completed' ? 100 :
                   node.status === 'in_progress' ? 50 : 0;

  // Convert logs to unified activities
  const activities: UnifiedActivity[] = React.useMemo(() => {
    return logs.map(log => ({
      id: log.id,
      nodeId: node.id,
      type: 'log' as const,
      actor: {
        id: log.user?.id || log.user_id,
        name: log.user?.name || 'Unknown User',
        email: log.user?.email,
        avatar: undefined
      },
      timestamp: new Date(log.created_at),
      data: {
        content: log.content,
        logType: log.log_type,
        tags: log.tags
      }
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [logs, node.id]);

  // Filter activities based on current filter
  const filteredActivities = React.useMemo(() => {
    if (activityFilter === 'all') return activities;
    if (activityFilter === 'logs') return activities.filter(a => a.type === 'log');
    return activities;
  }, [activities, activityFilter]);

  // Handle log addition
  const handleLogAdd = (content: string, logType: string, tags?: string[]) => {
    addLogEntry({
      content,
      log_type: logType,
      ...(tags && tags.length > 0 && { tags }),
    });
  };

  // Handle assignment
  const handleAssign = async (userId: string) => {
    try {
      await assignUserToNode(userId);
      const user = collaborators.find(c => {
        const userData = c.user || c;
        return (userData.id || c.id) === userId;
      });

      if (user) {
        const userData = user.user || user;
        setAssignedUser({
          id: userId,
          name: userData.name,
          email: userData.email
        });
      }

      onAssignUser?.(userId);
    } catch (error) {
      console.error('Failed to assign user:', error);
    }
  };

  const handleUnassign = async () => {
    if (assignedUser) {
      try {
        await unassignUserFromNode(assignedUser.id);
        setAssignedUser(null);
        onUnassignUser?.(assignedUser.id);
      } catch (error) {
        console.error('Failed to unassign user:', error);
      }
    }
  };

  // Action handlers
  const handleCopyId = () => {
    navigator.clipboard.writeText(node.id);
    alert('Node ID copied to clipboard');
  };

  const handleFieldUpdate = async (field: string, value: any) => {
    if (!onUpdateNode) return;
    await onUpdateNode(node.id, { [field]: value });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      console.log('Delete node:', node.id);
      // TODO: Implement delete
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 min-w-0 overflow-hidden">
      {/* COMPACT HEADER */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <NodeTypeIcon nodeType={node.node_type} />
            {onUpdateNode && isEditMode ? (
              <InlineEditField
                value={node.title}
                placeholder="Untitled"
                onSave={(val) => handleFieldUpdate('title', val)}
                className="flex-1 min-w-0"
                readClassName="text-sm font-semibold text-gray-900 dark:text-white truncate"
                editClassName=""
              />
            ) : (
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={node.title}>
                {node.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1">
            <StatusBadge status={node.status} onChange={onStatusChange} nodeId={node.id} />
            {node.task_mode && node.task_mode !== 'free' && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                  node.task_mode === 'research'
                    ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400'
                    : node.task_mode === 'plan'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                }`}
                title={`Task mode: ${node.task_mode}`}
              >
                {node.task_mode}
              </span>
            )}
            {onUpdateNode && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-1 rounded-md transition-colors duration-150 ${
                  isEditMode
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
                title={isEditMode ? 'Exit edit mode' : 'Edit mode'}
                aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <ActionsMenu
              onCopyId={handleCopyId}
              onDelete={handleDelete}
            />
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-150 md:hidden"
                title="Close (ESC)"
                aria-label="Close details panel"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* APPROVE/REDIRECT ACTIONS for plan_ready nodes */}
      {node.status === 'plan_ready' && onUpdateNode && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <button
              onClick={() => onStatusChange('not_started')}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRedirectInput(!showRedirectInput)}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Redirect
            </button>
          </div>
          {showRedirectInput && (
            <div className="mt-2 flex gap-2">
              <textarea
                value={redirectText}
                onChange={(e) => setRedirectText(e.target.value)}
                placeholder="Enter new direction for this task..."
                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-y min-h-[60px]"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={async () => {
                    if (redirectText.trim()) {
                      await handleFieldUpdate('agent_instructions', redirectText.trim());
                      onStatusChange('not_started');
                      setRedirectText('');
                      setShowRedirectInput(false);
                    }
                  }}
                  className="px-2 py-1 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowRedirectInput(false); setRedirectText(''); }}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPACT METADATA BAR */}
      <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        {/* Progress Bar */}
        <div className="mb-1.5">
          <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-medium">Progress</span>
            <span className="font-semibold tabular-nums text-gray-600 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Assignment and Due Date */}
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 dark:text-gray-500">Assigned to:</span>
            <UnifiedAssignmentSelector
              assignedUser={assignedUser}
              collaborators={collaborators}
              onAssignUser={handleAssign}
              onUnassignUser={handleUnassign}
              isLoading={assignmentsLoading}
              isUpdating={isAssigning || isUnassigning}
            />
          </div>
          {node.due_date && (
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Due: {formatDate(node.due_date)}</span>
            </div>
          )}
        </div>

      </div>

      {/* TABBED CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Tab Navigation */}
        <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'activity'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Activity</span>
              {activities.length > 0 && (
                <span className="ml-0.5 px-1 py-0 bg-gray-200 dark:bg-gray-700 rounded-full text-[10px] tabular-nums">
                  {activities.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 relative whitespace-nowrap flex-shrink-0 ${
                activeTab === 'instructions'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Instructions</span>
              {node.agent_instructions && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full" />
              )}
            </button>
            {node.node_type === 'task' && (
              <button
                onClick={() => setActiveTab('agent-context')}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'agent-context'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>Agent Context</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'dependencies'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              <span>Dependencies</span>
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'knowledge'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>Knowledge</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-3 flex flex-col min-w-0">
            <div className="flex-1 space-y-2">
              {/* Description */}
              {onUpdateNode && isEditMode ? (
                <InlineEditField
                  value={node.description || ''}
                  placeholder="Add a description..."
                  onSave={(val) => handleFieldUpdate('description', val)}
                  multiline
                  className=""
                  readClassName="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed"
                />
              ) : node.description ? (
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed" style={{ overflowWrap: 'anywhere' }}>
                  {node.description}
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">No description</p>
              )}

              {/* Due date */}
              {onUpdateNode && isEditMode ? (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400 dark:text-gray-500">Due:</span>
                  <input
                    type="date"
                    value={node.due_date ? new Date(node.due_date).toISOString().split('T')[0] : ''}
                    onChange={async (e) => {
                      const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                      await handleFieldUpdate('due_date', val);
                    }}
                    className="bg-transparent border-none text-[11px] text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none"
                  />
                </div>
              ) : node.due_date ? (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {formatDate(node.due_date)}</span>
                </div>
              ) : null}

              {/* Compact metadata row with inline dropdowns */}
              <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 pt-1">
                {onUpdateNode && isEditMode ? (
                  <InlineSelect
                    value={node.node_type}
                    options={[
                      { value: 'phase', label: 'Phase' },
                      { value: 'task', label: 'Task' },
                      { value: 'milestone', label: 'Milestone' },
                    ]}
                    onSave={(val) => handleFieldUpdate('node_type', val)}
                  />
                ) : (
                  <span className="capitalize">{node.node_type}</span>
                )}
                {onUpdateNode && isEditMode && node.node_type === 'task' ? (
                  <InlineSelect
                    value={node.task_mode || 'free'}
                    options={[
                      { value: 'free', label: 'Free' },
                      { value: 'research', label: 'Research' },
                      { value: 'plan', label: 'Plan' },
                      { value: 'implement', label: 'Implement' },
                    ]}
                    onSave={(val) => handleFieldUpdate('task_mode', val)}
                  />
                ) : node.task_mode && node.task_mode !== 'free' ? (
                  <span className="capitalize">{node.task_mode}</span>
                ) : null}
                {node.created_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(node.created_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Ghost-style action buttons at bottom */}
            <div className="flex gap-1.5 pt-3 mt-auto border-t border-gray-100 dark:border-gray-800/60">
              <button
                onClick={() => {
                  setActivityFilter('logs');
                  setActiveTab('activity');
                }}
                className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Add Log
              </button>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2">
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
                </div>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No activity yet</p>
              )}
            </div>
            <LogComposer
              onLogAdd={handleLogAdd}
            />
          </div>
        )}

        {activeTab === 'instructions' && (
          <AgentInstructionsTab
            node={node}
            onUpdate={updateInstructions}
          />
        )}

        {activeTab === 'agent-context' && (
          <div className="flex-1 overflow-y-auto p-3">
            <AgentContextPanel nodeId={node.id} planId={planId} />
          </div>
        )}

        {activeTab === 'dependencies' && (
          <NodeDependenciesTab
            planId={planId}
            nodeId={node.id}
            nodeTitle={node.title}
            allNodes={allNodes}
          />
        )}

        {activeTab === 'knowledge' && (
          <NodeKnowledgeTab
            nodeTitle={node.title}
            planId={planId}
            nodeId={node.id}
          />
        )}

      </div>
    </div>
  );
};

export default UnifiedNodeDetails;
