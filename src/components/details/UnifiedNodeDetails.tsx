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
  Archive
} from 'lucide-react';
import { PlanNode, NodeStatus, User as UserType } from '../../types';
import { formatDate } from '../../utils/planUtils';
import { useNodeLogs } from '../../hooks/useNodeLogs';
import { useCollaborators } from '../../hooks/useCollaborators';
import { useNodeAssignments } from '../../hooks/useNodeAssignments';
import { useNodeInstructions } from '../../hooks/useNodeInstructions';
import { AskAgentButton } from '../agent-request';

// Types
interface UnifiedNodeDetailsProps {
  node: PlanNode;
  planId: string;
  currentUser: UserType;
  activeUsers?: UserType[];
  typingUsers?: UserType[];
  onStatusChange: (status: NodeStatus) => void;
  onLogAdd: (content: string, logType: string, tags?: string[]) => void;
  onActivityReact?: (activityId: string, emoji: string) => void;
  onActivityReply?: (activityId: string, text: string) => void;
  onAssignUser?: (userId: string) => void;
  onUnassignUser?: (userId: string) => void;
  onClose?: () => void;
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
    blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-200' }
  };

  const Icon = statusConfig[displayStatus].icon;

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[displayStatus].bg} ${statusConfig[displayStatus].text}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{displayStatus.replace('_', ' ')}</span>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[displayStatus].bg} ${statusConfig[displayStatus].text} hover:opacity-90 transition-all duration-200`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{displayStatus.replace('_', ' ')}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] min-w-[160px]">
          {(['not_started', 'in_progress', 'completed', 'blocked'] as NodeStatus[]).map(s => {
            const SIcon = statusConfig[s].icon;
            return (
              <button
                key={s}
                onClick={() => {
                  setLocalStatus(s);
                  onChange(s);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
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
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
        title="More actions"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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

// Component: Assignment Selector
const AssignmentSelector: React.FC<{
  assignedUser?: { id: string; name?: string; email?: string };
  collaborators: any[];
  onAssign: (userId: string) => void;
  onUnassign: () => void;
  isLoading?: boolean;
  isUpdating?: boolean;
}> = ({ assignedUser, collaborators, onAssign, onUnassign, isLoading = false, isUpdating = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] min-w-[200px] max-h-[300px] overflow-y-auto">
          {assignedUser && (
            <button
              onClick={() => {
                onUnassign();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300"
            >
              <X className="w-3 h-3" />
              Unassign
            </button>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Assign to:</div>
            {collaborators.map(collab => {
              const userData = collab.user || collab;
              return (
                <button
                  key={userData.id || collab.id}
                  onClick={() => {
                    onAssign(userData.id || collab.id);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  disabled={assignedUser?.id === (userData.id || collab.id)}
                >
                  <Avatar user={userData} size="xs" />
                  <span>{userData.name || userData.email || 'Unknown'}</span>
                  {assignedUser?.id === (userData.id || collab.id) && (
                    <Check className="w-3 h-3 ml-auto text-green-500 dark:text-green-400" />
                  )}
                </button>
              );
            })}
          </div>
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
          <div className="flex gap-3">
            <Avatar user={activity.actor} size="sm" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900 dark:text-white">{activity.actor.name}</span>
                <LogTypeIcon logType={activity.data.logType} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.data.logType}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {activity.data.content}
              </p>
              {activity.data.tags && activity.data.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {activity.data.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => onReact?.('👍')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  React
                </button>
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Reply
                </button>
              </div>
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
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    if (logContent.trim()) {
      // Parse tags
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      onLogAdd(logContent, logType, tagList);
      setLogContent('');
      setTags('');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value as LogType)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200 min-h-[44px]"
          >
            <option value="progress">Progress</option>
            <option value="reasoning">Reasoning</option>
            <option value="challenge">Challenge</option>
            <option value="decision">Decision</option>
          </select>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200 min-h-[44px]"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            placeholder="Write a log entry... (Ctrl+Enter to submit)"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-colors duration-200"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!logContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium min-h-[44px] flex items-center justify-center"
            aria-label="Send log entry"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
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
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
          <Code2 className="w-12 h-12 mb-3" />
          <p className="text-sm mb-4">No agent instructions defined</p>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors duration-200 font-medium"
            >
              Add Instructions
            </button>
          )}
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Editing Agent Instructions</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors hidden lg:block"
                title={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className={showPreview ? "grid lg:grid-cols-2 gap-4" : ""}>
            <div>
              <textarea
                ref={textareaRef}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter detailed instructions for AI agents working on this task...\n\nYou can include:\n• Task objectives and goals\n• Step-by-step procedures\n• Code examples and templates (use markdown)\n• Important constraints or requirements\n• Expected outputs and formats\n\nSupports markdown formatting: **bold**, *italic*, `code`, ```code blocks```"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                style={{ minHeight: '400px' }}
              />
            </div>

            {showPreview && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 overflow-auto hidden lg:block">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview</div>
                <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300">
                  {instructions || 'Instructions will appear here...'}
                </pre>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || instructions === node.agent_instructions}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 transition-colors duration-200 font-medium min-h-[44px]"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Agent Instructions</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors duration-200"
              title="Copy to clipboard"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                    Copied!
                  </span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            {!readOnly && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                title="Edit instructions"
                aria-label="Edit instructions"
              >
                <Edit3 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 max-h-[600px] overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300 leading-relaxed">
            {instructions}
          </pre>
        </div>

        {/* Metadata about instructions */}
        {node.agent_instructions && (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
            <span>
              {instructions.length} characters
            </span>
            <span>
              {instructions.split('\n').length} lines
            </span>
            {node.updated_at && (
              <span>
                Last updated: {formatTimeAgo(node.updated_at)}
              </span>
            )}
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 sm:px-4 py-2.5 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{title}</h4>
        </div>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
      </button>
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-white dark:bg-gray-900">
          {children}
        </div>
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
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'instructions'>('overview');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [assignedUser, setAssignedUser] = useState<any>(null);

  // Reset tab when node changes
  React.useEffect(() => {
    setActiveTab('overview');
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
      tags,
      metadata: {}
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

  // Action handlers (placeholders for future implementation)
  const handleCopyId = () => {
    navigator.clipboard.writeText(node.id);
    alert('Node ID copied to clipboard');
  };

  const handleEdit = () => {
    // Create a simple inline edit experience
    const newTitle = prompt('Edit node title:', node.title);
    if (newTitle && newTitle !== node.title) {
      // TODO: Call API to update node title
      console.log('Update title to:', newTitle);
      alert('Edit functionality is not fully implemented yet. This would update the node title to: ' + newTitle);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      console.log('Delete node:', node.id);
      // TODO: Implement delete
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* SIMPLIFIED HEADER */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <NodeTypeIcon nodeType={node.node_type} />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate" title={node.title}>
              {node.title}
            </h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <StatusBadge status={node.status} onChange={onStatusChange} nodeId={node.id} />
            {node.node_type === 'task' && (
              <AskAgentButton
                planId={planId}
                taskId={node.id}
                taskTitle={node.title}
                compact
              />
            )}
            <ActionsMenu
              onEdit={handleEdit}
              onCopyId={handleCopyId}
              onDelete={handleDelete}
            />
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 md:hidden"
                title="Close (ESC)"
                aria-label="Close details panel"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COMPACT METADATA BAR */}
      <div className="px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="font-medium">Progress</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Assignment and Due Date */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Assigned to:</span>
            <AssignmentSelector
              assignedUser={assignedUser}
              collaborators={collaborators}
              onAssign={handleAssign}
              onUnassign={handleUnassign}
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
        <div className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'activity'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Activity</span>
              {activities.length > 0 && (
                <span className="ml-0.5 sm:ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                  {activities.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 relative whitespace-nowrap flex-shrink-0 ${
                activeTab === 'instructions'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Instructions</span>
              {node.agent_instructions && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {/* Description */}
            {node.description && (
              <CollapsibleSection title="DESCRIPTION" defaultExpanded={true}>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {node.description}
                </p>
              </CollapsibleSection>
            )}

            {/* Context */}
            {node.context && (
              <CollapsibleSection title="CONTEXT" defaultExpanded={false}>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {node.context}
                </p>
              </CollapsibleSection>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  setActivityFilter('logs');
                  setActiveTab('activity');
                }}
                className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium min-h-[44px]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Add Log
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200 flex items-center justify-center gap-2 font-medium min-h-[44px]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Details</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {/* Activity List */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-4">
              {logsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-3 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Loading activity...</p>
                </div>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map(activity => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onReact={(emoji) => onActivityReact?.(activity.id, emoji)}
                    onReply={(text) => onActivityReply?.(activity.id, text)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No logs yet. Add your first log entry!
                </div>
              )}
            </div>

            {/* Log Composer */}
            <div className="flex-shrink-0">
              <LogComposer
                onLogAdd={handleLogAdd}
              />
            </div>
          </div>
        )}

        {activeTab === 'instructions' && (
          <AgentInstructionsTab
            node={node}
            onUpdate={updateInstructions}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedNodeDetails;
