import React, { useState } from 'react';
import { Copy, Check, Key, ExternalLink } from 'lucide-react';

// Warm obsidian palette for code blocks — matches landing page
const colors = {
  surface: '#16140f',
  raised: '#1e1b15',
  border: '#2a261e',
  borderSubtle: '#1f1c16',
  text: '#ede8df',
  textSec: '#a09882',
  textMuted: '#6b6354',
  amber: '#d4a24e',
  amberDim: '#b8882e',
  teal: '#5ba89a',
};

// ── Code generation ──────────────────────────────────────────────────

type ClientId = 'claude-code' | 'claude-desktop' | 'chatgpt' | 'editors' | 'gemini' | 'openclaw';

interface ClientDef {
  id: ClientId;
  label: string;
  type: 'terminal' | 'config';
  configHint?: string;
}

const allClients: ClientDef[] = [
  { id: 'claude-code', label: 'Claude Code', type: 'terminal' },
  { id: 'claude-desktop', label: 'Claude Desktop', type: 'config', configHint: '~/Library/Application Support/Claude/claude_desktop_config.json' },
  { id: 'chatgpt', label: 'ChatGPT', type: 'config', configHint: 'ChatGPT Desktop → Settings → Developer Mode → MCP' },
  { id: 'editors', label: 'Code Editors', type: 'config', configHint: "Your editor's MCP configuration file" },
  { id: 'gemini', label: 'Gemini CLI', type: 'terminal' },
  { id: 'openclaw', label: 'OpenClaw', type: 'config' },
];

function getCode(client: ClientId, apiUrl: string, token: string): string {
  const t = token || 'YOUR_TOKEN';
  switch (client) {
    case 'claude-code':
      return `claude mcp add planning-system npx agent-planner-mcp \\\n  -e API_URL=${apiUrl} \\\n  -e USER_API_TOKEN=${t}`;
    case 'gemini':
      return `gemini mcp add planning-system npx agent-planner-mcp \\\n  -e API_URL=${apiUrl} \\\n  -e USER_API_TOKEN=${t}`;
    case 'openclaw':
      return `# openclaw config\ntools:\n  - name: agent-planner\n    type: mcp\n    command: npx\n    args: ["-y", "agent-planner-mcp"]\n    env:\n      API_URL: ${apiUrl}\n      USER_API_TOKEN: ${t}`;
    default: // config-file based
      return JSON.stringify({
        mcpServers: {
          "planning-system": {
            command: "npx",
            args: ["-y", "agent-planner-mcp"],
            env: { API_URL: apiUrl, USER_API_TOKEN: t }
          }
        }
      }, null, 2);
  }
}

function getCodeFormat(client: ClientId): 'bash' | 'json' | 'yaml' {
  if (client === 'claude-code' || client === 'gemini') return 'bash';
  if (client === 'openclaw') return 'yaml';
  return 'json';
}

// ── Syntax highlighting ──────────────────────────────────────────────

const SyntaxHighlight: React.FC<{ code: string; format: 'bash' | 'json' | 'yaml' }> = ({ code, format }) => {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const push = (content: string, color?: string) => {
    parts.push(color ? <span key={key++} style={{ color }}>{content}</span> : <span key={key++}>{content}</span>);
  };

  const lines = code.split('\n');

  if (format === 'bash') {
    lines.forEach((line, i) => {
      if (i > 0) parts.push(<span key={key++}>{'\n'}</span>);
      if (i === 0) {
        // command line: "cmd mcp add name ..."
        const cmdParts = line.match(/^(\w+ mcp add)\s+(\S+)\s+(.*)/);
        if (cmdParts) {
          push(cmdParts[1], colors.text);
          push(' ');
          push(cmdParts[2], colors.amber);
          push(' ');
          push(cmdParts[3], colors.textSec);
        } else {
          push(line, colors.textSec);
        }
      } else {
        const flagMatch = line.match(/^(\s*)(-.)\s+(\w+)=(.*)/);
        if (flagMatch) {
          push(flagMatch[1]);
          push(flagMatch[2], colors.textMuted);
          push(' ');
          push(flagMatch[3], colors.teal);
          push('=');
          push(flagMatch[4], colors.amber);
        } else {
          push(line, colors.textSec);
        }
      }
    });
  } else if (format === 'json') {
    lines.forEach((line, i) => {
      if (i > 0) parts.push(<span key={key++}>{'\n'}</span>);
      let processed = false;
      const kvMatch = line.match(/^(\s*)"([^"]+)":\s*"([^"]*)"(,?)$/);
      if (kvMatch) {
        push(kvMatch[1]);
        push(`"${kvMatch[2]}"`, colors.teal);
        push(': ');
        push(`"${kvMatch[3]}"`, colors.amber);
        push(kvMatch[4]);
        processed = true;
      }
      if (!processed) {
        const keyOnlyMatch = line.match(/^(\s*)"([^"]+)":\s*(\{|\[)(,?)$/);
        if (keyOnlyMatch) {
          push(keyOnlyMatch[1]);
          push(`"${keyOnlyMatch[2]}"`, colors.teal);
          push(': ');
          push(keyOnlyMatch[3], colors.textSec);
          push(keyOnlyMatch[4]);
          processed = true;
        }
      }
      if (!processed) {
        const arrValMatch = line.match(/^(\s*)"([^"]*)"(,?)$/);
        if (arrValMatch) {
          push(arrValMatch[1]);
          push(`"${arrValMatch[2]}"`, colors.amber);
          push(arrValMatch[3]);
          processed = true;
        }
      }
      if (!processed) push(line, colors.textSec);
    });
  } else {
    // yaml
    lines.forEach((line, i) => {
      if (i > 0) parts.push(<span key={key++}>{'\n'}</span>);
      if (line.trimStart().startsWith('#')) {
        push(line, colors.textMuted);
      } else {
        const kvMatch = line.match(/^(\s*[-]?\s*)(\w+):\s*(.*)$/);
        if (kvMatch) {
          push(kvMatch[1]);
          push(kvMatch[2], colors.teal);
          push(': ');
          push(kvMatch[3], colors.amber);
        } else {
          push(line, colors.textSec);
        }
      }
    });
  }

  return <>{parts}</>;
};

// ── Main component ───────────────────────────────────────────────────

export interface McpSetupBlockProps {
  /** API base URL. Defaults to production. */
  apiUrl?: string;
  /** Token value to substitute into code. */
  token?: string;
  /** Which clients to show. Defaults to all. */
  clients?: ClientId[];
  /** Show the "Create Token" button. */
  onCreateToken?: () => void;
  /** Show the "Docs" link. */
  showDocs?: boolean;
  /** Extra hint below the code for the claude-code tab. */
  showClaudeCodeHint?: boolean;
  /** Extra hint below the code for the chatgpt tab. */
  showChatGptHint?: boolean;
  /** Compact mode — no outer card chrome. */
  bare?: boolean;
}

export const McpSetupBlock: React.FC<McpSetupBlockProps> = ({
  apiUrl = 'https://agentplanner.io/api',
  token,
  clients: visibleClientIds,
  onCreateToken,
  showDocs = false,
  showClaudeCodeHint = false,
  showChatGptHint = false,
  bare = false,
}) => {
  const visibleClients = visibleClientIds
    ? allClients.filter(c => visibleClientIds.includes(c.id))
    : allClients;

  const [activeClient, setActiveClient] = useState<ClientId>(visibleClients[0]?.id ?? 'claude-code');
  const [copied, setCopied] = useState(false);

  const clientDef = allClients.find(c => c.id === activeClient) ?? allClients[0];
  const code = getCode(activeClient, apiUrl, token || '');
  const format = getCodeFormat(activeClient);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <>
      {/* Client tabs */}
      <div className="flex gap-0.5 flex-wrap">
        {visibleClients.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveClient(c.id); setCopied(false); }}
            className="px-3.5 py-1.5 font-mono text-[0.7rem] rounded-t-md transition-colors duration-150"
            style={{
              color: activeClient === c.id ? colors.amber : colors.textMuted,
              background: activeClient === c.id ? colors.raised : colors.surface,
              border: `1px solid ${activeClient === c.id ? colors.border : colors.borderSubtle}`,
              borderBottom: 'none',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Instruction line */}
      {clientDef.type === 'terminal' && (
        <div className="px-4 pt-3 text-[11px]" style={{ background: colors.raised, color: colors.textMuted, borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}` }}>
          1. Create an API token below, then run:
        </div>
      )}
      {clientDef.type === 'config' && clientDef.configHint && (
        <div className="px-4 pt-3 text-[11px]" style={{ background: colors.raised, color: colors.textMuted, borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}` }}>
          Paste into: <code className="font-mono text-[10px]" style={{ color: colors.textSec }}>{clientDef.configHint}</code>
        </div>
      )}

      {/* Code block */}
      <div
        className="relative rounded-b-lg overflow-hidden"
        style={{ background: colors.raised, border: `1px solid ${colors.border}` }}
      >
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-md transition-colors duration-150 z-10"
          style={{ color: colors.textMuted, background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.text; e.currentTarget.style.background = colors.border; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted; e.currentTarget.style.background = 'transparent'; }}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check className="w-3.5 h-3.5" style={{ color: colors.teal }} /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <pre className="p-5 font-mono text-[0.78rem] leading-relaxed overflow-x-auto" style={{ color: colors.textSec }}>
          <SyntaxHighlight code={code} format={format} />
        </pre>
      </div>

      {/* Hints */}
      {showClaudeCodeHint && activeClient === 'claude-code' && (
        <p className="mt-2 text-[10px]" style={{ color: colors.textMuted }}>
          Optional: <code className="font-mono px-1 rounded" style={{ background: colors.surface, color: colors.textSec }}>npx agent-planner-mcp setup-claude-code</code> adds /create-plan and /execute-plan commands
        </p>
      )}
      {showChatGptHint && activeClient === 'chatgpt' && (
        <p className="mt-2 text-[10px]" style={{ color: colors.textMuted }}>
          Requires ChatGPT Plus/Pro with Developer Mode enabled
        </p>
      )}

      {/* Actions */}
      {(onCreateToken || showDocs) && (
        <div className="flex items-center gap-2 mt-3">
          {onCreateToken && (
            <button
              onClick={onCreateToken}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors"
              style={{ background: colors.border, color: colors.text }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.textMuted; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = colors.border; }}
            >
              <Key className="w-3 h-3" />
              Create Token
            </button>
          )}
          {showDocs && (
            <>
              <a
                href="https://github.com/TAgents/agent-planner-mcp/blob/main/SKILL.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] transition-colors"
                style={{ color: colors.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.textSec; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted; }}
              >
                Skill Reference <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://github.com/TAgents/agent-planner-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] transition-colors"
                style={{ color: colors.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.textSec; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted; }}
              >
                Docs <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </>
          )}
        </div>
      )}
    </>
  );

  if (bare) return <div>{content}</div>;

  return (
    <div className="rounded-lg p-4" style={{ background: colors.surface, border: `1px solid ${colors.borderSubtle}` }}>
      {content}
    </div>
  );
};

export default McpSetupBlock;
