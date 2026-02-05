import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Save, 
  TestTube, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { useWebhookConfig, useUpdateWebhookConfig, useTestWebhook } from '../../hooks/useAgentRequests';

interface WebhookSettingsProps {
  planId: string;
}

const availableEvents = [
  { id: 'task.created', label: 'Task Created', description: 'When a new task is added to the plan' },
  { id: 'task.updated', label: 'Task Updated', description: 'When a task status or details change' },
  { id: 'task.completed', label: 'Task Completed', description: 'When a task is marked complete' },
  { id: 'decision.requested', label: 'Decision Requested', description: 'When an agent requests a decision' },
  { id: 'decision.resolved', label: 'Decision Resolved', description: 'When a decision is resolved' },
  { id: 'agent.requested', label: 'Agent Requested', description: 'When human clicks Ask Agent' },
];

export const WebhookSettings: React.FC<WebhookSettingsProps> = ({ planId }) => {
  const { data: config, isLoading } = useWebhookConfig(planId);
  const updateConfig = useUpdateWebhookConfig(planId);
  const testWebhook = useTestWebhook(planId);

  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Initialize form from config
  useEffect(() => {
    if (config) {
      setUrl(config.url || '');
      setSecret(config.secret || '');
      setEvents(config.events || []);
      setEnabled(config.enabled || false);
      setHasChanges(false);
    }
  }, [config]);

  // Track changes
  useEffect(() => {
    if (config) {
      const changed = 
        url !== (config.url || '') ||
        secret !== (config.secret || '') ||
        enabled !== config.enabled ||
        JSON.stringify(events.sort()) !== JSON.stringify((config.events || []).sort());
      setHasChanges(changed);
    }
  }, [url, secret, events, enabled, config]);

  const handleEventToggle = (eventId: string) => {
    setEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        url: url || undefined,
        secret: secret || undefined,
        events,
        enabled,
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save webhook config:', error);
    }
  };

  const handleTest = async () => {
    setTestResult(null);
    try {
      const result = await testWebhook.mutateAsync();
      setTestResult({
        success: result.success,
        message: result.success 
          ? `Connection successful (Status: ${result.status || 200})`
          : result.error || 'Connection failed',
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Test request failed',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
          <Webhook className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            OpenClaw Webhook
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure webhook integration for agent notifications
          </p>
        </div>
      </div>

      {/* Info box */}
      <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium">Connect to OpenClaw</p>
          <p className="mt-1">
            Enter your OpenClaw gateway webhook URL to enable agent notifications. 
            Your agent will receive events when tasks change or when you click "Ask Agent".
          </p>
        </div>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Enable Webhook</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send events to configured webhook URL
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Webhook URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://gateway.openclaw.ai/webhook/your-token"
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Secret */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Secret (optional)
        </label>
        <div className="relative">
          <input
            type={showSecret ? 'text' : 'password'}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="For signature verification"
            className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Events */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Events to Send
        </label>
        <div className="space-y-2">
          {availableEvents.map((event) => (
            <label
              key={event.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={events.includes(event.id)}
                onChange={() => handleEventToggle(event.id)}
                className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {event.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {event.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          testResult.success
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {testResult.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          <p className={`text-sm ${
            testResult.success 
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {testResult.message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleTest}
          disabled={!url || testWebhook.isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testWebhook.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4" />
          )}
          Test Connection
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || updateConfig.isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateConfig.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default WebhookSettings;
