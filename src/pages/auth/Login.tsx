import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from 'react-query';
import api from '../../services/api';
import { AuthSplitLayout, SSOButton } from '../../components/v1';

interface LocationState {
  from?: Location;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setResendSuccess(false);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      await api.auth.login(email, password);
      queryClient.clear();

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      window.dispatchEvent(new Event('auth-change'));

      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/app/plans';

      // Check if user needs to pick an org
      const session = JSON.parse(localStorage.getItem('auth_session') || '{}');
      const orgs = session.user?.organizations || [];

      if (orgs.length > 1 && !localStorage.getItem('active_org_id')) {
        navigate('/select-org', { state: { from }, replace: true });
      } else {
        if (orgs.length === 1) localStorage.setItem('active_org_id', orgs[0].id);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const code = err.code || err.response?.data?.code;
      setErrorCode(code || null);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setResendSuccess(false);
    try {
      await api.auth.resendVerification(email);
      setResendSuccess(true);
      setError(null);
      setErrorCode(null);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <AuthSplitLayout
      kicker="◆ Sign in"
      title="Welcome back"
      subtitle="Pick up where your agents left off."
      altCta={
        <span>
          {'No account? '}
          <Link to="/register" className="text-amber underline">
            Create one
          </Link>
          {'.'}
        </span>
      }
    >
      <div>
        {/* SSO row — wired to /api/auth endpoints when those land. Buttons
            are inert today; clicking falls through to email/password. */}
        <div className="flex flex-col gap-2.5">
          <SSOButton provider="google" glyph="G" label="Continue with Google" />
          <SSOButton provider="github" glyph="◐" label="Continue with GitHub" />
          <SSOButton provider="microsoft" glyph="⚡" label="Continue with SAML SSO" />
        </div>

        <div className="my-6 flex items-center gap-3 text-text-muted">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em]">
            Or with email
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {resendSuccess && (
          <div className="mb-4 rounded-md border border-emerald/30 bg-emerald/10 px-3 py-2 text-[12.5px] text-emerald">
            Verification email sent. Check your inbox.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-red/30 bg-red/10 px-3 py-2 text-[12.5px] text-red">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                {error}
                {errorCode === 'EMAIL_NOT_CONFIRMED' && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="block mt-1 text-amber underline disabled:opacity-50"
                  >
                    {resendingEmail ? 'Sending…' : 'Resend verification email'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted"
            >
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none placeholder:text-text-muted focus:border-amber"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full rounded-md border border-border bg-surface px-3 py-2 pr-9 text-[13px] text-text outline-none placeholder:text-text-muted focus:border-amber"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted hover:text-text"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11.5px]">
            <label className="flex items-center gap-2 text-text-sec">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border bg-surface text-amber focus:ring-amber"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-amber hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-amber px-4 py-2.5 font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign in →'
            )}
          </button>
        </form>
      </div>
    </AuthSplitLayout>
  );
};

export default Login;
