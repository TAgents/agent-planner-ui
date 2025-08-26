import React, { useState, useEffect, useRef } from 'react';
import { 
  User,
  Calendar,
  Tag,
  Eye,
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
  Smile
} from 'lucide-react';
import { PlanNode, NodeStatus, User as UserType } from '../../types';
import { formatDate } from '../../utils/planUtils';

// Types
interface UnifiedNodeDetailsProps {
  node: PlanNode;
  activities: UnifiedActivity[];
  currentUser: UserType;
  activeUsers?: UserType[];
  typingUsers?: UserType[];
  onStatusChange: (status: NodeStatus) => void;
  onCommentAdd: (text: string, mentions?: string[]) => void;
  onFileUpload: (files: File[]) => void;
  onActivityReact?: (activityId: string, emoji: string) => void;
  onActivityReply?: (activityId: string, text: string) => void;
  onAssignUser?: (userId: string) => void;
}

type ActivityType = 
  | 'comment' 
  | 'status_change' 
  | 'assignment'
  | 'file_upload'
  | 'edit'
  | 'dependency_added'
  | 'dependency_removed';

interface UnifiedActivity {
  id: string;
  nodeId: string;
  type: ActivityType;
  actor: {
    id: string;
    name: string;
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
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

// Component: Status Badge
const StatusBadge: React.FC<{ status: NodeStatus; onChange?: (status: NodeStatus) => void }> = ({ 
  status, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const statusConfig = {
    not_started: { icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100' },
    in_progress: { icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    blocked: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' }
  };

  const Icon = statusConfig[status].icon;

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[status].bg} ${statusConfig[status].color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[status].bg} ${statusConfig[status].color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{status.replace('_', ' ')}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {(['not_started', 'in_progress', 'completed', 'blocked'] as NodeStatus[]).map(s => {
            const SIcon = statusConfig[s].icon;
            return (
              <button
                key={s}
                onClick={() => {
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

// Component: User Avatar
const Avatar: React.FC<{ user: { name: string; avatar?: string }; size?: 'xs' | 'sm' | 'md' }> = ({ 
  user, 
  size = 'sm' 
}) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm'
  };

  if (user.avatar) {
    return <img src={user.avatar} alt={user.name} className={`${sizeClasses[size]} rounded-full`} />;
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium`}>
      {user.name.charAt(0).toUpperCase()}
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
      case 'comment':
        return (
          <div className="flex gap-3">
            <Avatar user={activity.actor} />
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{activity.actor.name}</span>
                  <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {activity.data.text}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1 ml-1">
                <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  React
                </button>
                <button 
                  onClick={() => setShowReply(!showReply)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
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
              <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 flex items-center gap-2 text-sm">
              <span className="font-medium">{activity.actor.name}</span>
              <span className="text-gray-500">changed status from</span>
              <StatusBadge status={activity.data.fromStatus} />
              <span className="text-gray-500">to</span>
              <StatusBadge status={activity.data.toStatus} />
              <span className="text-xs text-gray-500 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
            </div>
          </div>
        );

      case 'file_upload':
        return (
          <div className="flex gap-3">
            <Avatar user={activity.actor} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{activity.actor.name}</span>
                <span className="text-sm text-gray-500">uploaded a file</span>
                <span className="text-xs text-gray-500 ml-auto">{formatTimeAgo(activity.timestamp)}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                <FileText className="w-8 h-8 text-gray-400" />
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

// Component: Activity Composer
const ActivityComposer: React.FC<{
  onComment: (text: string, mentions?: string[]) => void;
  onFileUpload: (files: File[]) => void;
}> = ({ onComment, onFileUpload }) => {
  const [mode, setMode] = useState<'comment' | 'file'>('comment');
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (commentText.trim()) {
      // Extract mentions
      const mentions = commentText.match(/@\w+/g)?.map(m => m.slice(1)) || [];
      onComment(commentText, mentions);
      setCommentText('');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setMode('comment')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            mode === 'comment' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
          Comment
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

      {mode === 'comment' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment... Use @ to mention"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!commentText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
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

// Main Component
const UnifiedNodeDetails: React.FC<UnifiedNodeDetailsProps> = ({
  node,
  activities,
  currentUser,
  activeUsers = [],
  typingUsers = [],
  onStatusChange,
  onCommentAdd,
  onFileUpload,
  onActivityReact,
  onActivityReply,
  onAssignUser
}) => {
  const [filter, setFilter] = useState<'all' | 'comments' | 'changes' | 'files'>('all');
  
  // Calculate progress
  const progress = node.status === 'completed' ? 100 : 
                   node.status === 'in_progress' ? 50 : 0;
  
  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'comments') return activity.type === 'comment';
    if (filter === 'changes') return ['status_change', 'assignment', 'edit'].includes(activity.type);
    if (filter === 'files') return activity.type === 'file_upload';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Minimal Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {node.title}
          </h2>
          <StatusBadge status={node.status} onChange={onStatusChange} />
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
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 overflow-x-auto">
        {/* Assignee placeholder - would come from collaboration data */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs whitespace-nowrap">
          <User className="w-3 h-3" />
          <span>Unassigned</span>
        </div>
        
        {node.due_date && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs whitespace-nowrap">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(node.due_date)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs whitespace-nowrap">
          <Eye className="w-3 h-3" />
          <span>{activeUsers.length} viewing</span>
        </div>
      </div>

      {/* Two-Column Layout with better responsive sizing */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Details (Responsive width with proper scrolling) */}
        <div className="w-2/5 min-w-[280px] max-w-[400px] border-r border-gray-200 dark:border-gray-700">
          <DetailsSection node={node} />
        </div>

        {/* Right: Activity Feed (Flexible width) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Activity Filters */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex gap-1">
              {(['all', 'comments', 'changes', 'files'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs rounded-lg capitalize transition-colors ${
                    filter === f 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {f === 'all' ? 'All Activity' : f}
                </button>
              ))}
            </div>
            
            {/* Active/Typing Users */}
            {(activeUsers.length > 0 || typingUsers.length > 0) && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {typingUsers.length > 0 && (
                  <span className="italic">{typingUsers[0].name} is typing...</span>
                )}
                {activeUsers.length > 0 && (
                  <div className="flex -space-x-2">
                    {activeUsers.slice(0, 3).map(user => (
                      <Avatar key={user.id} user={user} size="xs" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {filteredActivities.length > 0 ? (
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
                No activity yet. Start the conversation!
              </div>
            )}
          </div>

          {/* Activity Composer */}
          <ActivityComposer
            onComment={onCommentAdd}
            onFileUpload={onFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedNodeDetails;
