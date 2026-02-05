import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, LayoutTemplate, Bot, ChevronRight, Sparkles, Search, X, AlertCircle } from 'lucide-react';
import { useTemplates, Template } from '../../hooks/useTemplates';

/**
 * Modal for selecting a plan template from available options
 */
const TemplateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: templates, isLoading, error } = useTemplates();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Memoized filtered templates
  const filteredTemplates = useMemo(() => 
    (templates || []).filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [templates, searchQuery]
  );

  // Handle keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="template-modal-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 id="template-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose a Template
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close template selection"
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 dark:text-red-400 font-medium">Failed to load templates</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try again later</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <LayoutTemplate className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No templates match your search' : 'No templates available yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template.id)}
                  className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {template.description}
                        </p>
                      )}
                      {template.category && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {template.category}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Modal explaining how to use OpenClaw agent for plan creation
 */
const OpenClawModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      closeButtonRef.current?.focus();
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="openclaw-modal-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close OpenClaw information"
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 id="openclaw-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Ask Your OpenClaw Agent
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Let your OpenClaw agent create a plan for you. Just describe what you want to accomplish.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-left mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How it works:
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center">1</span>
                <span>Open your OpenClaw chat (Signal, Telegram, etc.)</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center">2</span>
                <span>Ask: "Create a plan for [your goal]"</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center">3</span>
                <span>Your agent uses AgentPlanner to build a structured plan</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs flex items-center justify-center">4</span>
                <span>Review and refine it here in the dashboard</span>
              </li>
            </ol>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Got it
            </button>
            <a
              href="https://docs.openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Create Plan Selector - Landing page for creating new plans
 * Provides three options: Blank, Template, or OpenClaw Agent
 */
const CreatePlanSelector: React.FC = () => {
  const navigate = useNavigate();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showOpenClawModal, setShowOpenClawModal] = useState(false);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setShowTemplateModal(false);
    navigate(`/app/plans/new?template=${templateId}`);
  }, [navigate]);

  const handleCloseTemplateModal = useCallback(() => {
    setShowTemplateModal(false);
  }, []);

  const handleCloseOpenClawModal = useCallback(() => {
    setShowOpenClawModal(false);
  }, []);

  const options = [
    {
      id: 'blank',
      title: 'Blank Plan',
      description: 'Start from scratch with an empty plan. Add phases, tasks, and milestones as you go.',
      icon: FileText,
      color: 'blue',
      onClick: () => navigate('/app/plans/new'),
    },
    {
      id: 'template',
      title: 'From Template',
      description: 'Choose from pre-built templates for common project types and workflows.',
      icon: LayoutTemplate,
      color: 'green',
      onClick: () => setShowTemplateModal(true),
    },
    {
      id: 'openclaw',
      title: 'Ask OpenClaw Agent',
      description: 'Let your AI agent create a detailed plan based on your goals and requirements.',
      icon: Bot,
      color: 'purple',
      badge: 'Recommended',
      onClick: () => setShowOpenClawModal(true),
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-500 dark:hover:border-blue-500',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'hover:border-green-500 dark:hover:border-green-500',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-500 dark:hover:border-purple-500',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/app"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Plan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Choose how you'd like to start your plan
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid gap-4">
          {options.map((option) => {
            const Icon = option.icon;
            const colors = colorClasses[option.color];
            
            return (
              <button
                key={option.id}
                onClick={option.onClick}
                className={`relative w-full text-left p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${colors.border} hover:shadow-lg transition-all`}
              >
                {option.badge && (
                  <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {option.badge}
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {option.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Tip:</strong> If you have an OpenClaw agent set up, the "Ask OpenClaw Agent" option 
            is the fastest way to create detailed, actionable plans. Just describe your goal and let 
            your agent do the heavy lifting!
          </p>
        </div>
      </div>

      {/* Modals */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={handleCloseTemplateModal}
        onSelect={handleTemplateSelect}
      />
      <OpenClawModal
        isOpen={showOpenClawModal}
        onClose={handleCloseOpenClawModal}
      />
    </div>
  );
};

export default CreatePlanSelector;
