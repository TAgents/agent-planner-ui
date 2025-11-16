import { useQuery } from 'react-query';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export interface UsePublicPlansParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  hasGithubLink?: boolean;
  sortBy?: 'recent' | 'alphabetical' | 'completion' | 'stars';
}

export interface PublicPlan {
  id: string;
  title: string;
  description?: string;
  owner: {
    id: string;
    name: string;
    email: string;
    github_username?: string;
    avatar_url?: string;
  };
  github_repo_owner?: string;
  github_repo_name?: string;
  updated_at: string;
  created_at: string;
  status: string;
  task_count: number;
  completed_count: number;
  completion_percentage: number;
  star_count: number;
  view_count?: number;
  visibility: string;
}

export interface PublicPlansResponse {
  plans: PublicPlan[];
  total: number;
  limit: number;
  page: number;
  total_pages: number;
}

export const usePublicPlans = (params: UsePublicPlansParams = {}) => {
  return useQuery<PublicPlansResponse>(
    ['publicPlans', params],
    async () => {
      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());

      // Add search param
      if (params.search && params.search.trim()) {
        queryParams.set('search', params.search.trim());
      }

      // Add filter params
      if (params.status) queryParams.set('status', params.status);
      if (params.hasGithubLink !== undefined) {
        queryParams.set('hasGithubLink', params.hasGithubLink.toString());
      }

      // Add sort param
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);

      const url = `${API_URL}/plans/public${queryParams.toString() ? `?${queryParams}` : ''}`;
      const { data } = await axios.get<PublicPlansResponse>(url);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      retry: 1,
      keepPreviousData: true, // Keep previous data while fetching new page for better UX
    }
  );
};
