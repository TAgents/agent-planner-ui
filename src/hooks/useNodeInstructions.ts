import { useState, useCallback } from 'react';
import { useNodes } from './useNodes';

export const useNodeInstructions = (planId: string, nodeId: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateNode } = useNodes(planId);

  const updateInstructions = useCallback(async (instructions: string): Promise<void> => {
    setIsUpdating(true);
    setError(null);

    try {
      await updateNode.mutateAsync({
        nodeId,
        data: {
          agent_instructions: instructions,
        },
      });
      
      // Success - the updateNode mutation will handle cache invalidation
      console.log('Agent instructions updated successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent instructions';
      setError(errorMessage);
      console.error('Error updating agent instructions:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [nodeId, updateNode]);

  return {
    updateInstructions,
    isUpdating: isUpdating || updateNode.isLoading,
    error,
  };
};
