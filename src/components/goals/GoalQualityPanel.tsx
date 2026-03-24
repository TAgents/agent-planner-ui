import React from 'react';
import { useQuery } from 'react-query';
import { goalBdiService } from '../../services/api';
import { CheckCircle, Circle, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';

interface GoalQualityPanelProps {
  goalId: string;
}

const dimensionLabels: Record<string, string> = {
  clarity: 'Clarity',
  measurability: 'Measurability',
  actionability: 'Actionability',
  knowledge_grounding: 'Knowledge',
  commitment: 'Commitment',
};

const GoalQualityPanel: React.FC<GoalQualityPanelProps> = ({ goalId }) => {
  const { data, isLoading } = useQuery(
    ['goal-quality', goalId],
    () => goalBdiService.getQuality(goalId),
    { staleTime: 30000 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Assessing goal quality...
      </div>
    );
  }

  if (!data) return null;

  const { score, dimensions, suggestions } = data;
  const pct = Math.round(score * 100);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Goal Quality</h3>
        <span className={`text-sm font-bold ${
          pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
          pct >= 50 ? 'text-amber-600 dark:text-amber-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {pct}%
        </span>
      </div>

      {/* Dimensions */}
      <div className="px-5 py-3 space-y-2">
        {Object.entries(dimensions || {}).map(([key, dim]: [string, any]) => (
          <div key={key} className="flex items-center gap-2">
            {dim.score >= 0.7 ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : dim.score >= 0.4 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">
              {dimensionLabels[key] || key}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
              {dim.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium mb-1">
            <Lightbulb className="w-3 h-3" />
            Suggestions
          </div>
          {suggestions.map((s: string, i: number) => (
            <p key={i} className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pl-4">
              {s}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};

export default GoalQualityPanel;
