import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { LogIn } from 'lucide-react';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL (Supabase handles this automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Session error:', sessionError.message);
          }
          setError(sessionError.message);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!session) {
          if (process.env.NODE_ENV === 'development') {
            console.error('No session found');
          }
          setError('No session found. Please try logging in again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('GitHub OAuth successful, user:', session.user?.email);
        }

        // Store the session in localStorage for API requests
        localStorage.setItem('auth_session', JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user,
        }));

        // Trigger auth-change event
        window.dispatchEvent(new Event('auth-change'));

        // Navigate to plans page
        navigate('/app/plans', { replace: true });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Callback error:', err.message);
        }
        setError(err.message || 'An error occurred during authentication');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 dark:bg-blue-700 p-4 rounded-full">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {error ? 'Authentication Error' : 'Completing Sign In'}
          </h2>
          {!error && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please wait while we complete your authentication...
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">
          {error ? (
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Callback;
