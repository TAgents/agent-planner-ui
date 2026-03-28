import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  ChevronRight,
  ChevronDown,
  Edit3,
  Check,
  X,
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
  PlayCircle,
  Circle,
  Activity,
  Brain,
  AlertTriangle,
  Target,
  Layers,
  Square,
  Trash2,
  Copy as CopyIcon,
  Move,
  Archive,
  Loader2,
} from 'lucide-react';
import { NodeStatus, NodeType, TaskMode } from '../../types';

// Types (locally defined, originally inline in UnifiedNodeDetails)
export type ActivityType =
  | 'log'
  | 'status_change'
  | 'assignment'
  | 'edit'
  | 'dependency_added'
  | 'dependency_removed';

export type LogType = 'progress' | 'reasoning' | 'challenge' | 'decision';

export type ActivityFilter = 'all' | 'logs';

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
  data: any; // Polymorphic based on type
  metadata?: {
    isEdited?: boolean;
    editedAt?: Date;
    reactions?: Map<string, string[]>;
    thread?: UnifiedActivity[];
  };
}

// Utility: Time formatting
export const formatTimeAgo = (date: Date | string): string => {
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
export const LogTypeIcon: React.FC<{ logType: LogType }> = ({ logType }) => {
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
export const NodeTypeIcon: React.FC<{ nodeType: string }> = ({ nodeType }) => {
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
export const StatusBadge: React.FC<{ status: NodeStatus; onChange?: (status: NodeStatus) => void; nodeId?: string }> = ({
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

// Component: Task Mode Badge (clickable dropdown for task nodes)
export const taskModeConfig = {
  free: { label: 'Free', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
  research: { label: 'Research', bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400' },
  plan: { label: 'Plan', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  implement: { label: 'Implement', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
};

export const TaskModeBadge: React.FC<{
  mode: TaskMode | undefined;
  onChange?: (mode: TaskMode) => void;
  nodeId?: string;
}> = ({ mode, onChange, nodeId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localMode, setLocalMode] = useState<TaskMode | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Reset when node or mode prop changes
  React.useEffect(() => {
    setLocalMode(null);
    setIsOpen(false);
  }, [nodeId, mode]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const displayMode = localMode || mode || 'free';
  const cfg = taskModeConfig[displayMode] || taskModeConfig.free;

  if (!onChange) {
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.text} hover:opacity-90 transition-all duration-200`}
        title={`Task mode: ${displayMode}`}
      >
        {cfg.label}
        <ChevronDown className="w-2.5 h-2.5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] min-w-[130px]">
          {(['free', 'research', 'plan', 'implement'] as TaskMode[]).map(m => {
            const mCfg = taskModeConfig[m];
            return (
              <button
                key={m}
                onClick={() => {
                  setLocalMode(m);
                  onChange(m);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200 ${
                  m === displayMode ? 'font-semibold' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${mCfg.bg} border ${mCfg.text}`} />
                <span>{mCfg.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Component: User Avatar with real initials
export const Avatar: React.FC<{
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
export const ActionsMenu: React.FC<{
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
export const UnifiedAssignmentSelector: React.FC<{
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

          {/* People section */}
          <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span>{'\u{1F464}'}</span> People
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

// Component: Collapsible Section (NEW - for Overview tab)
export const CollapsibleSection: React.FC<{
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
export const InlineEditField: React.FC<{
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
export const InlineSelect: React.FC<{
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
