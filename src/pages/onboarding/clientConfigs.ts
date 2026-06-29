/**
 * Per-client MCP configuration snippets surfaced on /onboarding and
 * the five /connect/<client> pages. Each entry composes:
 *   - A monogram + display name + tagline for the ClientTile picker
 *   - A snippet template for the SnippetBlock (lines + comment + lang)
 *
 * `${TOKEN}` in any string is replaced at render time with the user's
 * actual API token (rendered with color: 'amber' to highlight).
 */
export type ClientId = 'claude-desktop' | 'claude-code' | 'cursor' | 'chatgpt' | 'openclaw';

export type ClientSnippetLine = string | { text: string; color?: string; indent?: number };

export type ClientConfig = {
  id: ClientId;
  glyph: string;
  name: string;
  sub: string;
  recommended?: boolean;
  /** Header comment above the snippet (`# ` for shell, `// ` for js). */
  comment: string;
  language: 'shell' | 'js';
  /** Snippet lines. Use `${TOKEN}` to inline the user's token (highlighted in amber). */
  lines: ClientSnippetLine[];
  /** Anchor href on agentplanner.io for the dedicated /connect/<id> page. */
  connectPath: string;
  /**
   * Optional fast-path one-liner shown above the main snippet (e.g. a CLI
   * command that performs the equivalent install without hand-editing JSON).
   */
  cli?: {
    label: string;
    comment: string;
    language: 'shell' | 'js';
    lines: ClientSnippetLine[];
  };
};

export const CLIENT_CONFIGS: Record<ClientId, ClientConfig> = {
  'claude-desktop': {
    id: 'claude-desktop',
    glyph: 'CD',
    name: 'Claude Desktop',
    sub: 'One-click .mcpb',
    recommended: true,
    comment: 'After installing the .mcpb bundle, paste your token when prompted.',
    language: 'shell',
    lines: [
      'open -a "Claude" agent-planner.mcpb',
      { text: '# Token: ${TOKEN}', color: 'amber' },
    ],
    connectPath: '/connect/claude-desktop',
  },
  'claude-code': {
    id: 'claude-code',
    glyph: 'CC',
    name: 'Claude Code',
    sub: 'One-line CLI install',
    comment: 'Add this entry to ~/.mcp.json (or your project .mcp.json).',
    language: 'js',
    cli: {
      label: 'Quick install (recommended)',
      comment: 'Run this once in any terminal — writes to ~/.claude.json.',
      language: 'shell',
      // Single line: backslash-continuations break on paste in some shells, and
      // API_URL must be present or the MCP defaults to http://localhost:3000
      // (which makes a hosted user see "no goals" / "goal not found").
      lines: [
        'claude mcp add agent-planner -e USER_API_TOKEN=${TOKEN} -e API_URL=https://agentplanner.io/api -e MCP_CLIENT_LABEL="Claude Code" -- npx -y agent-planner-mcp',
      ],
    },
    lines: [
      '{',
      { text: '"mcpServers": {', indent: 1 },
      { text: '"agent-planner": {', indent: 2 },
      { text: '"command": "npx",', indent: 3 },
      { text: '"args": ["-y", "agent-planner-mcp"],', indent: 3 },
      { text: '"env": {', indent: 3 },
      { text: '"API_URL": "https://agentplanner.io/api",', indent: 4 },
      { text: '"USER_API_TOKEN": "${TOKEN}",', indent: 4, color: 'amber' },
      { text: '"MCP_CLIENT_LABEL": "Claude Code"', indent: 4 },
      { text: '}', indent: 3 },
      { text: '}', indent: 2 },
      { text: '}', indent: 1 },
      '}',
    ],
    connectPath: '/connect/claude-code',
  },
  cursor: {
    id: 'cursor',
    glyph: 'CR',
    name: 'Cursor',
    sub: 'Add to settings.json',
    comment: 'In Cursor → Settings → MCP, add a new server with this command.',
    language: 'shell',
    lines: [
      'npx -y agent-planner-mcp',
      { text: '# env API_URL=https://agentplanner.io/api USER_API_TOKEN=${TOKEN} MCP_CLIENT_LABEL="Cursor"', color: 'amber' },
    ],
    connectPath: '/connect/cursor',
  },
  chatgpt: {
    id: 'chatgpt',
    glyph: 'GP',
    name: 'ChatGPT',
    sub: 'Custom GPT action',
    comment: 'In ChatGPT Custom GPT builder → Actions, paste this auth header.',
    language: 'shell',
    lines: [
      'Authorization: ApiKey ${TOKEN}',
      'X-Client-Label: ChatGPT',
    ],
    connectPath: '/connect/chatgpt',
  },
  openclaw: {
    id: 'openclaw',
    glyph: 'OC',
    name: 'OpenClaw',
    sub: 'Inbound polling',
    comment: 'OpenClaw connects via inbound polling. Save this token in OpenClaw → MCP.',
    language: 'shell',
    lines: [
      { text: 'AGENT_PLANNER_TOKEN=${TOKEN}', color: 'amber' },
      'AGENT_PLANNER_URL=https://agentplanner.io/api',
    ],
    connectPath: '/connect/openclaw',
  },
};

export const CLIENT_ORDER: ClientId[] = [
  'claude-desktop',
  'claude-code',
  'cursor',
  'chatgpt',
  'openclaw',
];

// ── Remote MCP connector (OAuth) ─────────────────────────────────────────────
// The connector path needs NO API token: the user pastes one URL and signs in.
// Same endpoint for every client; identity is handled by the OAuth sign-in.
// This is the recommended path for Claude (web/Desktop/Cowork) and ChatGPT.
export const MCP_CONNECTOR_URL = 'https://agentplanner.io/mcp';

export type ConnectorClientId = 'claude' | 'chatgpt';

export type ConnectorClient = {
  id: ConnectorClientId;
  glyph: string;
  name: string;
  /** One-line "use this when…" framing. */
  tagline: string;
  /** Individual-user setup steps, mirroring the client's current UI. */
  steps: string[];
  /** Team/Enterprise caveat, where the flow differs. */
  teamNote?: string;
  /** Per-conversation enablement reminder. */
  enableNote?: string;
};

export const CONNECTOR_CLIENTS: ConnectorClient[] = [
  {
    id: 'claude',
    glyph: 'C',
    name: 'Claude',
    tagline: 'Claude on web, Desktop, or Cowork — through a secure remote MCP connector. No API token to copy.',
    steps: [
      'Open Claude → Settings → Connectors → Add custom connector.',
      'Paste the AgentPlanner connector URL below and click Add.',
      'Click Connect and sign in with your AgentPlanner account.',
    ],
    teamNote:
      'Team / Enterprise: an owner may need to add the connector under Organization settings first; then each member connects and signs in individually.',
    enableNote:
      'In a chat, you may still need to switch it on from the + (Connectors) menu before Claude uses it.',
  },
  {
    id: 'chatgpt',
    glyph: 'G',
    name: 'ChatGPT',
    tagline: 'ChatGPT via the Apps SDK connector. No API token to copy.',
    steps: [
      'Open ChatGPT → Settings → Apps & Connectors → Advanced → turn on Developer Mode (workspace admin).',
      'Under Apps & Connectors, add a custom connector and paste the AgentPlanner URL below.',
      'Sign in with your AgentPlanner account when prompted.',
    ],
    enableNote: 'In a chat, enable AgentPlanner from the apps / connectors menu if it isn’t already on.',
  },
];

// Token-based clients for the "advanced" section of the connect hub — the ones
// that genuinely use a header token / local stdio (NOT Claude web or ChatGPT,
// which use the connector above).
export const TOKEN_CLIENT_ORDER: ClientId[] = ['claude-code', 'cursor', 'claude-desktop', 'openclaw'];

/** Replace ${TOKEN} in snippet lines with the user's token. */
export function inlineToken(lines: ClientSnippetLine[], token: string): ClientSnippetLine[] {
  return lines.map((ln) => {
    if (typeof ln === 'string') return ln.replace('${TOKEN}', token);
    return { ...ln, text: ln.text.replace('${TOKEN}', token) };
  });
}
