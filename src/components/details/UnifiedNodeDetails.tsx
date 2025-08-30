import React, { useState, useEffect, useRef } from 'react';
import { 
  User,
  Calendar,
  Tag,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Paperclip,
  Edit3,
  Check,
  X,
  MoreHorizontal,
  Send,
  AtSign,
  Hash,
  FileText,
  Image,
  File,
  Download,
  Maximize2,
  Filter as FilterIcon,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Circle,
  AlertCircle,
  ArrowRight,
  Pin,
  ThumbsUp,
  Smile,
  Activity,
  Brain,
  AlertTriangle,
  Target,
  UserPlus,
  UserCheck,
  Code2,
  Save,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { PlanNode, NodeStatus, User as UserType, Log, Artifact } from '../../types';
import { formatDate } from '../../utils/planUtils';
import { useNodeLogs } from '../../hooks/useNodeLogs';
import { useNodeArtifacts } from '../../hooks/useNodeArtifacts';
import { useCollaborators } from '../../hooks/useCollaborators';
import { useNodeAssignments } from '../../hooks/useNodeAssignments';
import { useNodeInstructions } from '../../hooks/useNodeInstructions';

// Types
interface UnifiedNodeDetailsProps {
  node: PlanNode;
  planId: string;
  currentUser: UserType;
  activeUsers?: UserType[];
  typingUsers?: UserType[];
  onStatusChange: (status: NodeStatus) => void;
  onLogAdd: (content: string, logType: string, tags?: string[]) => void;
  onFileUpload: (files: File[]) => void;
  onActivityReact?: (activityId: string, emoji: string) => void;
  onActivityReply?: (activityId: string, text: string) => void;
  onAssignUser?: (userId: string) => void;
  onUnassignUser?: (userId: string) => void;
}

type ActivityType = 
  | 'log' 
  | 'status_change' 
  | 'assignment'
  | 'file_upload'
  | 'edit'
  | 'dependency_added'
  | 'dependency_removed';

type LogType = 'progress' | 'reasoning' | 'challenge' | 'decision';

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
    progress: { icon: Activity, color: 'text-blue-500' },
    reasoning: { icon: Brain, color: 'text-purple-500' },
    challenge: { icon: AlertTriangle, color: 'text-yellow-500' },
    decision: { icon: Target, color: 'text-green-500' }
  };

  const Icon = config[logType].icon;
  return <Icon className={`w-3.5 h-3.5 ${config[logType].color}`} />;
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
  // This ensures we use fresh data after API updates
  React.useEffect(() => {
    setLocalStatus(null);
    setIsOpen(false);
  }, [nodeId, status]);
  
  // Use local status if set (after user selection), otherwise use prop
  const displayStatus = localStatus || status;
  
  const statusConfig = {
    not_started: { icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100' },
    in_progress: { icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' }
  };

  const Icon = statusConfig[displayStatus].icon;

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[displayStatus].bg} ${statusConfig[displayStatus].color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{displayStatus.replace('_', ' ')}</span>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[displayStatus].bg} ${statusConfig[displayStatus].color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{displayStatus.replace('_', ' ')}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999]">
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
                className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
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
        className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : isUpdating ? (
          <>
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Updating...</span>
          </>
        ) : assignedUser ? (
          <>
            <Avatar user={assignedUser} size="xs" />
            <span>{assignedUser.name || assignedUser.email || 'Assigned'}</span>
          </>
        ) : (
          <>
            <User className="w-3 h-3" />
            <span>Unassigned</span>
          </>
        )}
        {!isLoading && !isUpdating && <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] min-w-[200px] max-h-[300px] overflow-y-auto">
          {assignedUser && (
            <button
              onClick={() => {
                onUnassign();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <X className="w-3 h-3" />
              Unassign
            </button>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-3 py-1.5 text-xs font-medium text-gray-500">Assign to:</div>
            {collaborators.map(collab => {
              const userData = collab.user || collab;
              return (
                <button
                  key={userData.id || collab.id}
                  onClick={() => {
                    onAssign(userData.id || collab.id);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  disabled={assignedUser?.id === (userData.id || collab.id)}
                >
                  <Avatar user={userData} size="xs" />
                  <span>{userData.name || userData.email || 'Unknown'}</span>
                  {assignedUser?.id === (userData.id || collab.id) && (
                    <Check className="w-3 h-3 ml-auto text-green-500" />
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
                <span className="font-medium text-sm">{activity.actor.name}</span>
                <LogTypeIcon logType={activity.data.logType} />
                <span className="text-xs text-gray-500">{activity.data.logType}</span>
                <span className="text-xs text-gray-500 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {activity.data.content}
              </p>
              {activity.data.tags && activity.data.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {activity.data.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <button 
                  onClick={() => onReact?.('👍')}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  React
                </button>
                <button 
                  onClick={() => setShowReply(!showReply)}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
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
              <span className="font-medium">{activity.actor.name}</span>
              <span className="text-gray-500">changed status to</span>
              <StatusBadge status={activity.data.newStatus} />
              <span className="text-xs text-gray-500 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
            </div>
          </div>
        );

      case 'file_upload':
        return (
          <div className="flex gap-3">
            <Avatar user={activity.actor} size="sm" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{activity.actor.name}</span>
                <span className="text-xs text-gray-500">uploaded a file</span>
                <span className="text-xs text-gray-500 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.data.fileName}</div>
                  <div className="text-xs text-gray-500">{activity.data.fileSize}</div>
                </div>
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
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
              <span className="font-medium">{activity.actor.name}</span>
              <span className="text-gray-500">assigned</span>
              <span className="font-medium">{activity.data.assignee.name}</span>
              <span className="text-gray-500">to this task</span>
              <span className="text-xs text-gray-500 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
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
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
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
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
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
  onFileUpload: (files: File[]) => void;
}> = ({ onLogAdd, onFileUpload }) => {
  const [mode, setMode] = useState<'log' | 'file'>('log');
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<LogType>('progress');
  const [tags, setTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="border-t border-gray-200 dark:border-gray-700 p-3">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setMode('log')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            mode === 'log' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 inline mr-1" />
          Add Log
        </button>
        <button
          onClick={() => setMode('file')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            mode === 'file' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Paperclip className="w-3.5 h-3.5 inline mr-1" />
          Attach
        </button>
      </div>

      {mode === 'log' ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value as LogType)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
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
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <textarea
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              placeholder="Write a log entry..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 resize-none"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                onFileUpload(Array.from(e.target.files));
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <Paperclip className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload or drag files here
            </div>
          </button>
        </div>
      )}
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
      // Call the update function and wait for it to complete
      await onUpdate(instructions);
      
      // Only close the editor if the save was successful
      setIsEditing(false);
      
      console.log('Agent instructions saved successfully');
    } catch (error) {
      console.error('Failed to save agent instructions:', error);
      // Keep the editor open so the user doesn't lose their changes
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
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Code2 className="w-12 h-12 mb-3" />
          <p className="text-sm mb-4">No agent instructions defined</p>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
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
              <Code2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Editing Agent Instructions</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className={showPreview ? "grid grid-cols-2 gap-4" : ""}>
            <div>
              <textarea
                ref={textareaRef}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter detailed instructions for AI agents working on this task...\n\nYou can include:\n• Task objectives and goals\n• Step-by-step procedures\n• Code examples and templates (use markdown)\n• Important constraints or requirements\n• Expected outputs and formats\n\nSupports markdown formatting:
**bold**, *italic*, `code`, ```code blocks```"
                className="w-full px-4 py-3 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 resize-none"
                style={{ minHeight: '400px' }}
              />
            </div>
            
            {showPreview && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 overflow-auto">
                <div className="text-xs text-gray-500 mb-2">Preview</div>
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300">
                  {instructions || 'Instructions will appear here...'}
                </pre>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || instructions === node.agent_instructions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
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
            <Code2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Agent Instructions</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded relative"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Copied!
                  </span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            {!readOnly && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Edit instructions"
              >
                <Edit3 className="w-3.5 h-3.5" />
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
          <div className="text-xs text-gray-500 flex items-center gap-4">
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
    <div className="h-full overflow-y-auto p-4">
      {renderContent()}
    </div>
  );
};

// Component: Collapsible Details Section
const DetailsSection: React.FC<{ node: PlanNode }> = ({ node }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    description: true,
    acceptance_criteria: true,
    context: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-sm text-gray-900 dark:text-white">Details</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Description */}
        {node.description && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('description')}
              className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
            >
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</h4>
              {expandedSections.description ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedSections.description && (
              <div className="p-3 bg-white dark:bg-gray-900">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {node.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Acceptance Criteria */}
        {node.acceptance_criteria && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('acceptance_criteria')}
              className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
            >
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Acceptance Criteria</h4>
              {expandedSections.acceptance_criteria ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedSections.acceptance_criteria && (
              <div className="p-3 bg-white dark:bg-gray-900">
                <div className="space-y-1">
                  {node.acceptance_criteria.split('\n').filter(c => c.trim()).map((criterion, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 break-words">{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Context */}
        {node.context && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('context')}
              className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
            >
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Context</h4>
              {expandedSections.context ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expandedSections.context && (
              <div className="p-3 bg-white dark:bg-gray-900">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {node.context}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Component: Active Users Display
const ActiveUsersDisplay: React.FC<{ 
  users: UserType[];
  label?: string;
}> = ({ users, label = "Active" }) => {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map(user => (
          <Avatar key={user.id} user={user} size="xs" />
        ))}
        {users.length > 3 && (
          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
            +{users.length - 3}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500">
        {users.length} {label.toLowerCase()}
      </span>
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
  onFileUpload,
  onActivityReact,
  onActivityReply,
  onAssignUser,
  onUnassignUser
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'logs' | 'files' | 'instructions'>('activity');
  const [filter, setFilter] = useState<'all' | 'logs' | 'files'>('all');
  const [assignedUser, setAssignedUser] = useState<any>(null);
  
  // Reset filter and tab when node changes
  React.useEffect(() => {
    setFilter('all');
    setActiveTab('activity');
  }, [node.id]);
  
  // Fetch logs and artifacts from API
  const { logs, isLoading: logsLoading, addLogEntry, refetch: refetchLogs } = useNodeLogs(node.plan_id || planId, node.id);
  const { artifacts, isLoading: artifactsLoading, refetch: refetchArtifacts } = useNodeArtifacts(node.plan_id || planId, node.id);
  
  // Refetch logs and artifacts when node changes or status updates
  React.useEffect(() => {
    if (node.id) {
      refetchLogs();
      refetchArtifacts();
    }
  }, [node.id, node.status, refetchLogs, refetchArtifacts]);
  
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
      // Get the first assignment (UI currently shows single assignment)
      const assignment = assignments[0];
      
      // Find the user in collaborators
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
      // No assignments, clear the assigned user
      setAssignedUser(null);
    }
  }, [assignments, collaborators]);
  
  // Calculate progress
  const progress = node.status === 'completed' ? 100 : 
                   node.status === 'in_progress' ? 50 : 0;
  
  // Convert logs and artifacts to unified activities
  const activities: UnifiedActivity[] = React.useMemo(() => {
    const logActivities: UnifiedActivity[] = logs.map(log => ({
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
    }));
    
    const artifactActivities: UnifiedActivity[] = artifacts.map(artifact => ({
      id: artifact.id,
      nodeId: node.id,
      type: 'file_upload' as const,
      actor: {
        id: artifact.user?.id || artifact.created_by,
        name: artifact.user?.name || 'Unknown User',
        email: artifact.user?.email,
        avatar: undefined
      },
      timestamp: new Date(artifact.created_at),
      data: {
        fileName: artifact.name,
        fileSize: 'Unknown size', // Would need to add size to artifact data
        fileType: artifact.content_type,
        url: artifact.url
      }
    }));
    
    // Combine and sort by timestamp
    return [...logActivities, ...artifactActivities].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [logs, artifacts, node.id]);
  
  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'logs') return activity.type === 'log';
    if (filter === 'files') return activity.type === 'file_upload';
    return true;
  });

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
      // Call API to assign user
      await assignUserToNode(userId);
      
      // Find user details for immediate UI update
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
      
      // Call optional callback
      onAssignUser?.(userId);
    } catch (error) {
      console.error('Failed to assign user:', error);
      // Could add toast notification here
    }
  };

  const handleUnassign = async () => {
    if (assignedUser) {
      try {
        // Call API to unassign user
        await unassignUserFromNode(assignedUser.id);
        
        // Clear assigned user in UI
        setAssignedUser(null);
        
        // Call optional callback
        onUnassignUser?.(assignedUser.id);
      } catch (error) {
        console.error('Failed to unassign user:', error);
        // Could add toast notification here
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Minimal Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {node.title}
          </h2>
          <StatusBadge status={node.status} onChange={onStatusChange} nodeId={node.id} />
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 overflow-visible relative">
        {/* Assignment with dropdown */}
        <AssignmentSelector
          assignedUser={assignedUser}
          collaborators={collaborators}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
          isLoading={assignmentsLoading}
          isUpdating={isAssigning || isUnassigning}
        />
        
        {node.due_date && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs whitespace-nowrap">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(node.due_date)}</span>
          </div>
        )}
        
        {/* Active users display - Hidden as feature not implemented */}
        {/* {activeUsers.length > 0 && (
          <ActiveUsersDisplay users={activeUsers} label="active" />
        )} */}
      </div>

      {/* Two-Column Layout with better responsive sizing */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Details (Responsive width with proper scrolling) */}
        <div className="w-2/5 min-w-[280px] max-w-[400px] border-r border-gray-200 dark:border-gray-700">
          <DetailsSection node={node} />
        </div>

        {/* Right: Tabbed Content (Flexible width) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Navigation */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                All Activity
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Logs
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'files'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Files
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 relative ${
                  activeTab === 'instructions'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Agent Instructions
                {node.agent_instructions && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'instructions' ? (
            <AgentInstructionsTab 
              node={node} 
              onUpdate={updateInstructions}
            />
          ) : (
            <>
              {/* Activity Feed Content */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Sub-filters for Activity tab */}
                {activeTab === 'activity' && (
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex gap-1">
                      {(['all', 'logs', 'files'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-3 py-1 text-xs rounded-lg capitalize transition-colors ${
                            filter === f 
                              ? 'bg-gray-200 dark:bg-gray-700' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {f === 'all' ? 'All' : f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {logsLoading || artifactsLoading ? (
              <div className="text-center py-8">
                <div className="spinner w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Loading activity...</p>
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
              <div className="text-center py-8 text-gray-500 text-sm">
                No activity yet. Add your first log entry!
              </div>
            )}
                </div>

                {/* Log Composer */}
                <LogComposer
                  onLogAdd={handleLogAdd}
                  onFileUpload={onFileUpload}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedNodeDetails;
