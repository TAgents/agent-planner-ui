import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface LocationState {
  from?: string;
}

const roleBadge: Record<string, string> = {
  owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  member: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const SelectOrganization: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const destination = state?.from || '/app';

  const session = JSON.parse(localStorage.getItem('auth_session') || '{}');
  const orgs: Organization[] = session.user?.organizations || [];

  useEffect(() => {
    // Skip if user has 0-1 orgs or already picked
    if (orgs.length <= 1 || localStorage.getItem('active_org_id')) {
      if (orgs.length === 1) {
        localStorage.setItem('active_org_id', orgs[0].id);
      }
      navigate(destination, { replace: true });
    }
  }, [orgs, destination, navigate]);

  const handleSelect = (org: Organization) => {
    localStorage.setItem('active_org_id', org.id);
    window.dispatchEvent(new Event('auth-change'));
    navigate(destination, { replace: true });
  };

  // Don't render if redirecting
  if (orgs.length <= 1 || localStorage.getItem('active_org_id')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="AgentPlanner" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">AgentPlanner</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Select organization</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose which organization to work in</p>
        </div>

        {/* Org Grid */}
        <div className="grid gap-2">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors">
                <Building2 className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">{org.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${roleBadge[org.role] || roleBadge.member}`}>
                {org.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectOrganization;
