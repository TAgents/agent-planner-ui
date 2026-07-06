import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { AuthSplitLayout } from '../../components/v1';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthSplitLayout kicker="Reset password" title="Check your email">
        <div>
          <div className="flex items-start gap-3 rounded-[3px] border border-emerald/30 bg-emerald/10 px-4 py-3">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald" />
            <p className="text-[13px] leading-relaxed text-text">
              Password reset link sent to <span className="font-medium">{email}</span>.
            </p>
          </div>
          <p className="mt-4 text-[12.5px] text-text-sec">
            Didn't receive it?{' '}
            <button
              onClick={() => { setSuccess(false); setEmail(''); }}
              className="text-amber hover:underline"
            >
              Try again
            </button>
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] text-amber hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      kicker="Reset password"
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[3px] border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none placeholder:text-text-muted focus:border-amber"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[3px] bg-amber px-4 py-2.5 font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              'Send reset link →'
            )}
          </button>
        </form>
      </div>
    </AuthSplitLayout>
  );
};

export default ForgotPassword;
