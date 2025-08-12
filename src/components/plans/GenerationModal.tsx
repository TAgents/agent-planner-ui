import React from 'react';
import { Brain, CheckCircle, Circle, Loader2 } from 'lucide-react';

interface GenerationStep {
  label: string;
  completed: boolean;
  active: boolean;
}

interface GenerationModalProps {
  currentStep: number;
  steps: GenerationStep[];
}

const GenerationModal: React.FC<GenerationModalProps> = ({ currentStep, steps }) => {
  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Creating your plan...
          </h3>
          
          <div className="mt-6 space-y-3 text-left">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div key={index} className="flex items-center">
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-5 h-5 text-blue-500 mr-3 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 mr-3" />
                  )}
                  <span className={`text-sm ${status === 'active' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationModal;
