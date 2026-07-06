import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthSplitLayout } from '../../components/v1';
import { calculatePasswordStrength } from '../../utils/passwordStrength';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const passwordStrength = calculatePasswordStrength(password);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'At least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) newErrors.password = 'Must contain uppercase, lowercase, and numbers';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthSplitLayout kicker="Reset password" title="Password reset">
        <div className="flex items-start gap-3 rounded-[3px] border border-emerald/30 bg-emerald/10 px-4 py-3">
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
          <p className="text-[13px] leading-relaxed text-text">
            Your password is updated. Redirecting to sign in…
          </p>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      kicker="Reset password"
      title="Choose a new password"
      subtitle="Set a new password for your account."
      altCta={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-amber hover:underline">
          <ArrowLeft className="h-3 w-3" />
          Back to sign in
        </Link>
      }
    >
      <div>
        {error && (
          <div className="mb-4 rounded-[3px] border border-red/30 bg-red/10 px-3 py-2 text-[12.5px] text-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                placeholder="Min 8 characters"
                className={`w-full rounded-[3px] border bg-surface px-3 py-2 pr-9 text-[13px] text-text outline-none placeholder:text-text-muted focus:border-amber ${
                  errors.password ? 'border-red/50' : 'border-border'
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted hover:text-text"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-hi">
                  <div
                    className={`h-1 rounded-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                  {passwordStrength.label}
                </span>
              </div>
            )}
            {errors.password && <p className="mt-1 text-[11px] text-red">{errors.password}</p>}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="Repeat the new password"
                className={`w-full rounded-[3px] border bg-surface px-3 py-2 pr-9 text-[13px] text-text outline-none placeholder:text-text-muted focus:border-amber ${
                  errors.confirmPassword ? 'border-red/50' : 'border-border'
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted hover:text-text"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] text-red">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[3px] bg-amber px-4 py-2.5 font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting…
              </>
            ) : (
              'Reset password →'
            )}
          </button>
        </form>
      </div>
    </AuthSplitLayout>
  );
};

export default ResetPassword;
