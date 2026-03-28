/**
 * NodeDetailsLogs — Activity/Logs tab extracted from UnifiedNodeDetails.
 *
 * Displays activity feed (logs, status changes, assignments) with a log composer at bottom.
 */
import React, { useState } from 'react';
import {
  User,
  Activity,
  Send,
  Tag,
} from 'lucide-react';
import { NodeStatus } from '../../types';

// ── Types ──────────────────────────────────────────────────

type ActivityType =
  | 'log'
  | 'status_change'
  | 'assignment'
  | 'edit'
  | 'dependency_added'
  | 'dependency_removed';

type LogType = 'progress' | 'reasoning' | 'challenge' | 'decision';

export interface UnifiedActivity {
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
  data: any;
  metadata?: {
    isEdited?: boolean;
    editedAt?: Date;
    reactions?: Map<string, string[]>;
    thread?: UnifiedActivity[];
  };
}

export interface NodeDetailsLogsProps {
  activities: UnifiedActivity[];
  isLoading: boolean;
  onLogAdd: (content: string, logType: string, tags?: string[]) => void;
}

// ── Helpers ────────────────────────────────────────────────

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

// ── LogTypeIcon ────────────────────────────────────────────

const LogTypeIcon: React.FC<{ logType: LogType }> = ({ logType }) => {
  const config = {
    progress: { icon: Activity, color: 'text-blue-500 dark:text-blue-400' },
    reasoning: { icon: Activity, color: 'text-purple-500 dark:text-purple-400' },
    challenge: { icon: Activity, color: 'text-amber-500 dark:text-amber-400' },
    decision: { icon: Activity, color: 'text-emerald-500 dark:text-emerald-400' },
  };
  const { icon: Icon, color } = config[logType] || config.progress;
  return <Icon className={`w-3 h-3 ${color}`} />;
};

// ── Avatar ─────────────────────────────────────────────────

const Avatar: React.FC<{ user: { name?: string; email?: string; avatar?: string }; size?: 'xs' | 'sm' }> = ({ user, size = 'xs' }) => {
  const sizeClasses = { xs: 'w-5 h-5 text-[9px]', sm: 'w-6 h-6 text-[10px]' };
  const initials = (user.name || user.email || '?').charAt(0).toUpperCase();
  const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-rose-400 to-rose-600'];
  const colorIndex = (user.name || user.email || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  if (user.avatar) {
    return <img src={user.avatar} alt={user.name || ''} className={`${sizeClasses[size]} rounded-full object-cover`} />;
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
};

// ── StatusBadge (read-only, for activity display) ──────────

const StatusBadge: React.FC<{ status: NodeStatus }> = ({ status }) => {
  const config: Record<string, { label: string; color: string }> = {
    not_started: { label: 'Not Started', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    completed: { label: 'Completed', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
    blocked: { label: 'Blocked', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    plan_ready: { label: 'Plan Ready', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  };
  const { label, color } = config[status] || config.not_started;
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${color}`}>{label}</span>;
};

// ── ActivityItem ───────────────────────────────────────────

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

// ── LogComposer ────────────────────────────────────────────

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

// ── Main Component ─────────────────────────────────────────

const NodeDetailsLogs: React.FC<NodeDetailsLogsProps> = ({ activities, isLoading, onLogAdd }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
          </div>
        ) : activities.length > 0 ? (
          activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No activity yet</p>
        )}
      </div>
      <LogComposer onLogAdd={onLogAdd} />
    </div>
  );
};

export default NodeDetailsLogs;
