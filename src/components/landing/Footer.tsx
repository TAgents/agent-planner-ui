import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/logo.png"
                alt="Agent Planner IO"
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">Agent Planner IO</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500 text-white rounded uppercase">
                  Alpha
                </span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Collaborative planning for humans and AI agents.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/tagents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/agentplanner_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="mailto:contact@talkingagents.com"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#setup" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Setup Guide
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tagents/agent-planner-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  MCP Server
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/agent-planner-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  npm Package
                </a>
              </li>
              <li>
                <Link to="/app/plans" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Web App
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://api.agentplanner.io/api-docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/TAgents/agent-planner/blob/main/docs/OPENCLAW_INTEGRATION.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  OpenClaw Integration
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/TAgents/agent-planner/blob/main/docs/NOTIFICATIONS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Webhook Notifications
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tagents/agent-planner-mcp#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  MCP Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://talkingagents.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@talkingagents.com"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear} Agent Planner IO. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
              Terms
            </Link>
            <Link to="/cookies" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
