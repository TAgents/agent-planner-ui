import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const c = {
  borderSubtle: '#1f1c16',
  textMuted: '#6b6354',
  textSec: '#a09882',
};

const Footer: React.FC = () => {
  const linkClass = "transition-colors duration-150";

  return (
    <footer className="py-8" style={{ borderTop: `1px solid ${c.borderSubtle}` }}>
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: c.textMuted }}>
          <div className="flex items-center gap-5">
            <span>&copy; {new Date().getFullYear()} Talking Agents</span>
            <Link
              to="/privacy"
              className={linkClass}
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.textSec; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className={linkClass}
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.textSec; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
            >
              Terms
            </Link>
            <Link
              to="/cookies"
              className={linkClass}
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.textSec; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
            >
              Cookies
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="/api/api-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.textSec; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
            >
              API
            </a>
            <a
              href="https://github.com/TAgents/agent-planner/blob/main/docs/GETTING_STARTED.md"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.textSec; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
            >
              Docs
            </a>
            <a
              href="https://www.npmjs.com/package/agent-planner-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.textSec; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
            >
              npm
            </a>
            <a
              href="https://github.com/tagents"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              aria-label="GitHub"
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.textSec; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
