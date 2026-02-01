import React from 'react';
import {
  GitPullRequest,
  GitCommit,
  CircleDot,
  Link as LinkIcon,
  FileText,
  Paperclip,
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';

export type ReferenceType = 
  | 'github_pr' 
  | 'github_issue' 
  | 'github_commit' 
  | 'url' 
  | 'document' 
  | 'jira' 
  | 'linear' 
  | 'other';

export type ReferenceStatus = 
  | 'open' 
  | 'closed' 
  | 'merged' 
  | 'draft' 
  | 'in_review' 
  | null;

export interface ReferenceCardProps {
  id: string;
  title: string;
  url: string;
  refType: ReferenceType;
  status?: ReferenceStatus;
  externalId?: string;
  addedAt?: string;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

const getReferenceIcon = (refType: ReferenceType) => {
  switch (refType) {
    case 'github_pr':
      return <GitPullRequest className="w-4 h-4" />;
    case 'github_issue':
      return <CircleDot className="w-4 h-4" />;
    case 'github_commit':
      return <GitCommit className="w-4 h-4" />;
    case 'document':
      return <FileText className="w-4 h-4" />;
    case 'url':
      return <LinkIcon className="w-4 h-4" />;
    case 'jira':
    case 'linear':
      return <FileText className="w-4 h-4" />;
    default:
      return <Paperclip className="w-4 h-4" />;
  }
};

const getReferenceColor = (refType: ReferenceType) => {
  switch (refType) {
    case 'github_pr':
      return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
    case 'github_issue':
      return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    case 'github_commit':
      return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    case 'document':
      return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
    case 'url':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    case 'jira':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    case 'linear':
      return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  }
};

const getStatusBadge = (status: ReferenceStatus) => {
  if (!status) return null;
  
  const statusConfig = {
    open: { icon: Clock, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', label: 'Open' },
    closed: { icon: XCircle, color: 'text-red-500 bg-red-50 dark:bg-red-900/20', label: 'Closed' },
    merged: { icon: CheckCircle, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', label: 'Merged' },
    draft: { icon: Eye, color: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20', label: 'Draft' },
    in_review: { icon: Clock, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', label: 'In Review' },
  };
  
  const config = statusConfig[status];
  if (!config) return null;
  
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  id,
  title,
  url,
  refType,
  status,
  externalId,
  addedAt,
  onDelete,
  readOnly = false
}) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50
                 cursor-pointer transition-all duration-150"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-2 rounded-lg ${getReferenceColor(refType)}`}>
        {getReferenceIcon(refType)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {title}
          </h4>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {externalId || getDomainFromUrl(url)}
          </span>
          {status && getStatusBadge(status)}
        </div>
      </div>
      
      {/* Delete button */}
      {!readOnly && onDelete && (
        <button
          onClick={handleDelete}
          className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-500 
                     hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 
                     transition-all duration-150"
          title="Remove reference"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ReferenceCard;
