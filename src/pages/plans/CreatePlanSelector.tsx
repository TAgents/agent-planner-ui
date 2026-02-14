import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Bot, ChevronRight, Sparkles, X } from 'lucide-react';

/**
 * Modal explaining how to use OpenClaw agent for plan creation
 */
const OpenClawModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How it works:</h3>
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
            <button onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Got it
            </button>
            <a href="https://docs.openclaw.ai" target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center">
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
 * Provides two options: Blank or OpenClaw Agent
 */
const CreatePlanSelector: React.FC = () => {
  const navigate = useNavigate();
  const [showOpenClawModal, setShowOpenClawModal] = useState(false);

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
          <Link to="/app" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Plan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Choose how you'd like to start your plan</p>
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{option.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{option.description}</p>
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

      <OpenClawModal isOpen={showOpenClawModal} onClose={handleCloseOpenClawModal} />
    </div>
  );
};

export default CreatePlanSelector;
