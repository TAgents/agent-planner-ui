import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// OAuth callback page — Supabase has been removed.
// This redirects to login so old bookmarks don't break.
const Callback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default Callback;
