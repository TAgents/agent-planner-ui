import React from 'react';
import { Sparkles, Loader2, Keyboard } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isGenerating: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  onKeyDown,
  isGenerating
}) => {
  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="relative">
          <textarea
            className="w-full min-h-[120px] px-4 py-3 text-lg bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 resize-none placeholder-gray-400"
            placeholder="Example: Create a mobile app for tracking daily habits with user authentication, progress charts, and reminder notifications..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
          />
          
          <div className="absolute bottom-3 right-3 text-sm text-gray-400">
            {prompt.length}/1000
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:flex items-center">
            <Keyboard className="w-4 h-4 inline mr-1" />
            Press <kbd className="px-2 py-1 mx-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to generate
          </div>
          
          <button
            onClick={onGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed ml-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating plan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
