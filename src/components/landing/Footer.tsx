import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

/**
 * Landing footer. Top row: four grouped columns — Product, Resources,
 * Company (links back to Talking Agents + contact), Legal. Bottom row is a
 * mini title block: bordered cells carrying the copyright, the legend, and
 * GitHub. Contact uses a plain mailto: for now — accepts some spam risk in
 * exchange for zero infra. Swap to a form later if volume warrants it.
 */
const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-bg py-12">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <Column title="Product">
            <ExternalLink href="/explore" useRouter>Explore blueprints</ExternalLink>
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

        {/* mini title block */}
        <div className="mt-10 grid grid-cols-1 border border-border font-mono text-[10px] tracking-[0.1em] text-text-muted sm:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center border-b border-border px-3.5 py-2.5 uppercase sm:border-b-0 sm:border-r">
            Blueprint = reusable (dashed) · Workspace = live (solid ink)
          </div>
          <div className="flex items-center border-b border-border px-3.5 py-2.5 sm:border-b-0 sm:border-r">
            © {new Date().getFullYear()} Talking Agents Oy
          </div>
          <a
            href="https://github.com/tagents"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex items-center gap-2 px-3.5 py-2.5 text-text-muted transition-colors hover:text-text"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="uppercase">Source</span>
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
