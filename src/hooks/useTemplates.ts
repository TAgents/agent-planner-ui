import { useQuery } from 'react-query';

export interface Template {
  id: string;
  name: string;
  description: string;
  category?: string;
  structure?: any;
  created_at?: string;
}

// Templates API - placeholder until backend supports templates
const templatesApi = {
  list: async (): Promise<Template[]> => {
    // Templates endpoint might not exist yet - return empty array
    // This will be updated when the backend templates API is implemented
    return [];
  },
  
  get: async (id: string): Promise<Template | null> => {
    // Placeholder
    return null;
  },
};

// Hook to get all templates
export const useTemplates = () => {
  return useQuery<Template[]>('templates', templatesApi.list, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if templates API doesn't exist
  });
};

// Hook to get a specific template
export const useTemplate = (id: string) => {
  return useQuery<Template | null>(
    ['template', id],
    () => templatesApi.get(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export default useTemplates;
