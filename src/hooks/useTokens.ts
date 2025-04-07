import { useState, useEffect, useCallback } from 'react';
import { ApiToken, TokenPermission } from '../types';
import { tokenService } from '../services/api';

export const useTokens = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<ApiToken | null>(null);

  // Fetch all tokens
  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenService.getTokens();
      console.log('Tokens API response:', response);
      
      if (Array.isArray(response)) {
        // Handle direct array response
        console.log('Setting tokens (direct array):', response);
        setTokens(response);
      } else if ('data' in response && Array.isArray(response.data)) {
        // Handle wrapped array response
        console.log('Setting tokens (wrapped array):', response.data);
        setTokens(response.data);
      } else {
        // Handle unexpected response format
        console.log('Unexpected response format:', response);
        setTokens([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API tokens');
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new token
  const createToken = useCallback(async (name: string, permissions: TokenPermission[] = ['read']) => {
    setLoading(true);
    setError(null);
    setNewToken(null);
    
    try {
      console.log('Creating token with name:', name, 'and permissions:', permissions);
      const response = await tokenService.createToken(name, permissions);
      console.log('Create token response:', response);
      
      // Handle different response formats
      if (response && 'data' in response && response.data) {
        console.log('Setting new token from response.data:', response.data);
        setNewToken(response.data);
      } else {
        console.log('Setting new token directly from response:', response);
        setNewToken(response as ApiToken);
      }
      
      // Refresh the token list - wait a moment to ensure DB consistency
      setTimeout(() => {
        console.log('Refreshing token list after creation');
        fetchTokens();
      }, 500);
      
      return 'data' in response ? response.data : response;
    } catch (err: any) {
      setError(err.message || 'Failed to create API token');
      console.error('Error creating token:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTokens]);

  // Revoke a token
  const revokeToken = useCallback(async (tokenId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await tokenService.revokeToken(tokenId);
      
      // Update the local state to remove the revoked token
      setTokens(prevTokens => prevTokens.filter(token => token.id !== tokenId));
    } catch (err: any) {
      setError(err.message || 'Failed to revoke API token');
      console.error('Error revoking token:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear the displayed new token after it's been viewed
  const clearNewToken = useCallback(() => {
    setNewToken(null);
  }, []);

  // Load tokens on initial render
  useEffect(() => {
    console.log('useTokens hook mounted, fetching tokens...');
    fetchTokens();
    
    // Set up an interval to refresh tokens periodically (every 30 seconds)
    const intervalId = setInterval(() => {
      console.log('Refreshing tokens on interval...');
      fetchTokens();
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchTokens]);

  return {
    tokens,
    loading,
    error,
    newToken,
    fetchTokens,
    createToken,
    revokeToken,
    clearNewToken
  };
};

export default useTokens;
