import React from 'react';
import { Smartphone, Rocket, GraduationCap, Target } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  const suggestedPrompts = [
    {
      icon: <Smartphone className="w-5 h-5 text-blue-600" />,
      title: "Mobile App Development",
      description: "Plan a complete mobile application from concept to launch",
      prompt: "Create a comprehensive plan for developing a cross-platform mobile app including market research, design, development, testing, and launch strategy"
    },
    {
      icon: <Rocket className="w-5 h-5 text-purple-600" />,
      title: "Product Launch",
      description: "Organize a successful product launch campaign",
      prompt: "Plan a product launch including pre-launch buzz, marketing campaigns, PR strategy, and post-launch analysis"
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-green-600" />,
      title: "Online Course Creation",
      description: "Build and launch an educational online course",
      prompt: "Create a plan for developing an online course including curriculum design, content creation, platform selection, and student engagement strategies"
    },
    {
      icon: <Target className="w-5 h-5 text-orange-600" />,
      title: "Marketing Campaign",
      description: "Design a multi-channel marketing campaign",
      prompt: "Plan a comprehensive marketing campaign including target audience analysis, channel strategy, content calendar, and ROI measurement"
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Need inspiration? Try one of these:
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestedPrompts.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(suggestion.prompt)}
            className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 text-left"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                {suggestion.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
