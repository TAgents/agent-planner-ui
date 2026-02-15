import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ExternalLink,
  Copy,
  BookOpen,
  MessageSquare,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Hash,
  Unplug,
} from 'lucide-react';
import { SettingsNav } from '../../components/settings/SettingsLayout';
import { slackService, SlackStatus, SlackChannel } from '../../services/api';

const IntegrationsSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Slack state
  const [slackStatus, setSlackStatus] = useState<SlackStatus | null>(null);
  const [slackLoading, setSlackLoading] = useState(true);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [testSending, setTestSending] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchSlackStatus = useCallback(async () => {
    try {
      setSlackLoading(true);
      const data = await slackService.getStatus();
      setSlackStatus(data);
    } catch {
      setSlackStatus({ connected: false });
    } finally {
      setSlackLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlackStatus();
  }, [fetchSlackStatus]);

  // Handle OAuth callback result
  useEffect(() => {
    const slackResult = searchParams.get('slack');
    if (slackResult === 'success') {
      showNotification('Slack connected successfully!', 'success');
      fetchSlackStatus();
    } else if (slackResult === 'error') {
      const reason = searchParams.get('reason') || 'Unknown error';
      showNotification(`Slack connection failed: ${reason}`, 'error');
    }
  }, [searchParams, fetchSlackStatus]);

  const handleSlackInstall = async () => {
    try {
      const data = await slackService.getInstallUrl();
      window.location.href = data.url;
    } catch {
      showNotification('Failed to start Slack installation', 'error');
    }
  };

  const handleSlackDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Slack?')) return;
    try {
      await slackService.disconnect();
      setSlackStatus({ connected: false });
      showNotification('Slack disconnected', 'success');
    } catch {
      showNotification('Failed to disconnect Slack', 'error');
    }
  };

  const handleLoadChannels = async () => {
    try {
      setChannelsLoading(true);
      const data = await slackService.listChannels();
      setChannels(data.channels);
    } catch {
      showNotification('Failed to load channels', 'error');
    } finally {
      setChannelsLoading(false);
    }
  };

  const handleSelectChannel = async (channel: SlackChannel) => {
    try {
      await slackService.setChannel(channel.id, channel.name);
      setSlackStatus(prev => prev ? { ...prev, channel_id: channel.id, channel_name: channel.name } : prev);
      setChannels([]);
      showNotification(`Channel set to #${channel.name}`, 'success');
    } catch {
      showNotification('Failed to set channel', 'error');
    }
  };

  const handleTestMessage = async () => {
    try {
      setTestSending(true);
      await slackService.sendTestMessage();
      showNotification('Test message sent!', 'success');
    } catch {
      showNotification('Failed to send test message', 'error');
    } finally {
      setTestSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your API tokens and integrations
          </p>
        </div>

        <SettingsNav />

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Slack Integration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Slack Integration
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive agent requests and decision notifications in Slack
              </p>
            </div>
            {slackStatus?.connected && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                Connected
              </span>
            )}
          </div>

          {slackLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : slackStatus?.connected ? (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Workspace: {slackStatus.team_name}
                    </p>
                    {slackStatus.channel_name ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {slackStatus.channel_name}
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        No channel selected — pick one below
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSlackDisconnect}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Unplug className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Channel picker */}
              <div>
                <button
                  onClick={handleLoadChannels}
                  disabled={channelsLoading}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {channelsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                  {slackStatus.channel_name ? 'Change Channel' : 'Select Channel'}
                </button>

                {channels.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
                    {channels.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChannel(ch)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 ${
                          ch.id === slackStatus.channel_id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Hash className="w-3 h-3 text-gray-400" />
                        {ch.name}
                        {ch.is_private && <span className="text-xs text-gray-400">🔒</span>}
                        {ch.id === slackStatus.channel_id && <Check className="w-3 h-3 ml-auto text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Test message */}
              {slackStatus.channel_id && (
                <button
                  onClick={handleTestMessage}
                  disabled={testSending}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {testSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  Send Test Message
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect Slack to receive real-time notifications when agents request help, decisions are needed, or tasks change status.
              </p>
              <button
                onClick={handleSlackInstall}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Connect Slack
              </button>
            </div>
          )}
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
      </div>
    </div>
  );
};

export default IntegrationsSettings;
