import React from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { SSOButton } from '../v1';

const PROVIDER_GLYPH: Record<string, string> = {
  google: 'G',
  github: '◐',
};

/**
 * Conditional SSO row for the auth pages. Pulls the configured-provider
 * list from /auth/oauth/providers — if the deployment has no client_id
 * configured for a provider, the button doesn't render. Renders nothing
 * (and adds no whitespace) when no providers are configured, so the
 * email form stands alone gracefully.
 */
const OAuthRow: React.FC = () => {
  const { data, isLoading } = useQuery(
    ['auth', 'oauth-providers'],
    () => api.auth.listOAuthProviders(),
    { staleTime: 5 * 60_000 },
  );

  const providers = data?.providers || [];
  if (isLoading || providers.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {providers.map((p) => (
          <SSOButton
            key={p.id}
            provider={p.id}
            glyph={PROVIDER_GLYPH[p.id] || '◇'}
            label={p.label}
            onClick={() => {
              // Tag the redirect with the provider id so /auth/callback
              // knows which exchange endpoint to hit on the way back.
              const url = new URL(p.authorize_url);
              url.searchParams.set('state', p.id);
              window.location.href = url.toString();
            }}
          />
        ))}
      </div>
      <div className="my-6 flex items-center gap-3 text-text-muted">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em]">Or with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
};

export default OAuthRow;
