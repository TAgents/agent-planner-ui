import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from 'react-query';
import api from '../../services/api';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="AgentPlanner" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">AgentPlanner</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sign in</h1>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          {resendSuccess && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-3 py-2 rounded-md text-sm">
              Verification email sent. Check your inbox.
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-md text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  {error}
                  {errorCode === 'EMAIL_NOT_CONFIRMED' && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      className="block mt-1 text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
                    >
                      {resendingEmail ? 'Sending...' : 'Resend verification email'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2 pr-9 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-amber-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md text-white bg-gray-900 dark:bg-amber-400 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          No account?{' '}
          <Link to="/register" className="text-amber-600 dark:text-amber-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
