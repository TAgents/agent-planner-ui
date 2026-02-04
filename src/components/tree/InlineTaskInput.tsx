import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';

interface InlineTaskInputProps {
  onSubmit: (title: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  depth?: number;
}

export const InlineTaskInput: React.FC<InlineTaskInputProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'New task title...',
  depth = 0
}) => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedValue);
      setValue(''); // Clear for next input
      // Keep input open for adding more tasks
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    // Only cancel if empty and not submitting
    if (!value.trim() && !isSubmitting) {
      // Small delay to allow click on submit button
      setTimeout(() => {
        if (!value.trim()) {
          onCancel();
        }
      }, 150);
    }
  };

  const indentPx = depth * 24;

  return (
    <div 
      className="flex items-center gap-2 py-1.5 px-3 animate-fadeIn"
      style={{ paddingLeft: `${indentPx + 36}px` }}
    >
      <div className="flex-shrink-0 w-4 flex items-center justify-center">
        <Plus className="w-3.5 h-3.5 text-gray-400" />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={isSubmitting}
        className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          placeholder-gray-400 dark:placeholder-gray-500
          text-gray-900 dark:text-white"
      />
      
      {isSubmitting ? (
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
      ) : (
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors flex-shrink-0"
          title="Cancel (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default InlineTaskInput;
