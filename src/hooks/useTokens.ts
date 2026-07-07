import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ApiToken, TokenPermission } from '../types';
import { tokenService } from '../services/api';
import { getSession } from '../services/api-client';

const TOKENS_KEY = 'api-tokens';

function unwrap(response: any): ApiToken[] {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

/**
 * API tokens via React Query — one shared cache across all mounts
 * (SettingsLayout, ConnectAgentBanner, IntegrationsSettings…), so the list
 * is fetched once per staleTime instead of per component.
 */
export const useTokens = () => {
  const qc = useQueryClient();
  const [newToken, setNewToken] = useState<ApiToken | null>(null);
  const userId = getSession()?.user?.id;
  const queryKey = [TOKENS_KEY, userId];

  const query = useQuery<ApiToken[], any>(
    queryKey,
    async () => unwrap(await tokenService.getTokens()),
    { enabled: !!userId, staleTime: 30_000 },
  );

  const createMutation = useMutation(
    async ({ name, permissions }: { name: string; permissions?: TokenPermission[] }) => {
      const response: any = await tokenService.createToken(name, permissions);
      return (response && response.data ? response.data : response) as ApiToken;
    },
    {
      onSuccess: (token) => {
        setNewToken(token);
        qc.invalidateQueries(TOKENS_KEY);
      },
    },
  );

  const revokeMutation = useMutation((tokenId: string) => tokenService.revokeToken(tokenId), {
    onSuccess: (_data, tokenId) => {
      qc.setQueryData<ApiToken[]>(queryKey, (prev) => (prev || []).filter((t) => t.id !== tokenId));
    },
  });

  const createToken = useCallback(
    (name: string, permissions?: TokenPermission[]) => createMutation.mutateAsync({ name, permissions }),
    [createMutation],
  );
  const revokeToken = useCallback(
    async (tokenId: string) => {
      await revokeMutation.mutateAsync(tokenId);
    },
    [revokeMutation],
  );
  const fetchTokens = useCallback(async () => {
    await query.refetch();
  }, [query]);
  const clearNewToken = useCallback(() => setNewToken(null), []);

  const errOf = (e: any) => e?.message || null;

  return {
    tokens: query.data || [],
    loading: query.isLoading || createMutation.isLoading || revokeMutation.isLoading,
    error:
      errOf(query.error) ||
      errOf(createMutation.error) ||
      errOf(revokeMutation.error),
    newToken,
    fetchTokens,
    createToken,
    revokeToken,
    clearNewToken,
  };
};

export default useTokens;
