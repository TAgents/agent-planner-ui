import { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface GenerationStep {
  label: string;
  completed: boolean;
  active: boolean;
}

export const useAIPlanGeneration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { label: "Analyzing your requirements", completed: false, active: false },
    { label: "Generating plan structure", completed: false, active: false },
    { label: "Creating phases and tasks", completed: false, active: false },
    { label: "Setting up dependencies", completed: false, active: false },
    { label: "Finalizing your plan", completed: false, active: false }
  ]);

  const generatePlanMutation = useMutation(
    async ({ prompt, options }: { prompt: string; options: { complexity?: string; timeline?: string; visibility?: string; questionAnswers?: Array<{ question: string; answer: string }> } }) => {
      // Update steps during generation
      const updateStep = (stepIndex: number) => {
        setCurrentStep(stepIndex);
        setGenerationSteps(steps =>
          steps.map((step, index) => ({
            ...step,
            completed: index < stepIndex,
            active: index === stepIndex
          }))
        );
      };

      // Step 1: Analyzing requirements
      updateStep(0);

      // Step 2: Generating plan structure (send to backend)
      updateStep(1);

      // Call the new backend endpoint that triggers headless Claude Code
      const response = await api.plans.generateWithAI(prompt, {
        visibility: options.visibility || 'private',
        timeout: 300000, // 5 minutes
        questionAnswers: options.questionAnswers
      });

      // Step 3: Creating phases and tasks
      updateStep(2);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Setting up dependencies
      updateStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Finalizing
      updateStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));

      return response;
    },
    {
      onSuccess: (data) => {
        // Backend returns { success: true, planId: "...", title: "...", message: "..." }
        if (data?.planId) {
          navigate(`/app/plans/${data.planId}`);
        }
      },
      onError: (error) => {
        console.error('AI generation error:', error);
        // Reset steps on error
        setCurrentStep(0);
        setGenerationSteps(steps => 
          steps.map(step => ({ ...step, completed: false, active: false }))
        );
      }
    }
  );

  return {
    generatePlan: generatePlanMutation.mutate,
    isGenerating: generatePlanMutation.isLoading,
    error: generatePlanMutation.error,
    currentStep,
    generationSteps
  };
};
