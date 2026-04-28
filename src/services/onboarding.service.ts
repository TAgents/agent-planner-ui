/**
 * Onboarding service — wraps the /onboarding/* endpoints powering the
 * connect-flow UX. Mirrors the response shapes shipped in
 * agent-planner@feat/ui-redesign-v1-backend → src/routes/onboarding.routes.js.
 */
import { request } from './api-client';

export type TestConnectionCard = {
  label: string;
  value: string;
  sub?: string;
};

export type TestConnectionResponse =
  | {
      ok: true;
      briefing: {
        cards: TestConnectionCard[];
        summary: {
          goals_count: number;
          goal_health: { on_track: number; at_risk: number; stale: number; total: number };
          plans_count: number | null;
          decisions_count: number;
          beliefs_count: number | string | null;
        };
      };
      provenance: {
        endpoint: string;
        server_time_ms: number;
        client_label: string | null;
      };
    }
  | {
      ok: false;
      error: {
        code: string;
        title: string;
        plain: string;
        technical?: string;
      };
    };

export type RecentToolCall = {
  id: string;
  token_id: string | null;
  organization_id: string | null;
  tool_name: string;
  client_label: string | null;
  user_agent: string | null;
  ip: string | null;
  duration_ms: number | null;
  response_status: number | null;
  created_at: string;
};

export type RecentCallsResponse = {
  calls: RecentToolCall[];
  fetched_at: string;
};

export type McpbReleaseMeta = {
  version: string;
  url: string;
  sha256: string | null;
  published_at: string | null;
  min_claude_desktop_version: string;
};

export const onboardingService = {
  testConnection: () =>
    request<TestConnectionResponse>({ url: '/onboarding/test-connection', method: 'post' }),

  recentCalls: (params?: { tokenId?: string; limit?: number }) =>
    request<RecentCallsResponse>({
      url: '/onboarding/recent-calls',
      method: 'get',
      params: {
        token_id: params?.tokenId,
        limit: params?.limit,
      },
    }),

  mcpbLatest: () =>
    request<McpbReleaseMeta>({ url: '/onboarding/releases/mcpb/latest', method: 'get' }),
};
