import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">Agent Planner IO</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500 text-white rounded uppercase">
                  Alpha
                </span>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Collaborative planning for humans and AI agents.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/tagents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                {React.createElement(FiGithub as any, { className: "w-5 h-5" })}
              </a>
              <a
                href="https://twitter.com/tagents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                {React.createElement(FiTwitter as any, { className: "w-5 h-5" })}
              </a>
              <a
                href="https://linkedin.com/company/tagents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                {React.createElement(FiLinkedin as any, { className: "w-5 h-5" })}
              </a>
              <a
                href="mailto:hello@agentplanner.io"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                {React.createElement(FiMail as any, { className: "w-5 h-5" })}
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#setup" className="hover:text-white transition-colors">
                  Setup Guide
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tagents/agent-planner-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  MCP Server
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/agent-planner-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  npm Package
                </a>
              </li>
              <li>
                <Link to="/app/plans" className="hover:text-white transition-colors">
                  Web App
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-white transition-colors">
                  Guides & Tutorials
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <a
                  href="https://status.agentplanner.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} Agent Planner IO. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
