import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

/**
 * Landing footer. Top row: four grouped columns — Product, Resources,
 * Company (links back to Talking Agents + contact), Legal. Bottom row:
 * copyright + GitHub + npm. Contact uses a plain mailto: for now —
 * accepts some spam risk in exchange for zero infra. Swap to a form
 * later if volume warrants it.
 */
const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-bg py-12">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <Column title="Product">
            <ExternalLink href="/explore" useRouter>Explore Blueprints</ExternalLink>
            <ExternalLink href="/login" useRouter>Sign in</ExternalLink>
            <ExternalLink href="/api/api-docs/">API reference</ExternalLink>
            <ExternalLink href="https://github.com/TAgents/agent-planner/blob/main/docs/GETTING_STARTED.md">Docs</ExternalLink>
            <ExternalLink href="https://www.npmjs.com/package/agent-planner-mcp">npm package</ExternalLink>
          </Column>

          <Column title="Resources">
            <ExternalLink href="https://github.com/tagents">GitHub</ExternalLink>
            <ExternalLink href="https://github.com/TAgents/agent-planner/issues">Issues / bugs</ExternalLink>
            <ExternalLink href="https://github.com/TAgents/agent-planner/blob/main/CHANGELOG.md">Changelog</ExternalLink>
          </Column>

          <Column title="Company">
            <ExternalLink href="https://talkingagents.com">Talking Agents ↗</ExternalLink>
            <ExternalLink href="https://talkingagents.com/services">Services</ExternalLink>
            <ExternalLink href="mailto:michael@talkingagents.com?subject=AgentPlanner%20—%20Hello">Contact</ExternalLink>
            <ExternalLink href="mailto:michael@talkingagents.com?subject=AgentPlanner%20—%20Investor%20inquiry">Investors</ExternalLink>
          </Column>

          <Column title="Legal">
            <ExternalLink href="/privacy" useRouter>Privacy</ExternalLink>
            <ExternalLink href="/terms" useRouter>Terms</ExternalLink>
            <ExternalLink href="/cookies" useRouter>Cookies</ExternalLink>
          </Column>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-text-muted sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Talking Agents Oy</span>
            <span className="opacity-40">·</span>
            <span className="font-mono uppercase tracking-[0.14em]">Workspace = live · Blueprint = reusable</span>
          </div>
          <a
            href="https://github.com/tagents"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-text-muted transition-colors hover:text-text"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};

const Column: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{title}</div>
    <ul className="flex flex-col gap-1.5 text-[12.5px]">{children}</ul>
  </div>
);

const ExternalLink: React.FC<{ href: string; useRouter?: boolean; children: React.ReactNode }> = ({
  href,
  useRouter,
  children,
}) => {
  if (useRouter) {
    return (
      <li>
        <Link to={href} className="text-text-sec transition-colors hover:text-text">
          {children}
        </Link>
      </li>
    );
  }
  const external = href.startsWith('http');
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="text-text-sec transition-colors hover:text-text"
      >
        {children}
      </a>
    </li>
  );
};

export default Footer;
