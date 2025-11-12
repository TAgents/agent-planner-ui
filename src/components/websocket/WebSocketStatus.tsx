/**
 * WebSocketStatus Component
 *
 * A simple component to display WebSocket connection status.
 * Can be used for debugging or as a user-facing connection indicator.
 */

import React from 'react';
import { useWebSocketStatus } from '../../hooks/useWebSocket';
import { ConnectionStatus } from '../../types/websocket';

interface WebSocketStatusProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * Visual indicator for WebSocket connection status
 */
const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  showDetails = false,
  className = ''
}) => {
  const { status, isConnected } = useWebSocketStatus();

  // Status colors
  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'bg-green-500';
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return 'bg-yellow-500';
      case ConnectionStatus.ERROR:
        return 'bg-red-500';
      case ConnectionStatus.DISCONNECTED:
      default:
        return 'bg-gray-500';
    }
  };

  // Status text
  const getStatusText = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'Connected';
      case ConnectionStatus.CONNECTING:
        return 'Connecting...';
      case ConnectionStatus.RECONNECTING:
        return 'Reconnecting...';
      case ConnectionStatus.ERROR:
        return 'Connection Error';
      case ConnectionStatus.DISCONNECTED:
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status indicator dot */}
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        {isConnected && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${getStatusColor()} animate-ping opacity-75`} />
        )}
      </div>

      {/* Status text (optional) */}
      {showDetails && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default WebSocketStatus;
