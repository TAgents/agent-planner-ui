import React, { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Bot, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePendingNotifications, useNotificationEvents, NotificationItem } from '../../hooks/useNotifications';
import { formatDistanceToNow } from '../../utils/dateUtils';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { data: notifications, isLoading } = usePendingNotifications();
  
  // Subscribe to WebSocket events for real-time updates
  useNotificationEvents();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    setIsOpen(false);
    // Navigate to the plan
    navigate(`/app/plans/${item.plan_id}`);
  };

  const totalCount = notifications?.totalCount || 0;
  const hasUrgent = notifications?.hasUrgent || false;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Notifications${totalCount > 0 ? `, ${totalCount} pending` : ''}`}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        
        {/* Badge */}
        {totalCount > 0 && (
          <span 
            className={`
              absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] 
              flex items-center justify-center 
              text-xs font-bold text-white rounded-full px-1
              ${hasUrgent ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}
            `}
          >
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
        
        {/* Urgent indicator dot */}
        {hasUrgent && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute left-0 bottom-full mb-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          role="menu"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {totalCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {totalCount} pending item{totalCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
              </div>
            ) : totalCount === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No pending notifications
                </p>
              </div>
            ) : (
              <>
                {/* Decisions Section */}
                {notifications?.decisions && notifications.decisions.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Decisions ({notifications.decisions.length})
                      </div>
                    </div>
                    {notifications.decisions.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        icon={<HelpCircle className="w-4 h-4" />}
                        onClick={() => handleNotificationClick(item)}
                      />
                    ))}
                  </div>
                )}

                {/* Agent Requests Section */}
                {notifications?.agentRequests && notifications.agentRequests.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        <Bot className="w-3.5 h-3.5" />
                        Agent Requests ({notifications.agentRequests.length})
                      </div>
                    </div>
                    {notifications.agentRequests.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        icon={<Bot className="w-4 h-4" />}
                        onClick={() => handleNotificationClick(item)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual notification row component
const NotificationRow: React.FC<{
  item: NotificationItem;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ item, icon, onClick }) => {
  const isBlocking = item.urgency === 'blocking';

  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={`
        w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 
        flex items-start gap-3 transition-colors
        ${isBlocking ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
      `}
    >
      {/* Icon */}
      <div className={`
        p-1.5 rounded-lg flex-shrink-0 mt-0.5
        ${isBlocking 
          ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }
      `}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
            {item.title}
          </p>
          {isBlocking && (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {item.plan_title}
        </p>
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(item.created_at)}</span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
    </button>
  );
};

export default NotificationBell;
