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
    sub: 'Add to ~/.mcp.json',
    comment: 'Add this entry to ~/.mcp.json (or your project .mcp.json).',
    language: 'js',
    lines: [
      '{',
      { text: '"mcpServers": {', indent: 1 },
      { text: '"agent-planner": {', indent: 2 },
      { text: '"command": "npx",', indent: 3 },
      { text: '"args": ["-y", "agent-planner-mcp"],', indent: 3 },
      { text: '"env": {', indent: 3 },
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
      { text: '# env USER_API_TOKEN=${TOKEN} MCP_CLIENT_LABEL="Cursor"', color: 'amber' },
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

/** Replace ${TOKEN} in snippet lines with the user's token. */
export function inlineToken(lines: ClientSnippetLine[], token: string): ClientSnippetLine[] {
  return lines.map((ln) => {
    if (typeof ln === 'string') return ln.replace('${TOKEN}', token);
    return { ...ln, text: ln.text.replace('${TOKEN}', token) };
  });
}
