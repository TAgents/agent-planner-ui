import { SuccessMetric } from '../services/api';

/**
 * Maximum number of metrics to display in a goal card grid
 */
export const MAX_VISIBLE_METRICS = 4;

/**
 * Calculate the progress percentage for a single metric
 * @param metric - The success metric to calculate progress for
 * @returns Progress percentage (0-100), capped at 100
 */
export const calculateMetricProgress = (metric: SuccessMetric): number => {
  const target = parseFloat(metric.target) || 0;
  const current = parseFloat(metric.current) || 0;
  
  if (target <= 0) return 0;
  
  const progress = (current / target) * 100;
  return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
};

/**
 * Calculate the overall progress for a goal based on all its success metrics
 * @param metrics - Array of success metrics
 * @returns Overall progress percentage (0-100), averaged across all metrics
 */
export const calculateOverallProgress = (metrics?: SuccessMetric[]): number => {
  if (!metrics?.length) return 0;
  
  const total = metrics.reduce((sum, metric) => {
    return sum + calculateMetricProgress(metric);
  }, 0);
  
  return Math.round(total / metrics.length);
};

/**
 * Check if a metric is complete (progress >= 100%)
 * @param metric - The success metric to check
 * @returns True if the metric is complete
 */
export const isMetricComplete = (metric: SuccessMetric): boolean => {
  return calculateMetricProgress(metric) >= 100;
};

/**
 * Get the color class for a progress bar based on percentage
 * @param progress - Progress percentage (0-100)
 * @returns Tailwind CSS class for the progress bar color
 */
export const getProgressColorClass = (progress: number): string => {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  return 'bg-yellow-500';
};
