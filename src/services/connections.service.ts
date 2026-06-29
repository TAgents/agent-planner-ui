/**
 * Connections Service — OAuth connector "Connected apps".
 *
 * Lists the external apps (Claude, ChatGPT, …) that hold an active connection
 * and can act as the user through the AgentPlanner MCP connector, and lets the
 * user disconnect one (revoking its refresh token). This is distinct from API
 * tokens (`tokenService`), which are the manual/stdio path.
 */
import { api } from './api-client';

export interface ConnectedAppCapabilities {
  /** Plain-language summary, e.g. "Can read and update your AgentPlanner workspace". */
  summary: string;
  /** Resource areas the app can read (plans, goals, tasks, knowledge, decisions). */
  read: string[];
  /** Resource areas the app can change. */
  write: string[];
}

export interface ConnectedApp {
  client_id: string;
  name: string;
  /** Display connector type derived from the client name: Claude, ChatGPT, … */
  type: string;
  status: string;
  /** Stable across refresh-token rotation. */
  connected_at: string;
  expires_at: string;
  scopes: string[];
  capabilities: ConnectedAppCapabilities;
}

export const connectionsService = {
  getConnectedApps: (): Promise<ConnectedApp[]> =>
    api.get('/connections/apps').then((r) => r.data),

  disconnectApp: (clientId: string): Promise<void> =>
    api.delete(`/connections/apps/${encodeURIComponent(clientId)}`).then(() => undefined),
};
