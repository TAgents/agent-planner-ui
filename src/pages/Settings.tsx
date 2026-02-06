import { useState, useEffect } from 'react';
import { useTokens } from '../hooks/useTokens';
import { TokenPermission } from '../types';
import { Key, Copy, Trash2, AlertCircle, Check, X, Zap, ExternalLink, Terminal, Code, Bot, FileCode, Sparkles } from 'lucide-react';
import { SettingsNav } from '../components/settings/SettingsLayout';

const Settings: React.FC = () => {
  const { 
    tokens, 
    loading, 
    error, 
    newToken, 
    createToken, 
    revokeToken, 
    clearNewToken,
    fetchTokens 
  } = useTokens();
  
  // Debug logging to see what's happening
  console.log('Tokens in Settings component:', tokens);
  console.log('Loading state:', loading);
  console.log('Error state:', error);
  console.log('New token:', newToken);
  
  // Ensure tokens are fetched when component mounts
  useEffect(() => {
    console.log('Settings component mounted, fetching tokens...');
    fetchTokens();
  }, [fetchTokens]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<TokenPermission[]>(['read']);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [mcpConfigCopied, setMcpConfigCopied] = useState(false);
  const [activeAITab, setActiveAITab] = useState<'claude-desktop' | 'claude-code' | 'chatgpt' | 'code-editors' | 'gemini-cli'>('claude-desktop');

  // Available permissions
  const availablePermissions: TokenPermission[] = ['read', 'write', 'admin'];

  // Handle creating a new token
  const handleCreateToken = async () => {
    try {
      console.log('Creating token in Settings component with name:', tokenName);
      const result = await createToken(tokenName, selectedPermissions);
      console.log('Token creation result:', result);
      
      setOpenCreateDialog(false);
      setTokenName('');
      setSelectedPermissions(['read']);
      
      // Force refresh the token list
      console.log('Manually refreshing token list after creation');
      fetchTokens();
      
      showNotification('Token created successfully', 'success');
    } catch (err: any) {
      console.error('Error creating token in Settings component:', err);
      showNotification(`Failed to create token: ${err.message}`, 'error');
    }
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (permission: TokenPermission) => {
    setSelectedPermissions(prevPermissions => {
      if (prevPermissions.includes(permission)) {
        return prevPermissions.filter(p => p !== permission);
      } else {
        return [...prevPermissions, permission];
      }
    });
  };

  // Handle token revocation confirmation
  const handleConfirmRevoke = (tokenId: string) => {
    setTokenToRevoke(tokenId);
    setOpenConfirmDialog(true);
  };

  // Handle actual token revocation
  const handleRevokeToken = async () => {
    if (tokenToRevoke) {
      try {
        await revokeToken(tokenToRevoke);
        showNotification('Token revoked successfully', 'success');
      } catch (err: any) {
        showNotification(`Failed to revoke token: ${err.message}`, 'error');
      }
    }
    setOpenConfirmDialog(false);
    setTokenToRevoke(null);
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Copy token to clipboard
  const copyTokenToClipboard = () => {
    if (newToken?.token) {
      navigator.clipboard.writeText(newToken.token)
        .then(() => {
          setTokenCopied(true);
          showNotification('Token copied to clipboard', 'success');
        })
        .catch(() => {
          showNotification('Failed to copy token to clipboard', 'error');
        });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Get permission badge color
  const getPermissionColor = (permission: TokenPermission) => {
    switch (permission) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'write':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'read':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Copy MCP config to clipboard
  const copyMcpConfig = (token?: string) => {
    // Detect API URL - handle localhost, agentplanner.io, and Cloud Run
    let apiUrl;
    const hostname = window.location.hostname;

    if (hostname === 'localhost') {
      apiUrl = window.location.origin.replace('3001', '3000');
    } else if (hostname.includes('agentplanner.io')) {
      // For agentplanner.io domain
      apiUrl = 'https://api.agentplanner.io';
    } else {
      // For Cloud Run or other deployments, replace 'ui' with 'api' in the hostname
      apiUrl = window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
    }

    // Use npx for published package - works everywhere!
    const mcpConfig = {
      "mcpServers": {
        "planning-system": {
          "command": "npx",
          "args": ["-y", "agent-planner-mcp"],
          "env": {
            "API_URL": apiUrl,
            "USER_API_TOKEN": token || "YOUR_TOKEN_HERE"
          }
        }
      }
    };

    navigator.clipboard.writeText(JSON.stringify(mcpConfig, null, 2))
      .then(() => {
        setMcpConfigCopied(true);
        showNotification('MCP config copied to clipboard', 'success');
        setTimeout(() => setMcpConfigCopied(false), 3000);
      })
      .catch(() => {
        showNotification('Failed to copy MCP config', 'error');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage your API tokens and integrations
          </p>
        </div>

        {/* Settings Navigation */}
        <SettingsNav />
        
        {/* Content with transition */}
        <div className="transition-opacity duration-150">

        {/* AI Integration Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              AI Integration Setup
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Connect your planning system with AI assistants using the Model Context Protocol (MCP)
            </p>
          </div>

          {/* AI Client Tabs */}
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveAITab('claude-desktop')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeAITab === 'claude-desktop'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Claude Desktop
            </button>
            <button
              onClick={() => setActiveAITab('claude-code')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeAITab === 'claude-code'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              <Code className="w-4 h-4" />
              Claude Code
            </button>
            <button
              onClick={() => setActiveAITab('chatgpt')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeAITab === 'chatgpt'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              <Bot className="w-4 h-4" />
              ChatGPT
            </button>
            <button
              onClick={() => setActiveAITab('code-editors')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeAITab === 'code-editors'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Code Editors
            </button>
            <button
              onClick={() => setActiveAITab('gemini-cli')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeAITab === 'gemini-cli'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Gemini CLI
            </button>
          </div>

          {/* Claude Desktop Tab */}
          {activeAITab === 'claude-desktop' && (
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Claude Desktop Integration
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-500" />
                    Quick Setup (3 Steps)
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>Create an API token below</li>
                    <li>Click "Copy Config" and paste into:
                      <code className="block mt-1 ml-5 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">
                        ~/Library/Application Support/Claude/claude_desktop_config.json
                      </code>
                    </li>
                    <li>Restart Claude Desktop</li>
                  </ol>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Configuration</h5>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      ✓ Uses npx
                    </span>
                  </div>
                  <pre className="bg-white dark:bg-gray-800 p-3 rounded-md text-xs font-mono overflow-x-auto border border-gray-200 dark:border-gray-700">
{`{
  "mcpServers": {
    "planning-system": {
      "command": "npx",
      "args": ["-y", "agent-planner-mcp"],
      "env": {
        "API_URL": "${(() => {
          const hostname = window.location.hostname;
          if (hostname === 'localhost') return 'http://localhost:3000';
          if (hostname.includes('agentplanner.io')) return 'https://api.agentplanner.io';
          return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
        })()}",
        "USER_API_TOKEN": "your_token_here"
      }
    }
  }
}`}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setOpenCreateDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Key className="w-4 h-4" />
                    Create API Token
                  </button>
                  <button
                    onClick={() => copyMcpConfig()}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {mcpConfigCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    Copy Config
                  </button>
                  <a
                    href="https://github.com/talkingagents/agent-planner-mcp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Documentation
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Claude Code Tab */}
          {activeAITab === 'claude-code' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Claude Code Integration
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Quick Setup
                  </h4>

                  <div className="space-y-3">
                    {/* Step 1: Create Token */}
                    <div className="flex items-start gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Create an API Token</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Click "Create API Token" below</p>
                      </div>
                    </div>

                    {/* Step 2: Run Command */}
                    <div className="flex items-start gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Run this command in your terminal</p>
                        <div className="bg-gray-900 rounded-lg p-3">
                          <pre className="text-xs font-mono text-green-400 overflow-x-auto">
{`claude mcp add planning-system npx agent-planner-mcp \\
  -e API_URL=${(() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') return 'http://localhost:3000';
    if (hostname.includes('agentplanner.io')) return 'https://api.agentplanner.io';
    return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
  })()} \\
  -e USER_API_TOKEN=YOUR_TOKEN_HERE`}
                          </pre>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          Replace <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">YOUR_TOKEN_HERE</code> with your actual token
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Orchestration (Optional) */}
                    <div className="flex items-start gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex-shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                          Install Orchestration <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Adds <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono">/create-plan</code> and <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono">/execute-plan</code> commands for autonomous task execution
                        </p>
                        <div className="bg-gray-900 rounded-lg p-2">
                          <code className="text-xs font-mono text-green-400">npx agent-planner-mcp setup-claude-code</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setOpenCreateDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Key className="w-4 h-4" />
                    Create API Token
                  </button>
                  <a
                    href="https://docs.claude.com/en/docs/claude-code/mcp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Claude Code MCP Docs
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ChatGPT Tab */}
          {activeAITab === 'chatgpt' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ChatGPT Desktop Integration
              </h3>

              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Requirements
                      </p>
                      <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• ChatGPT Plus or Pro subscription</li>
                        <li>• ChatGPT Desktop app (Developer Mode beta)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Setup Steps
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>Create an API token below</li>
                    <li>Install and open ChatGPT Desktop app</li>
                    <li>Enable Developer Mode in settings (Beta feature)</li>
                    <li>Add the MCP server configuration:
                      <pre className="mt-2 ml-5 bg-white dark:bg-gray-800 p-3 rounded-md text-xs font-mono overflow-x-auto border border-gray-200 dark:border-gray-700">
{`{
  "mcpServers": {
    "planning-system": {
      "command": "npx",
      "args": ["-y", "agent-planner-mcp"],
      "env": {
        "API_URL": "${(() => {
          const hostname = window.location.hostname;
          if (hostname === 'localhost') return 'http://localhost:3000';
          if (hostname.includes('agentplanner.io')) return 'https://api.agentplanner.io';
          return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
        })()}",
        "USER_API_TOKEN": "your_token_here"
      }
    }
  }
}`}
                      </pre>
                    </li>
                    <li>Restart ChatGPT Desktop app</li>
                  </ol>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setOpenCreateDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Key className="w-4 h-4" />
                    Create API Token
                  </button>
                  <a
                    href="https://platform.openai.com/docs/mcp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    ChatGPT MCP Docs
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* AI Code Editors Tab */}
          {activeAITab === 'code-editors' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                AI Code Editor Integration
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  MCP is supported by several AI-powered code editors including Cursor, VS Code (with extensions), Zed, Replit, Codeium, and Sourcegraph.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    General Setup
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>Create an API token below</li>
                    <li>Check your editor's MCP integration documentation</li>
                    <li>Add the MCP server to your editor's configuration</li>
                    <li>Use the following connection details:</li>
                  </ol>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Example MCP Configuration</p>
                  <pre className="bg-white dark:bg-gray-800 p-3 rounded-md text-xs font-mono overflow-x-auto border border-gray-200 dark:border-gray-700">
{`{
  "mcpServers": {
    "planning-system": {
      "command": "npx",
      "args": ["-y", "agent-planner-mcp"],
      "env": {
        "API_URL": "${(() => {
          const hostname = window.location.hostname;
          if (hostname === 'localhost') return 'http://localhost:3000';
          if (hostname.includes('agentplanner.io')) return 'https://api.agentplanner.io';
          return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
        })()}",
        "USER_API_TOKEN": "your_token_here"
      }
    }
  }
}`}
                  </pre>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Cursor</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">AI-powered VS Code fork</p>
                    <a
                      href="https://www.cursor.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">VS Code</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">With MCP extensions</p>
                    <a
                      href="https://code.visualstudio.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Zed</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">High-performance editor</p>
                    <a
                      href="https://zed.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Codeium</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">AI coding assistant</p>
                    <a
                      href="https://codeium.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setOpenCreateDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Key className="w-4 h-4" />
                    Create API Token
                  </button>
                  <a
                    href="https://modelcontextprotocol.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    MCP Documentation
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Gemini CLI Tab */}
          {activeAITab === 'gemini-cli' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Google Gemini CLI Integration
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Quick Setup (2 Steps)
                  </h4>
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li>
                      <span className="font-medium">Create an API token below</span>
                    </li>
                    <li>
                      <span className="font-medium">Run this command in your terminal:</span>
                      <div className="mt-2 ml-5 bg-gray-900 rounded-lg p-3">
                        <pre className="text-xs font-mono text-green-400 overflow-x-auto">
{`gemini mcp add planning-system npx agent-planner-mcp \\
  -e API_URL=${(() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') return 'http://localhost:3000';
    if (hostname.includes('agentplanner.io')) return 'https://api.agentplanner.io';
    return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
  })()} \\
  -e USER_API_TOKEN=YOUR_TOKEN_HERE`}
                        </pre>
                      </div>
                      <p className="mt-2 ml-5 text-xs text-gray-600 dark:text-gray-400">
                        Replace <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">YOUR_TOKEN_HERE</code> with your actual token
                      </p>
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Available Tools in Gemini CLI</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-gray-700 rounded p-2 border border-gray-200 dark:border-gray-600">
                      <span className="font-mono text-blue-600 dark:text-blue-400">search</span> - Search plans and nodes
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded p-2 border border-gray-200 dark:border-gray-600">
                      <span className="font-mono text-blue-600 dark:text-blue-400">create_plan</span> - Create new plans
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded p-2 border border-gray-200 dark:border-gray-600">
                      <span className="font-mono text-blue-600 dark:text-blue-400">create_node</span> - Add tasks/phases
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded p-2 border border-gray-200 dark:border-gray-600">
                      <span className="font-mono text-blue-600 dark:text-blue-400">update_node</span> - Update progress
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded p-2 border border-gray-200 dark:border-gray-600">
                      <span className="font-mono text-blue-600 dark:text-blue-400">add_log</span> - Add progress logs
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded p-2 border border-gray-200 dark:border-gray-600">
                      <span className="font-mono text-blue-600 dark:text-blue-400">get_plan_summary</span> - View plan details
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setOpenCreateDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Key className="w-4 h-4" />
                    Create API Token
                  </button>
                  <a
                    href="https://ai.google.dev/gemini-api/docs/cli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Gemini CLI Documentation
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="https://pypi.org/project/fastmcp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    FastMCP Documentation
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API Tokens Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                API Tokens
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Tokens for external applications to access the planning system
              </p>
            </div>
            <button
              onClick={() => fetchTokens()}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="p-6">

            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tokens...</p>
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-md">
                <p className="text-gray-600 dark:text-gray-400">You haven't created any API tokens yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tokens.map((token) => (
                      <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {token.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(token.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(token.last_used)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-1">
                            {token.permissions.map((permission) => (
                              <span 
                                key={permission} 
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleConfirmRevoke(token.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 focus:outline-none"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Token Dialog */}
      {openCreateDialog && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setOpenCreateDialog(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all sm:max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New API Token</h3>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token Name
                </label>
                <input
                  type="text"
                  id="tokenName"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Claude Desktop MCP"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  required
                />
              </div>
              <fieldset className="mb-4">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</legend>
                <div className="space-y-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center">
                      <input
                        id={`permission-${permission}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => handlePermissionChange(permission)}
                      />
                      <label htmlFor={`permission-${permission}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setOpenCreateDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateToken}
                disabled={!tokenName.trim()}
              >
                Create Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Revoke Dialog */}
      {openConfirmDialog && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setOpenConfirmDialog(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revoke API Token</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Are you sure you want to revoke this token? This action cannot be undone.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Any applications using this token will no longer be able to access the API.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setOpenConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleRevokeToken}
              >
                Revoke Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Token Dialog */}
      {newToken && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={clearNewToken}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 shadow-xl transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Save Your New API Token</h3>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4 bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md flex">
                <AlertCircle className="h-5 w-5 text-yellow-800 dark:text-yellow-200 flex-shrink-0 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    This token will only be shown once!
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    Copy this token now and store it securely. You won't be able to see it again.
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md flex justify-between items-center mb-6">
                <code className="flex-grow text-sm font-mono whitespace-pre-wrap break-all dark:text-white">
                  {tokenCopied ? '••••••••••••••••••••••••••••••••••••••••••••••••••••••••' : newToken.token}
                </code>
                <button
                  onClick={copyTokenToClipboard}
                  className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
                  title={tokenCopied ? "Copied!" : "Copy to clipboard"}
                >
                  {tokenCopied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Setup Instructions Tabs */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 mb-4">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Next Steps - Choose Your Client
                </h4>

                {/* Client Selection Tabs */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setActiveAITab('claude-code')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeAITab === 'claude-code'
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-green-200 dark:border-green-700'
                    }`}
                  >
                    Claude Code
                  </button>
                  <button
                    onClick={() => setActiveAITab('claude-desktop')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeAITab === 'claude-desktop'
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-green-200 dark:border-green-700'
                    }`}
                  >
                    Claude Desktop
                  </button>
                </div>

                {/* Claude Code Instructions */}
                {activeAITab === 'claude-code' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      Copy and run this command in your terminal:
                    </p>

                    <div className="bg-gray-900 rounded-lg p-3 border border-green-200 dark:border-green-700">
                      <pre className="text-xs font-mono text-green-400 overflow-x-auto mb-2 whitespace-pre-wrap break-all">
{`claude mcp add planning-system npx agent-planner-mcp \\
  -e API_URL=${(() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') return 'http://localhost:3000';
    if (hostname.includes('agentplanner.io')) return 'https://api.agentplanner.io';
    return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
  })()} \\
  -e USER_API_TOKEN=${newToken?.token || 'YOUR_TOKEN'}`}
                      </pre>
                      <button
                        onClick={() => {
                          const hostname = window.location.hostname;
                          let apiUrl;
                          if (hostname === 'localhost') apiUrl = 'http://localhost:3000';
                          else if (hostname.includes('agentplanner.io')) apiUrl = 'https://api.agentplanner.io';
                          else apiUrl = window.location.origin.replace('agent-planner-ui', 'agent-planner-api');

                          const command = `claude mcp add planning-system npx agent-planner-mcp \\
  -e API_URL=${apiUrl} \\
  -e USER_API_TOKEN=${newToken?.token || 'YOUR_TOKEN'}`;
                          navigator.clipboard.writeText(command).then(() => {
                            showNotification('Command copied!', 'success');
                          });
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Command
                      </button>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        ✓ Your API token is already included in this command - just copy and run!
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                      <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-2">
                        Optional: Install Orchestration
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                        Add <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded font-mono">/create-plan</code> and <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded font-mono">/execute-plan</code> commands for autonomous task execution:
                      </p>
                      <div className="bg-gray-900 rounded p-2">
                        <code className="text-xs font-mono text-green-400">npx agent-planner-mcp setup-claude-code</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Claude Desktop Instructions */}
                {activeAITab === 'claude-desktop' && (
                  <div>
                    <ol className="text-sm space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300">
                      <li>Click the button below to copy the complete MCP configuration</li>
                      <li>
                        Open your Claude Desktop config file:
                        <code className="block mt-1 ml-5 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
                        </code>
                        <code className="block mt-1 ml-5 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          %APPDATA%\Claude\claude_desktop_config.json (Windows)
                        </code>
                      </li>
                      <li>Paste the configuration into the file (merge with existing mcpServers if you have any)</li>
                      <li>Save the file and restart Claude Desktop</li>
                    </ol>

                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                      <button
                        onClick={() => copyMcpConfig(newToken.token)}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {mcpConfigCopied ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            MCP Config Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Complete MCP Configuration
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        💡 Uses npx - no installation needed, always up-to-date!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <details className="mt-4">
                <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                  Alternative: Local Development Setup
                </summary>
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    For local development or customization, you can clone and run the MCP server directly:
                  </p>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">1. Clone the repository:</h5>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
{`git clone https://github.com/talkingagents/agent-planner-mcp.git
cd agent-planner-mcp
npm install`}
                    </pre>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">2. Update claude_desktop_config.json:</h5>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
{`"mcpServers": {
  "planning-system": {
    "command": "node",
    "args": ["/absolute/path/to/agent-planner-mcp/src/index.js"],
    "env": {
      "API_URL": "${(() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost') return window.location.origin.replace('3001', '3000');
        if (hostname.includes('agentplanner.io')) return 'https://api.agentplanner.io';
        return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
      })()}",
      "USER_API_TOKEN": "${tokenCopied ? '•••••••••••••••••••••••' : newToken.token?.substring(0, 25) + '...'}"
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </details>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={clearNewToken}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </div> {/* End of transition wrapper */}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 z-50">
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {notification.type === 'success' ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setNotification(null)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
