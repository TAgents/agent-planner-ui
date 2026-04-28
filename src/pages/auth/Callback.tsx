import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useQueryClient } from 'react-query';
import { request } from '../../services/api-client';

type Provider = 'google' | 'github';

type CallbackResponse = {
  user: { id: string; email: string; organizations?: Array<{ id: string }> };
  session: { access_token: string; refresh_token?: string; expires_at?: number };
};

/**
 * OAuth provider redirect handler. Google/GitHub bounce the user back
 * here with `?code=...&state=<provider>`. We POST the code to
 * /auth/<provider>/callback, drop the returned session into the same
 * localStorage shape as the email login, and route into the app.
 *
 * The state param tells us which provider issued the code; we set it
 * when we redirect to the authorize_url. Failure surfaces as an
 * inline error with a "back to login" link rather than a blank page.
 */
const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state') as Provider | null;
    const oauthError = params.get('error');

    if (oauthError) {
      setError(`${oauthError}: ${params.get('error_description') || 'OAuth provider rejected the request'}`);
      return;
    }
    if (!code || !state) {
      setError('Missing authorization code or provider — try signing in again.');
      return;
    }
    if (state !== 'google' && state !== 'github') {
      setError(`Unknown OAuth provider: ${state}`);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await request<CallbackResponse>({
          method: 'POST',
          url: `/auth/${state}/callback`,
          // Pass the same redirect_uri the authorize redirect used —
          // Google requires an exact match between the two calls.
          data: { code, redirect_uri: window.location.origin + window.location.pathname },
        });
        if (cancelled) return;

        // Mirror Login.tsx's session-storage shape so the rest of the
        // app reads auth identically across providers.
        localStorage.setItem(
          'auth_session',
          JSON.stringify({ user: data.user, ...data.session }),
        );
        queryClient.clear();
        window.dispatchEvent(new Event('auth-change'));

        const orgs = data.user?.organizations || [];
        if (orgs.length > 1 && !localStorage.getItem('active_org_id')) {
          navigate('/select-org', { state: { from: '/app/plans' }, replace: true });
        } else {
          if (orgs.length === 1) localStorage.setItem('active_org_id', orgs[0].id);
          navigate('/app/plans', { replace: true });
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || 'OAuth exchange failed.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, navigate, queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-text">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <>
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red" />
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em]">
              Sign-in failed
            </h2>
            <p className="mt-2 text-[13px] leading-[1.55] text-text-sec">{error}</p>
            <Link
              to="/login"
              className="mt-5 inline-block rounded-md bg-amber px-4 py-2 font-medium text-bg hover:opacity-90"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-amber" />
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em]">
              Signing you in…
            </h2>
            <p className="mt-1 text-[13px] text-text-sec">Exchanging the code with the provider.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Callback;
