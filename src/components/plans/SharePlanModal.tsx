import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { planService } from '../../services/plans.service';
import type { Plan } from '../../types';
import { Kicker, PrimaryButton, GhostButton, Pill } from '../v1';

type Role = 'viewer' | 'editor' | 'admin';

type Collaborator = {
  id?: string;
  user_id?: string;
  userId?: string;
  name?: string;
  email?: string;
  role?: Role | 'owner' | string;
  user?: { id?: string; name?: string; email?: string };
};

const ROLES: Role[] = ['viewer', 'editor', 'admin'];
const collabId = (c: Collaborator) => c.user_id || c.userId || c.user?.id || c.id || '';
const collabName = (c: Collaborator) => c.user?.name || c.name || c.user?.email || c.email || 'User';
const collabEmail = (c: Collaborator) => c.user?.email || c.email || '';

/**
 * Share a plan with other users (human-steering: access control, not content
 * editing). Lists current collaborators with role management + removal, adds new
 * collaborators by email, and toggles public-link visibility.
 */
const SharePlanModal: React.FC<{ plan: Plan; onClose: () => void }> = ({ plan, onClose }) => {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const [error, setError] = useState<string | null>(null);

  const { data: collaborators = [], isLoading } = useQuery<Collaborator[]>(
    ['plan-collaborators', plan.id],
    () => planService.getCollaborators(plan.id),
  );

  const invalidate = () => {
    qc.invalidateQueries(['plan-collaborators', plan.id]);
    qc.invalidateQueries(['plan']);
    qc.invalidateQueries(['plans']);
  };

  const add = useMutation(
    () => planService.addCollaborator(plan.id, { email: email.trim(), role }),
    {
      onSuccess: () => { setEmail(''); setError(null); invalidate(); },
      onError: (e: any) => setError(e?.response?.data?.error || e?.message || 'Could not add collaborator.'),
    },
  );
  const remove = useMutation(
    (userId: string) => planService.removeCollaborator(plan.id, userId),
    { onSuccess: invalidate, onError: (e: any) => setError(e?.response?.data?.error || 'Could not remove collaborator.') },
  );
  const changeRole = useMutation(
    ({ userId, role }: { userId: string; role: Role }) => planService.updateCollaboratorRole(plan.id, userId, role),
    { onSuccess: invalidate, onError: (e: any) => setError(e?.response?.data?.error || 'Could not change role.') },
  );
  const isPublic = plan.visibility === 'public';
  const setVisibility = useMutation(
    (visibility: 'public' | 'private') => planService.updatePlanVisibility(plan.id, visibility),
    { onSuccess: invalidate, onError: (e: any) => setError(e?.response?.data?.error || 'Could not change visibility.') },
  );

  const canAdd = /\S+@\S+\.\S+/.test(email.trim()) && !add.isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Kicker className="block">Share plan</Kicker>
        <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
          Share "{plan.title}"
        </h2>
        <p className="mt-1 text-[12.5px] text-text-sec">
          Invite people by email and pick what they can do. Viewers read; editors change the plan; admins also manage sharing.
        </p>

        {/* Add collaborator */}
        <div className="mt-4 flex items-end gap-2">
          <label className="flex-1">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && canAdd) add.mutate(); }}
              placeholder="person@company.com"
              className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-amber"
            />
          </label>
          <label>
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1.5 rounded-md border border-border bg-bg px-2 py-2 text-[13px] capitalize text-text outline-none focus:border-amber"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <PrimaryButton onClick={() => add.mutate()} disabled={!canAdd}>
            {add.isLoading ? 'Adding…' : 'Add'}
          </PrimaryButton>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red bg-red/[0.08] px-3 py-2 text-[12px] text-red">{error}</div>
        )}

        {/* Current collaborators */}
        <div className="mt-5">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">People with access</span>
          <ul className="mt-2 divide-y divide-border rounded-md border border-border">
            {isLoading && <li className="px-3 py-3 text-[12.5px] text-text-muted">Loading…</li>}
            {!isLoading && collaborators.length === 0 && (
              <li className="px-3 py-3 text-[12.5px] text-text-muted">Only you. Add someone above.</li>
            )}
            {collaborators.map((c) => {
              const id = collabId(c);
              const name = collabName(c);
              const email = collabEmail(c);
              const isOwner = c.role === 'owner';
              return (
                <li key={id || email} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] text-text">{name}</div>
                    {name !== email && email && <div className="truncate text-[11px] text-text-muted">{email}</div>}
                  </div>
                  {isOwner ? (
                    <Pill color="amber">Owner</Pill>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={(c.role as Role) || 'viewer'}
                        onChange={(e) => changeRole.mutate({ userId: id, role: e.target.value as Role })}
                        disabled={!id || changeRole.isLoading}
                        className="rounded-md border border-border bg-bg px-2 py-1 text-[12px] capitalize text-text outline-none focus:border-amber"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => remove.mutate(id)}
                        disabled={!id || remove.isLoading}
                        title="Remove access"
                        className="rounded-md border border-border px-2 py-1 text-[12px] text-text-sec transition-colors hover:border-red hover:text-red"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Public link visibility */}
        <div className="mt-4 flex items-center justify-between rounded-md border border-border px-3 py-2.5">
          <div>
            <div className="flex items-center gap-2 text-[13px] text-text">
              Public link {isPublic && <Pill color="slate">On</Pill>}
            </div>
            <div className="text-[11px] text-text-muted">Anyone with the link can view — no account needed.</div>
          </div>
          <GhostButton
            onClick={() => setVisibility.mutate(isPublic ? 'private' : 'public')}
            disabled={setVisibility.isLoading}
          >
            {isPublic ? 'Make private' : 'Make public'}
          </GhostButton>
        </div>

        <div className="mt-5 flex justify-end">
          <GhostButton onClick={onClose}>Done</GhostButton>
        </div>
      </div>
    </div>
  );
};

export default SharePlanModal;
