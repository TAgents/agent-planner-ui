/**
 * React Query hooks for the OAuth connector "Connected apps" surface.
 */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { connectionsService, type ConnectedApp } from '../services/connections.service';

export const CONNECTED_APPS_KEY = ['connections', 'apps'];

/** Active apps connected via the connector. Polls so a fresh connection shows up. */
export function useConnectedApps() {
  return useQuery<ConnectedApp[]>(CONNECTED_APPS_KEY, connectionsService.getConnectedApps, {
    refetchInterval: 15_000,
  });
}

/** Disconnect (revoke) an app; refreshes the list on success. */
export function useDisconnectApp() {
  const qc = useQueryClient();
  return useMutation((clientId: string) => connectionsService.disconnectApp(clientId), {
    onSuccess: () => qc.invalidateQueries(CONNECTED_APPS_KEY),
  });
}
