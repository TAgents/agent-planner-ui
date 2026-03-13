import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from 'react-query';
import api from '../../services/api';
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

const Register: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    organization: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validateField = (name: keyof FormData, value: any): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'At least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          return 'Must contain uppercase, lowercase, and numbers';
        break;
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        break;
      case 'name':
        if (!value) return 'Name is required';
        if (value.length < 2) return 'At least 2 characters';
        break;
      case 'acceptTerms':
        if (!value) return 'Required';
        break;
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: fieldValue }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    if (name === 'email' || name === 'password' || name === 'confirmPassword') {
      const error = validateField(name as keyof FormData, fieldValue);
      if (error && fieldValue) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'organization') {
        const error = validateField(key as keyof FormData, formData[key as keyof FormData]);
        if (error) newErrors[key as keyof FormErrors] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await api.auth.register(formData.email, formData.password, formData.name);
      setRegistrationSuccess(true);
      queryClient.clear();

      setTimeout(() => {
        window.dispatchEvent(new Event('auth-change'));
        navigate('/app/plans');
      }, 2000);
    } catch (error: any) {
      setErrors({
        general: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="mx-auto w-10 h-10 text-green-500 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Account created</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      errors[field] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="AgentPlanner" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">AgentPlanner</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Create account</h1>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          {errors.general && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-md text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input id="name" name="name" type="text" autoComplete="name" required value={formData.name} onChange={handleInputChange} className={inputClass('name')} placeholder="Your name" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleInputChange} className={inputClass('email')} placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleInputChange} className={`${inputClass('password')} pr-9`} placeholder="Min 8 characters" />
                <button type="button" className="absolute inset-y-0 right-0 pr-2.5 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div className={`h-1 rounded-full transition-all ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500">{passwordStrength.label}</span>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm password</label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleInputChange} className={`${inputClass('confirmPassword')} pr-9`} placeholder="Repeat password" />
                <button type="button" className="absolute inset-y-0 right-0 pr-2.5 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                <input name="acceptTerms" type="checkbox" checked={formData.acceptTerms} onChange={handleInputChange} className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-500" />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.acceptTerms && <p className="mt-1 text-xs text-red-500">{errors.acceptTerms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
