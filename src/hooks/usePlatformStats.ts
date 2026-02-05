import { useQuery } from 'react-query';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface PlatformStats {
  users: number;
  plans: number;
  publicPlans: number;
}

export const usePlatformStats = () => {
  return useQuery<PlatformStats>(
    ['platformStats'],
    async () => {
      const { data } = await axios.get(`${API_URL}/stats`);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      retry: false,
    }
  );
};
