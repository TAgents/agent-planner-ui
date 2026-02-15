import { useState, useEffect } from 'react';

export interface AuthInfo {
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  accessToken: string | null;
}

// Helper to get auth info from localStorage
const getAuthInfoFromStorage = (): AuthInfo | null => {
  const sessionStr = localStorage.getItem('auth_session');
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr);
    return {
      isAuthenticated: true,
      userId: session.user?.id || null,
      userName: session.user?.name || session.user?.user_metadata?.name || session.user?.email || null,
      userEmail: session.user?.email || null,
      accessToken: session.access_token || session.accessToken || null,
    };
  } catch (e) {
    return null;
  }
};

export const useAuth = () => {
  const [authInfo, setAuthInfo] = useState<AuthInfo>(() => {
    const storedAuth = getAuthInfoFromStorage();
    return storedAuth || {
      isAuthenticated: false,
      userId: null,
      userName: null,
      userEmail: null,
      accessToken: null,
    };
  });

  useEffect(() => {
    // Listen for custom auth-change event dispatched by Login component
    const handleAuthChange = () => {
      const storedAuth = getAuthInfoFromStorage();
      if (storedAuth) {
        setAuthInfo(storedAuth);
      } else {
        setAuthInfo({
          isAuthenticated: false,
          userId: null,
          userName: null,
          userEmail: null,
          accessToken: null,
        });
      }
    };

    // Listen for auth-change events (dispatched by Login component)
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const signOut = async () => {
    // Clear local auth state
    setAuthInfo({
      isAuthenticated: false,
      userId: null,
      userName: null,
      userEmail: null,
      accessToken: null,
    });
    localStorage.removeItem('auth_session');

    // Dispatch auth-change event so other components can react
    window.dispatchEvent(new Event('auth-change'));
  };

  return {
    ...authInfo,
    signOut,
  };
};
