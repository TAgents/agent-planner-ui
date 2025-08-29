import React from 'react';
import { Clock, User, MessageSquare, FileText, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import useActivityTimeline from '../../hooks/useActivityTimeline';

interface ActivityTimelineProps {
  planId: string;
  className?: string;
  maxItems?: number;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  planId, 
  className = '',
  maxItems = 10 
}) => {
  const { data: timeline, isLoading, error } = useActivityTimeline(planId);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'node_created':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'node_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'node_blocked':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'file_uploaded':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'user_assigned':
        return <User className="w-4 h-4 text-indigo-500" />;
      case 'plan_updated':
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-500">Loading activity...</h3>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mt-1" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !timeline || timeline.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Recent Activity</h3>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No recent activity to display
        </p>
      </div>
    );
  }

  const displayedItems = timeline.slice(0, maxItems);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {displayedItems.map((event, index) => (
          <div key={event.id} className="flex items-start space-x-3 group">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(event.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {event.description}
                  </p>
                  
                  {event.user && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      by {event.user.name}
                    </p>
                  )}
                </div>
                
                <time className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                  {formatTimeAgo(event.created_at)}
                </time>
              </div>
              
              {/* Show metadata if available */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                  {JSON.stringify(event.metadata, null, 2)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {timeline.length > maxItems && (
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {maxItems} of {timeline.length} activities
            </p>
          </div>
        )}
      </div>
      
      {displayedItems.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No recent activity
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;