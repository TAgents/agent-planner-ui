import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  Loader2,
  AlertCircle,
  Check,
  Target,
  FolderTree,
  FileText,
  Activity,
  BookOpen,
} from 'lucide-react';
import { useGoals } from '../../hooks/useGoals';

interface ClonePlanModalProps {
  plan: {
    id: string;
    title: string;
    description?: string;
    owner?: {
      name?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

interface CloneOptions {
  structure: boolean;
  descriptions: boolean;
  status: boolean;
  knowledge: boolean;
  logs: boolean;
}

const ClonePlanModal: React.FC<ClonePlanModalProps> = ({ plan, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { goals } = useGoals();

  const [formData, setFormData] = useState({
    title: `${plan.title} (copy)`,

    goal_id: '',
  });

  const [options, setOptions] = useState<CloneOptions>({
    structure: true,
    descriptions: true,
    status: false,
    knowledge: false,
    logs: false,
  });

  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: `${plan.title} (copy)`,
    
        goal_id: '',
      });
      setOptions({
        structure: true,
        descriptions: true,
        status: false,
        knowledge: false,
        logs: false,
      });
      setError(null);
    }
  }, [isOpen, plan.title]);

  const handleClone = async () => {
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsCloning(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://api.agentplanner.io'}/plans/${plan.id}/clone`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            goal_id: formData.goal_id || undefined,
            include_structure: options.structure,
            include_descriptions: options.descriptions,
            include_status: options.status,
            include_knowledge: options.knowledge,
            include_logs: options.logs,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to clone plan');
      }

      const newPlan = await response.json();
      onClose();
      navigate(`/app/plans/${newPlan.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to clone plan');
    } finally {
      setIsCloning(false);
    }
  };

  if (!isOpen) return null;

  const toggleOption = (key: keyof CloneOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Clone Plan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a copy in your workspace
              </p>
            </div>
          </div>

          {/* Source Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Cloning from
            </div>
            <div className="font-medium text-gray-900 dark:text-white mt-1">{plan.title}</div>
            {plan.owner?.name && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                by {plan.owner.name}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Plan Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter plan title"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Target className="w-4 h-4 inline mr-1" />
                Link to Goal (optional)
              </label>
              <select
                value={formData.goal_id}
                onChange={(e) => setFormData({ ...formData, goal_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No goal</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Clone Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What to include
              </label>
              <div className="space-y-2">
                <CloneOption
                  icon={<FolderTree className="w-4 h-4" />}
                  label="Structure"
                  description="Phases, tasks, and milestones"
                  checked={options.structure}
                  onChange={() => toggleOption('structure')}
                  disabled
                />
                <CloneOption
                  icon={<FileText className="w-4 h-4" />}
                  label="Descriptions"
                  description="Task descriptions and instructions"
                  checked={options.descriptions}
                  onChange={() => toggleOption('descriptions')}
                />
                <CloneOption
                  icon={<Activity className="w-4 h-4" />}
                  label="Progress Status"
                  description="Keep completion status"
                  checked={options.status}
                  onChange={() => toggleOption('status')}
                />
                <CloneOption
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Knowledge"
                  description="Knowledge entries"
                  checked={options.knowledge}
                  onChange={() => toggleOption('knowledge')}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isCloning}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClone}
              disabled={isCloning || !formData.title.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isCloning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cloning...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Clone Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clone option checkbox component
const CloneOption: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}> = ({ icon, label, description, checked, onChange, disabled }) => (
  <label
    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
      checked
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="sr-only"
    />
    <div
      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
        checked
          ? 'bg-blue-600 text-white'
          : 'border-2 border-gray-300 dark:border-gray-600'
      }`}
    >
      {checked && <Check className="w-3 h-3" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
        {icon}
        {label}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
    </div>
  </label>
);

export default ClonePlanModal;
