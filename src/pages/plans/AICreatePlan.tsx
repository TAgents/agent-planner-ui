import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, ChevronDown,
  Layers, Clock, Sparkles
} from 'lucide-react';
import { useAIPlanGeneration } from '../../hooks/useAIPlanGeneration';
import GenerationModal from '../../components/plans/GenerationModal';
import PromptInput from '../../components/plans/PromptInput';
import SuggestedPrompts from '../../components/plans/SuggestedPrompts';
import SmartQuestions from '../../components/plans/SmartQuestions';
import { aiService, SmartQuestion } from '../../services/api';

interface QuestionAnswer {
  questionId: string;
  answer: string;
}

const AICreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [complexity, setComplexity] = useState<'simple' | 'detailed' | 'comprehensive'>('detailed');
  const [timeline, setTimeline] = useState('auto');

  // Smart questions state
  const [questions, setQuestions] = useState<SmartQuestion[]>([]);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const { generatePlan, isGenerating, currentStep, generationSteps, error } = useAIPlanGeneration();

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const result = await aiService.analyzePrompt(prompt);
      if (result.success && result.questions) {
        setQuestions(result.questions);
        setAnswers(result.questions.map(q => ({ questionId: q.id, answer: '' })));
        setHasAnalyzed(true);
      }
    } catch (err) {
      console.error('Failed to analyze prompt:', err);
      setAnalyzeError('Failed to analyze your prompt. You can still generate a plan.');
      // Allow user to proceed anyway
      setHasAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev =>
      prev.map(a => (a.questionId === questionId ? { ...a, answer } : a))
    );
  };

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    // Reset analysis when prompt changes significantly
    if (hasAnalyzed && newPrompt !== prompt) {
      setHasAnalyzed(false);
      setQuestions([]);
      setAnswers([]);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    // Build question answers for context
    const questionAnswers = questions.length > 0
      ? questions.map(q => ({
          question: q.question,
          answer: answers.find(a => a.questionId === q.id)?.answer || ''
        })).filter(qa => qa.answer.trim().length > 0)
      : [];

    generatePlan({
      prompt,
      options: { complexity, timeline, questionAnswers }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && prompt.trim()) {
      if (hasAnalyzed) {
        handleGenerate();
      } else {
        handleAnalyze();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => navigate('/app/plans')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Plans
        </button>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Plan</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Describe your project and let AI generate a detailed plan for you
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      <strong>Error:</strong> {error instanceof Error ? error.message : 'Failed to generate plan. Please try again.'}
                    </p>
                  </div>
                )}

                <PromptInput
                  prompt={prompt}
                  setPrompt={handlePromptChange}
                  onGenerate={hasAnalyzed ? handleGenerate : handleAnalyze}
                  onKeyDown={handleKeyDown}
                  isGenerating={isGenerating || isAnalyzing}
                  buttonText={hasAnalyzed ? 'Generate Plan' : 'Analyze'}
                  buttonIcon={hasAnalyzed ? undefined : <Sparkles className="w-4 h-4" />}
                  loadingText={isAnalyzing ? 'Analyzing...' : undefined}
                />

                {analyzeError && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      {analyzeError}
                    </p>
                  </div>
                )}

                {(isAnalyzing || (hasAnalyzed && questions.length > 0)) && (
                  <SmartQuestions
                    questions={questions}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    isLoading={isAnalyzing}
                  />
                )}

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
                    <div className="mt-4 space-y-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
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
                              className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-all ${
                                complexity === level
                                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                                  : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300'
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
                          className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm"
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

                {!hasAnalyzed && (
                  <SuggestedPrompts onSelectPrompt={handlePromptChange} />
                )}
          </div>
        </div>
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
