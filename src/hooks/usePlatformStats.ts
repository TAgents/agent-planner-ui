import { useQuery } from 'react-query';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface PlatformStats {
  users: number;
  plans: number;
  publicPlans: number;
}

const FALLBACK_STATS: PlatformStats = {
  users: 6,
  plans: 24,
  publicPlans: 3,
};

export const usePlatformStats = () => {
  return useQuery<PlatformStats>(
    ['platformStats'],
    async () => {
      try {
        const { data } = await axios.get(`${API_URL}/stats`);
        if (data && typeof data.users === 'number') {
          return data;
        }
        return FALLBACK_STATS;
      } catch {
        return FALLBACK_STATS;
      }
    },
    {
      staleTime: 5 * 60 * 1000,
      retry: false,
      placeholderData: FALLBACK_STATS,
    }
  );
};
