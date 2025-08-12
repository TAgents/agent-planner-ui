import { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import aiPlanService from '../services/aiPlanService';
import { usePlans } from './usePlans';

interface GenerationStep {
  label: string;
  completed: boolean;
  active: boolean;
}

export const useAIPlanGeneration = () => {
  const navigate = useNavigate();
  const { createPlan } = usePlans();
  const [currentStep, setCurrentStep] = useState(0);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { label: "Understanding your requirements", completed: false, active: false },
    { label: "Structuring project phases", completed: false, active: false },
    { label: "Creating tasks and milestones", completed: false, active: false },
    { label: "Setting up timeline", completed: false, active: false },
    { label: "Finalizing your plan", completed: false, active: false }
  ]);

  const generatePlanMutation = useMutation(
    async ({ prompt, options }: { prompt: string; options: any }) => {
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

      // Step 1: Understanding requirements
      updateStep(0);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Structuring phases
      updateStep(1);
      const aiResponse = await aiPlanService.generatePlan({ prompt, options });
      
      // Step 3: Creating tasks
      updateStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Setting timeline
      updateStep(3);
      const planData = await aiPlanService.createPlanFromAI(aiResponse);
      
      // Step 5: Finalizing
      updateStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create the plan using existing mutation
      const result = await createPlan.mutateAsync(planData);
      
      return result;
    },
    {
      onSuccess: (data) => {
        const planId = data?.data?.id || data?.id;
        if (planId) {
          navigate(`/plans/${planId}`);
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
