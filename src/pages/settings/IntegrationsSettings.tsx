import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, MessageSquare, Check, X, AlertCircle, RefreshCw, Hash, Unplug, BookOpen, ExternalLink } from 'lucide-react';
import { SettingsNav } from '../../components/settings/SettingsLayout';
import { slackService, SlackStatus, SlackChannel } from '../../services/api';

const IntegrationsSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [slackStatus, setSlackStatus] = useState<SlackStatus | null>(null);
  const [slackLoading, setSlackLoading] = useState(true);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [testSending, setTestSending] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSlackStatus = useCallback(async () => {
    try {
      setSlackLoading(true);
      const data = await slackService.getStatus();
      setSlackStatus(data);
    } catch { setSlackStatus({ connected: false }); }
    finally { setSlackLoading(false); }
  }, []);

  useEffect(() => { fetchSlackStatus(); }, [fetchSlackStatus]);

  useEffect(() => {
    const slackResult = searchParams.get('slack');
    if (slackResult === 'success') { showNotification('Slack connected', 'success'); fetchSlackStatus(); }
    else if (slackResult === 'error') { showNotification(`Slack failed: ${searchParams.get('reason') || 'Unknown'}`, 'error'); }
  }, [searchParams, fetchSlackStatus]);

  const handleSlackInstall = async () => {
    try { const data = await slackService.getInstallUrl(); window.location.href = data.url; }
    catch { showNotification('Failed to start Slack install', 'error'); }
  };

  const handleSlackDisconnect = async () => {
    if (!window.confirm('Disconnect Slack?')) return;
    try { await slackService.disconnect(); setSlackStatus({ connected: false }); showNotification('Slack disconnected', 'success'); }
    catch { showNotification('Failed to disconnect', 'error'); }
  };

  const handleLoadChannels = async () => {
    try { setChannelsLoading(true); const data = await slackService.listChannels(); setChannels(data.channels); }
    catch { showNotification('Failed to load channels', 'error'); }
    finally { setChannelsLoading(false); }
  };

  const handleSelectChannel = async (channel: SlackChannel) => {
    try {
      await slackService.setChannel(channel.id, channel.name);
      setSlackStatus(prev => prev ? { ...prev, channel_id: channel.id, channel_name: channel.name } : prev);
      setChannels([]);
      showNotification(`Channel set to #${channel.name}`, 'success');
    } catch { showNotification('Failed to set channel', 'error'); }
  };

  const handleTestMessage = async () => {
    try { setTestSending(true); await slackService.sendTestMessage(); showNotification('Test sent', 'success'); }
    catch { showNotification('Failed to send test', 'error'); }
    finally { setTestSending(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SettingsNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4">

        {/* Notification */}
        {notification && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            {notification.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            <span className="flex-1">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100"><X className="w-3 h-3" /></button>
          </div>
        )}

        {/* Slack */}
        <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-semibold text-gray-900 dark:text-white">Slack</span>
            </div>
            {slackStatus?.connected && (
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded font-medium">
                Connected
              </span>
            )}
          </div>

          <div className="p-4">
            {slackLoading ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : slackStatus?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{slackStatus.team_name}</p>
                    {slackStatus.channel_name ? (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" /> {slackStatus.channel_name}
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">No channel selected</p>
                    )}
                  </div>
                  <button
                    onClick={handleSlackDisconnect}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Unplug className="w-3 h-3" /> Disconnect
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadChannels}
                    disabled={channelsLoading}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {channelsLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3" />}
                    {slackStatus.channel_name ? 'Change' : 'Select Channel'}
                  </button>
                  {slackStatus.channel_id && (
                    <button
                      onClick={handleTestMessage}
                      disabled={testSending}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
                    >
                      {testSending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                      Test
                    </button>
                  )}
                </div>

                {channels.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-md divide-y divide-gray-100 dark:divide-gray-800/60">
                    {channels.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChannel(ch)}
                        className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1.5 ${
                          ch.id === slackStatus.channel_id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Hash className="w-2.5 h-2.5 text-gray-400" />
                        {ch.name}
                        {ch.is_private && <span className="text-[9px] text-gray-400 ml-1">private</span>}
                        {ch.id === slackStatus.channel_id && <Check className="w-2.5 h-2.5 ml-auto text-blue-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Get notified when agents request help or decisions are needed.
                </p>
                <button
                  onClick={handleSlackInstall}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  Connect Slack
                </button>
              </div>
            )}
          </div>
        </div>

        {/* OpenClaw */}
        <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800/60">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-gray-900 dark:text-white">OpenClaw</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-[9px] font-bold">1</span>
                <div>
                  <p className="text-[11px] font-medium text-gray-900 dark:text-white">Add the AgentPlanner skill</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Copy{' '}
                    <a
                      href="https://github.com/TAgents/agent-planner-mcp/blob/main/SKILL.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      SKILL.md
                    </a>
                    {' '}to your OpenClaw workspace:
                  </p>
                  <div className="mt-1 bg-gray-950 dark:bg-black rounded-md px-3 py-1.5 flex items-center justify-between group">
                    <code className="text-[10px] font-mono text-gray-300">skills/agent-planner/SKILL.md</code>
                    <button onClick={() => copyToClipboard('skills/agent-planner/SKILL.md')} className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-[9px] font-bold">2</span>
                <div>
                  <p className="text-[11px] font-medium text-gray-900 dark:text-white">Set your API token</p>
                  <div className="mt-1 bg-gray-950 dark:bg-black rounded-md px-3 py-1.5">
                    <code className="text-[10px] font-mono text-gray-300">AGENTPLANNER_TOKEN=your_token_here</code>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    <Link to="/app/settings" className="text-blue-500 hover:text-blue-600">Create a token</Link> on the Tokens tab
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-3">
              <a
                href="https://github.com/TAgents/agent-planner-mcp/blob/main/SKILL.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-500 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" /> Skill Reference
              </a>
              <a
                href="https://docs.openclaw.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-500 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" /> OpenClaw Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;
