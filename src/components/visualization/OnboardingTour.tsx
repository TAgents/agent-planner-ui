import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  MousePointer,
  Plus,
  GitBranch,
  Share2,
  Sparkles
} from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
  isVisible: boolean;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.FC<any>;
  target?: string; // CSS selector for highlighting
  position?: 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, isVisible }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Agent Planner!',
      description: 'Let\'s take a quick tour to help you get started with your planning journey.',
      icon: Sparkles,
      position: 'center',
    },
    {
      id: 'canvas',
      title: 'Your Planning Canvas',
      description: 'This is where you\'ll visualize your plan. Drag nodes to arrange them, and zoom in/out to see the big picture.',
      icon: MousePointer,
      position: 'center',
    },
    {
      id: 'add-node',
      title: 'Building Your Plan',
      description: 'Click "Add Node" to create phases, tasks, and milestones. Start with major phases, then break them down into tasks.',
      icon: Plus,
      target: '[data-tour="add-node"]',
      position: 'top-right',
    },
    {
      id: 'view-modes',
      title: 'Different Perspectives',
      description: 'Switch between Overview, Progress, and Timeline views to see your plan from different angles.',
      icon: GitBranch,
      target: '[data-tour="view-controls"]',
      position: 'top-left',
    },
    {
      id: 'share',
      title: 'Collaborate with Others',
      description: 'Share your plan with team members, set permissions, and work together in real-time.',
      icon: Share2,
      target: '[data-tour="share-button"]',
      position: 'top-right',
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'That\'s the basics! Remember, you can always press "?" for keyboard shortcuts or access help from the menu.',
      icon: CheckCircle,
      position: 'center',
    },
  ];

  useEffect(() => {
    // Check if user has seen the tour before
    const tourSeen = localStorage.getItem('agent_planner_tour_completed');
    if (tourSeen) {
      setHasSeenTour(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('agent_planner_tour_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('agent_planner_tour_skipped', 'true');
    onComplete();
  };

  if (!isVisible || hasSeenTour) {
    return null;
  }

  const currentTourStep = tourSteps[currentStep];
  const Icon = currentTourStep.icon;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity" />
      
      {/* Tour Modal */}
      <div className={`
        fixed z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md
        ${currentTourStep.position === 'center' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''}
        ${currentTourStep.position === 'top-right' ? 'top-20 right-8' : ''}
        ${currentTourStep.position === 'top-left' ? 'top-20 left-8' : ''}
        ${currentTourStep.position === 'bottom-right' ? 'bottom-20 right-8' : ''}
        ${currentTourStep.position === 'bottom-left' ? 'bottom-20 left-8' : ''}
      `}>
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {currentTourStep.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {currentTourStep.description}
          </p>

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-6">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${index === currentStep ? 'w-8 bg-blue-600 dark:bg-blue-400' : ''}
                  ${index < currentStep ? 'bg-blue-600 dark:bg-blue-400' : ''}
                  ${index > currentStep ? 'bg-gray-300 dark:bg-gray-600' : ''}
                `}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3 w-full">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}

            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip Tour
            </button>

            <button
              onClick={handleNext}
              className={`
                flex items-center gap-1 px-6 py-2 rounded-lg font-medium transition-all
                ${currentStep === tourSteps.length - 1 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Target Highlighter */}
      {currentTourStep.target && (
        <div className="fixed inset-0 z-[9997] pointer-events-none">
          <style>{`
            ${currentTourStep.target} {
              position: relative;
              z-index: 9998;
              box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
              border-radius: 8px;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default OnboardingTour;
