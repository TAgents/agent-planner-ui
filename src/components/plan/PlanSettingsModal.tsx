import React, { useState } from 'react';
import { X, Settings, Webhook, Bell } from 'lucide-react';
import { WebhookSettings } from '../agent-request';

interface PlanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planTitle: string;
}

type SettingsTab = 'webhook' | 'notifications';

export const PlanSettingsModal: React.FC<PlanSettingsModalProps> = ({
  isOpen,
  onClose,
  planId,
  planTitle,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('webhook');

  if (!isOpen) return null;

  const tabs = [
    { id: 'webhook' as const, label: 'Agent Webhook', icon: Webhook },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, disabled: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Plan Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {planTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.disabled && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'webhook' && (
            <WebhookSettings planId={planId} />
          )}

          {activeTab === 'notifications' && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Notification settings coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanSettingsModal;
