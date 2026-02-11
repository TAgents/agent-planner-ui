import React, { useState, useEffect } from 'react';
import PromptTemplates from '../../components/settings/PromptTemplates';
import { Link } from 'react-router-dom';
import {
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Bell,
  Zap,
  BookOpen,
  TestTube,
} from 'lucide-react';
import { SettingsNav } from '../../components/settings/SettingsLayout';

interface WebhookSettings {
  url: string;
  events: string[];
  enabled: boolean;
}

interface WebhookEvent {
  key: string;
  label: string;
  description: string;
}

const AVAILABLE_EVENTS: WebhookEvent[] = [
  { key: 'task.created', label: 'Task Created', description: 'When a new task is created' },
  { key: 'task.updated', label: 'Task Updated', description: 'When a task is modified' },
  { key: 'task.completed', label: 'Task Completed', description: 'When a task is marked complete' },
  { key: 'task.blocked', label: 'Task Blocked', description: 'When a task is blocked' },
  { key: 'task.assigned', label: 'Task Assigned', description: 'When a task is assigned to an agent' },
  { key: 'plan.created', label: 'Plan Created', description: 'When a new plan is created' },
  { key: 'plan.updated', label: 'Plan Updated', description: 'When a plan is modified' },
  { key: 'comment.added', label: 'Comment Added', description: 'When a comment is added to a task' },
];

const IntegrationsSettings: React.FC = () => {
  const [settings, setSettings] = useState<WebhookSettings>({
    url: '',
    events: ['task.blocked', 'task.assigned'],
    enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch webhook settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'https://api.agentplanner.io'}/webhooks/settings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Error fetching webhook settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://api.agentplanner.io'}/webhooks/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        }
      );
      if (!response.ok) throw new Error('Failed to save settings');
      showNotification('Settings saved successfully', 'success');
    } catch (err) {
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.url) {
      showNotification('Please enter a webhook URL first', 'error');
      return;
    }
    setTesting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://api.agentplanner.io'}/webhooks/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: settings.url }),
        }
      );
      if (!response.ok) throw new Error('Test failed');
      showNotification('Test webhook sent successfully!', 'success');
    } catch (err) {
      showNotification('Failed to send test webhook', 'error');
    } finally {
      setTesting(false);
    }
  };

  const toggleEvent = (eventKey: string) => {
    setSettings((prev) => ({
      ...prev,
      events: prev.events.includes(eventKey)
        ? prev.events.filter((e) => e !== eventKey)
        : [...prev.events, eventKey],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SettingsNav />
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Connect AgentPlanner with external services and AI agents
          </p>
        </div>

        <SettingsNav />
        
        {/* Content with transition */}
        <div className="transition-opacity duration-150">

        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        )}

        {/* OpenClaw / Webhook Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Webhook Notifications
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send real-time updates to OpenClaw or other webhook endpoints
              </p>
            </div>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Enable Webhooks
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Send notifications when events occur
                </div>
              </div>
            </div>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Webhook URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={settings.url}
                onChange={(e) => setSettings({ ...settings, url: e.target.value })}
                placeholder="https://your-openclaw-instance.com/webhook"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleTest}
                disabled={testing || !settings.url}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Test
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              For OpenClaw, use your gateway's webhook endpoint
            </p>
          </div>

          {/* Event Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Events to Send
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event.key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    settings.events.includes(event.key)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.events.includes(event.key)}
                    onChange={() => toggleEvent(event.key)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {event.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {event.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* OpenClaw Setup Guide */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                OpenClaw Setup Guide
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect your OpenClaw agent to receive real-time updates
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Add the AgentPlanner skill
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Install the AgentPlanner skill in your OpenClaw workspace:
                </p>
                <div className="mt-2 bg-gray-900 dark:bg-gray-950 rounded-lg p-3 font-mono text-sm text-gray-100 flex items-center justify-between">
                  <code>skills/agent-planner/SKILL.md</code>
                  <button
                    onClick={() => copyToClipboard('skills/agent-planner/SKILL.md')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Set your API token
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add your AgentPlanner API token as an environment variable:
                </p>
                <div className="mt-2 bg-gray-900 dark:bg-gray-950 rounded-lg p-3 font-mono text-sm text-gray-100">
                  <code>AGENTPLANNER_TOKEN=your_token_here</code>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <Link to="/app/settings" className="text-blue-600 hover:underline">
                    Create an API token here →
                  </Link>
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Configure webhooks (optional)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Enter your OpenClaw webhook URL above to receive real-time notifications
                  about plan and task updates.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <a
              href="https://docs.openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View OpenClaw Documentation
            </a>
          </div>
        </div>
        </div> {/* End of transition wrapper */}

        {/* Prompt Templates */}
        <div className="mt-6">
          <PromptTemplates />
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;
