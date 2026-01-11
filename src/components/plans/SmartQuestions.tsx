import React from 'react';
import { ChevronDown, ChevronRight, Target, Clock, Users } from 'lucide-react';
import { SmartQuestion } from '../../services/api';

interface QuestionAnswer {
  questionId: string;
  answer: string;
}

interface SmartQuestionsProps {
  questions: SmartQuestion[];
  answers: QuestionAnswer[];
  onAnswerChange: (questionId: string, answer: string) => void;
  isLoading?: boolean;
}

const categoryIcons = {
  scope: Target,
  constraints: Clock,
  context: Users,
};

const categoryLabels = {
  scope: 'Scope & Goals',
  constraints: 'Constraints',
  context: 'Context',
};

const categoryColors = {
  scope: 'blue',
  constraints: 'amber',
  context: 'purple',
};

const SmartQuestions: React.FC<SmartQuestionsProps> = ({
  questions,
  answers,
  onAnswerChange,
  isLoading = false,
}) => {
  const [expandedQuestions, setExpandedQuestions] = React.useState<Set<string>>(
    new Set(questions.map(q => q.id))
  );

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const getAnswer = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.answer || '';
  };

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          Analyzing your project idea...
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  // Group questions by category
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, SmartQuestion[]>);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Help us understand your project better
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Optional - skip any you prefer
        </span>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const label = categoryLabels[category as keyof typeof categoryLabels];
          const color = categoryColors[category as keyof typeof categoryColors];

          return (
            <div key={category} className="space-y-2">
              <div className={`flex items-center gap-2 text-xs font-medium text-${color}-600 dark:text-${color}-400`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>

              {categoryQuestions.map(question => {
                const isExpanded = expandedQuestions.has(question.id);
                const answer = getAnswer(question.id);
                const hasAnswer = answer.trim().length > 0;

                return (
                  <div
                    key={question.id}
                    className={`border rounded-lg transition-all ${
                      hasAnswer
                        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleQuestion(question.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 pr-4">
                        {question.question}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasAnswer && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Answered
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <textarea
                          value={answer}
                          onChange={(e) => onAnswerChange(question.id, e.target.value)}
                          placeholder={question.placeholder}
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Your answers help create a more detailed and accurate plan
      </p>
    </div>
  );
};

export default SmartQuestions;
