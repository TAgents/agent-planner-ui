import { useState, useEffect, useCallback } from 'react';

export interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface AuthInfo {
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  accessToken: string | null;
  organizationId: string | null;
  organizationName: string | null;
  organizations: OrgInfo[];
}

// Helper to get auth info from localStorage
const getAuthInfoFromStorage = (): AuthInfo | null => {
  const sessionStr = localStorage.getItem('auth_session');
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr);
    const organizations: OrgInfo[] = session.user?.organizations || [];

    // Active org: explicit selection or first org
    const activeOrgId = localStorage.getItem('active_org_id') || organizations[0]?.id || null;
    const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0] || null;

    return {
      isAuthenticated: true,
      userId: session.user?.id || null,
      userName: session.user?.name || session.user?.user_metadata?.name || session.user?.email || null,
      userEmail: session.user?.email || null,
      accessToken: session.access_token || session.accessToken || null,
      organizationId: activeOrg?.id || null,
      organizationName: activeOrg?.name || null,
      organizations,
    };
  } catch (e) {
    return null;
  }
};

const DEFAULT_AUTH: AuthInfo = {
  isAuthenticated: false,
  userId: null,
  userName: null,
  userEmail: null,
  accessToken: null,
  organizationId: null,
  organizationName: null,
  organizations: [],
};

export const useAuth = () => {
  const [authInfo, setAuthInfo] = useState<AuthInfo>(() => {
    return getAuthInfoFromStorage() || DEFAULT_AUTH;
  });

  useEffect(() => {
    // Listen for custom auth-change event dispatched by Login component
    const handleAuthChange = () => {
      const storedAuth = getAuthInfoFromStorage();
      setAuthInfo(storedAuth || DEFAULT_AUTH);
    };

    // Listen for auth-change events (dispatched by Login component)
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const signOut = async () => {
    // Clear local auth state
    setAuthInfo(DEFAULT_AUTH);
    localStorage.removeItem('auth_session');
    localStorage.removeItem('active_org_id');

    // Dispatch auth-change event so other components can react
    window.dispatchEvent(new Event('auth-change'));
  };

  const switchOrganization = useCallback((orgId: string) => {
    localStorage.setItem('active_org_id', orgId);
    window.dispatchEvent(new Event('auth-change'));
  }, []);

  return {
    ...authInfo,
    signOut,
    switchOrganization,
  };
};
