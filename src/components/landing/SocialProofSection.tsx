import React from 'react';
import { McpSetupBlock } from '../common/McpSetupBlock';

const c = {
  surface: '#16140f',
  raised: '#1e1b15',
  border: '#2a261e',
  borderSubtle: '#1f1c16',
  text: '#ede8df',
  textSec: '#a09882',
  textMuted: '#6b6354',
  amber: '#d4a24e',
  amberDim: '#b8882e',
};

const clients = [
  'Claude Code',
  'Claude Desktop',
  'ChatGPT',
  'Cursor',
  'Windsurf',
  'Cline',
  'Gemini CLI',
];

export const SocialProofSection: React.FC = () => {
  return (
    <section className="py-10 md:py-16" style={{ borderTop: `1px solid ${c.borderSubtle}` }}>
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16 landing-fade-up landing-delay-5">
          {/* Left — steps */}
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] mb-4" style={{ color: c.textMuted }}>
              Quick start
            </div>
            <h3 className="font-display text-2xl font-semibold tracking-tight leading-snug" style={{ color: c.text }}>
              Connect your agent in 60 seconds
            </h3>
            <div className="flex flex-col gap-2 mt-6">
              {['Sign in and generate an API token', 'Add the MCP server config', 'Ask your agent to create a plan'].map((step, i) => (
                <div key={i} className="flex items-baseline gap-2.5 text-[0.85rem]" style={{ color: c.textSec }}>
                  <span className="font-mono text-[0.7rem] w-4 shrink-0" style={{ color: c.amberDim }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {i === 0 ? (
                    <span>
                      <a href="/login" style={{ color: c.amber }} className="hover:underline">Sign in</a>
                      {' '}and generate an API token
                    </span>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Works with */}
            <div className="mt-8">
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.12em] mb-3" style={{ color: c.textMuted }}>
                Works with
              </div>
              <div className="flex flex-wrap gap-1.5">
                {clients.map((name) => (
                  <span
                    key={name}
                    className="px-2 py-1 rounded font-mono text-[0.65rem]"
                    style={{ background: c.raised, border: `1px solid ${c.border}`, color: c.textSec }}
                  >
                    {name}
                  </span>
                ))}
                <span
                  className="px-2 py-1 rounded font-mono text-[0.65rem]"
                  style={{ background: c.raised, border: `1px solid ${c.border}`, color: c.textMuted }}
                >
                  + any MCP client
                </span>
              </div>
            </div>
          </div>

          {/* Right — code */}
          <div className="code-glow code-scan">
            <McpSetupBlock
              apiUrl="https://agentplanner.io/api"
              token="your_api_token_here"
              clients={['claude-code', 'claude-desktop', 'chatgpt', 'cursor', 'windsurf', 'cline']}
              bare
            />

            <p className="mt-3 text-[0.78rem]" style={{ color: c.textMuted }}>
              Then ask:{' '}
              <code
                className="inline-block px-2.5 py-0.5 rounded font-mono text-[0.75rem]"
                style={{ background: c.surface, border: `1px solid ${c.borderSubtle}`, color: c.textSec }}
              >
                "Create a plan for building a REST API"
              </code>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
