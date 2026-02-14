import React, { useState } from 'react';
import { X, Settings, Webhook, Bell, Sliders } from 'lucide-react';
import { WebhookSettings } from '../agent-request';

interface PlanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planTitle: string;
  planStatus?: string;
  onUpdateStatus?: (status: string) => void;
}

type SettingsTab = 'general' | 'webhook' | 'notifications';

export const PlanSettingsModal: React.FC<PlanSettingsModalProps> = ({
  isOpen,
  onClose,
  planId,
  planTitle,
  planStatus,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  if (!isOpen) return null;

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Sliders },
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
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Status
                </label>
                <select
                  value={planStatus || 'draft'}
                  onChange={(e) => onUpdateStatus?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Controls the current lifecycle stage of this plan.
                </p>
              </div>
            </div>
          )}

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
