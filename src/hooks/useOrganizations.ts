import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../services/api';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_personal: boolean;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  member_count?: number;
  plan_count?: number;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user: {
    id: string;
    email: string;
    name?: string;
    github_username?: string;
    github_avatar_url?: string;
  };
}

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.list();
      setOrganizations(data);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const createOrganization = async (data: { name: string; description?: string }) => {
    const newOrg = await organizationService.create(data);
    await fetchOrganizations();
    return newOrg;
  };

  const updateOrganization = async (orgId: string, data: { name?: string; description?: string }) => {
    const updated = await organizationService.update(orgId, data);
    await fetchOrganizations();
    return updated;
  };

  const deleteOrganization = async (orgId: string) => {
    await organizationService.delete(orgId);
    await fetchOrganizations();
  };

  return {
    organizations,
    loading,
    error,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  };
};

export const useOrganization = (orgId: string | null) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!orgId) {
      setOrganization(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [orgData, membersData] = await Promise.all([
        organizationService.get(orgId),
        organizationService.listMembers(orgId),
      ]);
      setOrganization(orgData);
      setMembers(membersData);
    } catch (err: any) {
      console.error('Error fetching organization:', err);
      setError(err.message || 'Failed to fetch organization');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const addMember = async (email: string, role: string = 'member') => {
    if (!orgId) return;
    await organizationService.addMember(orgId, { email, role });
    await fetchOrganization();
  };

  const removeMember = async (memberId: string) => {
    if (!orgId) return;
    await organizationService.removeMember(orgId, memberId);
    await fetchOrganization();
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    if (!orgId) return;
    await organizationService.updateMemberRole(orgId, memberId, role);
    await fetchOrganization();
  };

  return {
    organization,
    members,
    loading,
    error,
    fetchOrganization,
    addMember,
    removeMember,
    updateMemberRole,
  };
};
