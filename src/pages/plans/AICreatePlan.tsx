import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, Loader2, Keyboard, Brain, CheckCircle, Circle,
  Smartphone, Rocket, GraduationCap, Target, ChevronRight, ChevronDown,
  Layers, Clock
} from 'lucide-react';
import { useAIPlanGeneration } from '../../hooks/useAIPlanGeneration';
import GenerationModal from '../../components/plans/GenerationModal';
import PromptInput from '../../components/plans/PromptInput';
import SuggestedPrompts from '../../components/plans/SuggestedPrompts';

const AICreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [complexity, setComplexity] = useState<'simple' | 'detailed' | 'comprehensive'>('detailed');
  const [timeline, setTimeline] = useState('auto');
  
  const { generatePlan, isGenerating, currentStep, generationSteps, error } = useAIPlanGeneration();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    generatePlan({
      prompt,
      options: { complexity, timeline }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && prompt.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <>
          <div>
            <button 
              onClick={() => navigate('/plans')}
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Plans
            </button>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-1" />
                AI-Powered
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                What would you like to plan?
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Describe your project or goal, and I'll create a detailed plan for you
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">
                <strong>Error:</strong> {error instanceof Error ? error.message : 'Failed to generate plan. Please try again.'}
              </p>
            </div>
          )}

          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            onKeyDown={handleKeyDown}
            isGenerating={isGenerating}
          />

          <div className="mt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center transition-colors"
            >
              {showAdvanced ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              Advanced options
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Layers className="w-4 h-4 inline mr-1" />
                    Plan Detail Level
                  </label>
                  <div className="flex gap-2">
                    {(['simple', 'detailed', 'comprehensive'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setComplexity(level)}
                        className={`px-3 py-1 rounded-lg border capitalize transition-all ${
                          complexity === level
                            ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Estimated Timeline
                  </label>
                  <select 
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="1week">1 week</option>
                    <option value="1month">1 month</option>
                    <option value="3months">3 months</option>
                    <option value="6months">6 months</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <SuggestedPrompts onSelectPrompt={setPrompt} />
        </>
      </div>

      {isGenerating && (
        <GenerationModal 
          currentStep={currentStep}
          steps={generationSteps}
        />
      )}
    </div>
  );
};

export default AICreatePlan;
