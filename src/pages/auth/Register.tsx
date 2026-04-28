import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from 'react-query';
import api from '../../services/api';
import { AuthSplitLayout } from '../../components/v1';
import OAuthRow from '../../components/auth/OAuthRow';
import { calculatePasswordStrength } from '../../utils/passwordStrength';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  organization?: string;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  acceptTerms?: string;
  general?: string;
}

/**
 * Convert workspace name → DNS-safe slug for the live preview line
 * (`acme-robotics.agentplanner.app`). Server is the source of truth on
 * submit; this is just a typing affordance.
 */
function workspaceSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    organization: '',
    acceptTerms: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validateField = (name: keyof FormData, value: any): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return 'Work email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'At least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          return 'Must include uppercase, lowercase, and a number';
        break;
      case 'name':
        if (!value) return 'Workspace name is required';
        if (value.length < 2) return 'At least 2 characters';
        break;
      case 'acceptTerms':
        if (!value) return 'You must agree to the terms';
        break;
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    (['email', 'password', 'name', 'acceptTerms'] as const).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Re-use the existing /auth/register; workspace creation lives in
      // the org-flow on first login. Once the API has a single
      // workspace+account endpoint, swap this call.
      await api.auth.register(formData.email, formData.password, formData.name);
      setRegistrationSuccess(true);
      queryClient.clear();

      setTimeout(() => {
        window.dispatchEvent(new Event('auth-change'));

        const session = JSON.parse(localStorage.getItem('auth_session') || '{}');
        const orgs = session.user?.organizations || [];

        if (orgs.length > 1 && !localStorage.getItem('active_org_id')) {
          navigate('/select-org', { state: { from: '/app/plans' }, replace: true });
        } else {
          if (orgs.length === 1) localStorage.setItem('active_org_id', orgs[0].id);
          navigate('/app/plans', { replace: true });
        }
      }, 1500);
    } catch (error: any) {
      setErrors({
        general: error.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-text">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald" />
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em]">
            Workspace ready
          </h2>
          <p className="mt-1 text-[13px] text-text-sec">Redirecting…</p>
        </div>
      </div>
    );
  }

  const slug = workspaceSlug(formData.name) || 'workspace';

  return (
    <AuthSplitLayout
      kicker="◆ Create account"
      title="Set up your workspace"
      altCta={
        <span>
          {'Already have an account? '}
          <Link to="/login" className="text-amber underline">
            Sign in
          </Link>
        </span>
      }
    >
      <div>
        <OAuthRow />

        {errors.general && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-red/30 bg-red/10 px-3 py-2 text-[12.5px] text-red">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {errors.general}
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
              value={formData.email}
              onChange={handleInputChange}
              placeholder="marcus@acme-robotics.com"
              className={`w-full rounded-md border bg-surface px-3 py-2 text-[13px] text-text outline-none placeholder:text-text-muted focus:border-amber ${
                errors.email ? 'border-red/50' : 'border-border'
              }`}
            />
            {errors.email && <p className="mt-1 text-[11px] text-red">{errors.email}</p>}
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted"
            >
              Workspace name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="organization"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Acme Robotics"
              className={`w-full rounded-md border bg-surface px-3 py-2 text-[13px] text-text outline-none placeholder:text-text-muted focus:border-amber ${
                errors.name ? 'border-red/50' : 'border-border'
              }`}
            />
            <p className="mt-1 font-mono text-[10px] text-text-muted">
              ↳ {slug}.agentplanner.app
            </p>
            {errors.name && <p className="mt-1 text-[11px] text-red">{errors.name}</p>}
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min 8 characters"
                className={`w-full rounded-md border bg-surface px-3 py-2 pr-9 text-[13px] text-text outline-none placeholder:text-text-muted focus:border-amber ${
                  errors.password ? 'border-red/50' : 'border-border'
                }`}
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
            {formData.password && (
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-amber px-4 py-2.5 font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating workspace…
              </>
            ) : (
              'Create workspace →'
            )}
          </button>

          <p className="text-center text-[11.5px] text-text-sec">
            By continuing you agree to the{' '}
            <Link to="/terms" target="_blank" className="text-text underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank" className="text-text underline">
              Privacy notice
            </Link>
            .
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
};

export default Register;
