import { useCallback, useState } from 'react';
import { useQuery } from 'react-query';
import {
  onboardingService,
  type TestConnectionResponse,
  type McpbReleaseMeta,
  type RecentCallsResponse,
} from '../services/onboarding.service';

export type TestConnectionState = 'idle' | 'loading' | 'success' | 'error';

/**
 * useTestConnection — manual trigger model.
 *
 * Doesn't run on mount; the wizard / connect pages call `run()` when
 * the user presses "Test connection". Resolves the latest TestConnectionResponse
 * + a derived state machine for `<TestPanel state=...>`.
 */
export function useTestConnection() {
  const [state, setState] = useState<TestConnectionState>('idle');
  const [result, setResult] = useState<TestConnectionResponse | null>(null);

  const run = useCallback(async () => {
    setState('loading');
    try {
      const res = await onboardingService.testConnection();
      setResult(res);
      setState(res.ok ? 'success' : 'error');
      return res;
    } catch (err: any) {
      // Network-level failure (server unreachable, CORS, etc.) — fall
      // back to a synthetic error envelope so the UI can render.
      const synthetic: TestConnectionResponse = {
        ok: false,
        error: {
          code: 'NETWORK',
          title: 'Could not reach the server',
          plain:
            'Your browser could not reach AgentPlanner. Check your network connection or status page and try again.',
          technical: err?.message || String(err),
        },
      };
      setResult(synthetic);
      setState('error');
      return synthetic;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
  }, []);

  return { state, result, run, reset };
}

/** GET /onboarding/releases/mcpb/latest — bundle metadata for the Claude Desktop one-click install. */
export function useMcpbRelease() {
  return useQuery<McpbReleaseMeta>(
    ['onboarding', 'mcpb-release'],
    () => onboardingService.mcpbLatest(),
    { staleTime: 5 * 60 * 1000 },
  );
}

/** GET /onboarding/recent-calls — recent tool_calls for "last call: 12s ago" liveness. */
export function useRecentCalls(opts?: { tokenId?: string; pollMs?: number; enabled?: boolean }) {
  return useQuery<RecentCallsResponse>(
    ['onboarding', 'recent-calls', opts?.tokenId ?? null],
    () => onboardingService.recentCalls({ tokenId: opts?.tokenId }),
    {
      enabled: opts?.enabled !== false,
      refetchInterval: opts?.pollMs ?? 10_000,
      staleTime: 0,
    },
  );
}
