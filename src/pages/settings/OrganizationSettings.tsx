import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Users, Crown, Shield, UserMinus, UserPlus,
  Loader2, Trash2, ChevronRight, ChevronDown, Edit3,
  Save, X, Building2, Copy, Check, AlertTriangle,
  Activity as ActivityIcon, ListChecks, KeyRound, Settings2,
  ArrowRightLeft, Ban, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SettingsNav } from '../../components/settings/SettingsLayout';
import {
  organizationService, Organization, OrgMember,
  OrgActivityEntry, OrgOverview, OrgToken,
} from '../../services/api';

/* ─── relative time helper ─── */
const timeAgo = (iso?: string | null): string => {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

/* ─── duration helper ─── */
const fmtDuration = (ms?: number | null): string | null => {
  if (ms == null || Number.isNaN(ms)) return null;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)}s`;
};

/* ─── shared: pulsing skeleton rows for loading tabs ─── */
const SkeletonRows: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2.5 animate-pulse">
        <div className="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-2 rounded bg-gray-200 dark:bg-gray-700" style={{ width: `${60 - i * 7}%` }} />
          <div className="h-1.5 rounded bg-gray-100 dark:bg-gray-800" style={{ width: `${40 - i * 5}%` }} />
        </div>
        <div className="h-2 w-8 rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
      </div>
    ))}
  </div>
);

/* ─── shared: small refresh button for data tabs ─── */
const RefreshButton: React.FC<{ onClick: () => void; spinning: boolean }> = ({ onClick, spinning }) => (
  <button
    onClick={onClick}
    disabled={spinning}
    title="Refresh"
    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
  >
    <RefreshCw className={`w-3 h-3 ${spinning ? 'animate-spin' : ''}`} />
  </button>
);

/* ─── audit action → readable label ─── */
const auditLabel = (e: OrgActivityEntry): string => {
  const d = e.details || {};
  switch (e.action) {
    case 'org.updated': return `Updated organization ${Array.isArray(d.fields) ? `(${d.fields.join(', ')})` : ''}`;
    case 'org.member.added': return `Added ${d.targetEmail || 'a member'} as ${d.role || 'member'}`;
    case 'org.member.removed': return `Removed ${d.targetEmail || 'a member'}`;
    case 'org.member.role_changed': return `Changed ${d.targetEmail || 'a member'} from ${d.fromRole} to ${d.toRole}`;
    case 'org.token.revoked': return `Revoked token "${d.tokenName || d.tokenId}"`;
    case 'org.ownership.transferred': return 'Transferred ownership';
    default: return e.action || 'Activity';
  }
};

/* ─── role badges ─── */
const roleMeta: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  owner:  { label: 'Owner', icon: Crown,  color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  admin:  { label: 'Admin', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  member: { label: 'Member', icon: Users,  color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
};

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const m = roleMeta[role] || roleMeta.member;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${m.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {m.label}
    </span>
  );
};

/* ─── member row ─── */
const MemberRow: React.FC<{
  member: OrgMember;
  myRole: string;
  onRemove: (id: string) => void;
  onChangeRole: (id: string, role: string) => void;
  onTransfer: (userId: string, name: string) => void;
  removing: string | null;
}> = ({ member, myRole, onRemove, onChangeRole, onTransfer, removing }) => {
  const canManage = (myRole === 'owner' || myRole === 'admin') && member.role !== 'owner';
  const canChangeRole = myRole === 'owner' && member.role !== 'owner';
  const canTransfer = myRole === 'owner' && member.role !== 'owner';

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
      {/* avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
          {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{member.user.name}</span>
          <RoleBadge role={member.role} />
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{member.user.email}</p>
      </div>

      {/* actions */}
      {canManage && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canChangeRole && (
            <select
              value={member.role}
              onChange={(e) => onChangeRole(member.id, e.target.value)}
              className="text-[10px] bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-gray-500 dark:text-gray-400 cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          )}
          {canTransfer && (
            <button
              onClick={() => onTransfer(member.user.id, member.user.name || member.user.email)}
              className="p-1 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              title="Transfer ownership"
            >
              <ArrowRightLeft className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onRemove(member.id)}
            disabled={removing === member.id}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
            title="Remove member"
          >
            {removing === member.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Activity tab ─── */
const ACTIVITY_PAGE = 50;
const ACTIVITY_MAX = 200; // backend caps the limit here

const ActivityTab: React.FC<{ orgId: string }> = ({ orgId }) => {
  const [tab, setTab] = useState<'audit' | 'tools'>('audit');
  const [entries, setEntries] = useState<OrgActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(ACTIVITY_PAGE);
  const reqRef = useRef(0);

  const fetchActivity = useCallback((silent = false) => {
    const myReq = ++reqRef.current;
    if (silent) setRefreshing(true); else setLoading(true);
    organizationService.getActivity(orgId, tab, limit)
      .then(res => { if (reqRef.current === myReq) setEntries(res.entries); })
      .catch(() => { if (reqRef.current === myReq) setEntries([]); })
      .finally(() => { if (reqRef.current === myReq) { setLoading(false); setRefreshing(false); } });
  }, [orgId, tab, limit]);

  useEffect(() => { fetchActivity(false); }, [fetchActivity]);

  // Switching sub-tab resets paging back to the first page.
  const switchTab = (t: 'audit' | 'tools') => { if (t !== tab) { setTab(t); setLimit(ACTIVITY_PAGE); } };

  // If we got a full page back there may be more; offer to load it.
  const canLoadMore = !loading && entries.length >= limit && limit < ACTIVITY_MAX;

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {(['audit', 'tools'] as const).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                tab === t
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t === 'audit' ? 'Admin actions' : 'Agent activity'}
            </button>
          ))}
        </div>
        <RefreshButton onClick={() => fetchActivity(true)} spinning={refreshing} />
      </div>

      {loading ? (
        <SkeletonRows rows={5} />
      ) : entries.length === 0 ? (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 py-4 text-center">No activity yet.</p>
      ) : (
        <>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
            {entries.map(e => {
              const dur = tab === 'tools' ? fmtDuration(e.durationMs) : null;
              return (
                <div key={e.id} className="flex items-center gap-3 py-2">
                  <div className="flex-1 min-w-0">
                    {tab === 'audit' ? (
                      <>
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 truncate">{auditLabel(e)}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {e.actorName || e.actorEmail || 'Unknown'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 truncate font-mono">{e.toolName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {e.clientLabel || 'agent'}
                          {e.responseStatus != null && (
                            <span className={e.responseStatus >= 400 ? 'text-red-500 ml-1.5' : 'ml-1.5'}>
                              {e.responseStatus}
                            </span>
                          )}
                          {dur && <span className="ml-1.5 tabular-nums">· {dur}</span>}
                        </p>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums flex-shrink-0">{timeAgo(e.createdAt)}</span>
                </div>
              );
            })}
          </div>
          {canLoadMore && (
            <div className="pt-1 text-center">
              <button
                onClick={() => setLimit(l => Math.min(l + ACTIVITY_PAGE, ACTIVITY_MAX))}
                className="text-[10px] font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ─── Plans / usage overview tab ─── */
const statusTone: Record<string, string> = {
  active: 'text-emerald-500', completed: 'text-blue-400',
  draft: 'text-gray-400', archived: 'text-gray-500',
};

const PlansTab: React.FC<{ orgId: string }> = ({ orgId }) => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OrgOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const reqRef = useRef(0);

  const fetchOverview = useCallback((silent = false) => {
    const myReq = ++reqRef.current;
    if (silent) setRefreshing(true); else setLoading(true);
    organizationService.getOverview(orgId)
      .then(res => { if (reqRef.current === myReq) setOverview(res); })
      .catch(() => { if (reqRef.current === myReq) setOverview(null); })
      .finally(() => { if (reqRef.current === myReq) { setLoading(false); setRefreshing(false); } });
  }, [orgId]);

  useEffect(() => { fetchOverview(false); }, [fetchOverview]);

  if (loading) return <div className="px-4 py-3"><SkeletonRows rows={5} /></div>;
  if (!overview) return (
    <div className="px-4 py-4 flex items-center justify-center gap-2">
      <p className="text-[11px] text-gray-400">Failed to load overview.</p>
      <button onClick={() => fetchOverview(false)} className="text-[10px] font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Retry</button>
    </div>
  );

  const { counts, plans } = overview;
  const stat = (label: string, value: number) => (
    <div className="flex-1 text-center">
      <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</div>
    </div>
  );

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center justify-end -mb-1">
        <RefreshButton onClick={() => fetchOverview(true)} spinning={refreshing} />
      </div>
      <div className="flex items-center gap-2 py-2 bg-gray-50/60 dark:bg-gray-800/20 rounded-lg">
        {stat('Members', counts.members)}
        {stat('Plans', counts.plans)}
        {stat('Active', counts.activePlans)}
        {stat('Tokens', counts.activeTokens)}
      </div>

      {plans.length === 0 ? (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 py-3 text-center">No plans in this organization.</p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
          {plans.map(p => {
            const pct = p.totalNodes > 0 ? Math.round((p.completedNodes / p.totalNodes) * 100) : 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(`/app/plans/${p.id}`)}
                title="Open plan"
                className="group w-full flex items-center gap-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-gray-900 dark:group-hover:text-white">{p.title}</span>
                    <span className={`text-[9px] font-medium ${statusTone[p.status] || 'text-gray-400'}`}>{p.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                    {p.ownerName || p.ownerEmail} · updated {timeAgo(p.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-24">
                  <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 tabular-nums w-8 text-right">
                    {p.totalNodes > 0 ? `${pct}%` : '—'}
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Tokens tab ─── */
const TokensTab: React.FC<{ orgId: string; canRevoke: boolean }> = ({ orgId, canRevoke }) => {
  const [tokens, setTokens] = useState<OrgToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback((silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    organizationService.listTokens(orgId)
      .then(res => setTokens(res.tokens))
      .catch(() => setTokens([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await organizationService.revokeToken(orgId, id);
      setTokens(prev => prev.map(t => t.id === id ? { ...t, revoked: true } : t));
    } catch { /* ignore */ }
    setRevoking(null);
    setConfirmId(null);
  };

  if (loading) return <div className="px-4 py-3"><SkeletonRows rows={4} /></div>;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          API tokens {tokens.length > 0 && <span className="tabular-nums font-normal">· {tokens.length}</span>}
        </span>
        <RefreshButton onClick={() => load(true)} spinning={refreshing} />
      </div>
      {tokens.length === 0 ? (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 py-4 text-center">No API tokens scoped to this organization.</p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
          {tokens.map(t => (
            <div key={t.id} className="flex items-center gap-3 py-2.5">
              <KeyRound className={`w-3.5 h-3.5 flex-shrink-0 ${t.revoked ? 'text-gray-300 dark:text-gray-600' : 'text-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium truncate ${t.revoked ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{t.name}</span>
                  {t.revoked && <span className="text-[9px] px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded">Revoked</span>}
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                  {t.owner.name || t.owner.email} · {t.callCount} calls
                  {t.errorCount > 0 && <span className="text-red-500"> · {t.errorCount} errors</span>}
                  {' · '}last {timeAgo(t.lastCallAt || t.lastUsed)}
                </p>
              </div>
              {canRevoke && !t.revoked && (
                confirmId === t.id ? (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleRevoke(t.id)} disabled={revoking === t.id}
                      className="px-2 py-1 text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                      {revoking === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                    </button>
                    <button onClick={() => setConfirmId(null)} className="px-2 py-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(t.id)} title="Revoke token"
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0">
                    <Ban className="w-3 h-3" />
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── org card (expanded) ─── */
const OrgCard: React.FC<{
  org: Organization;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}> = ({ org, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(org.name);
  const [editDesc, setEditDesc] = useState(org.description || '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'members' | 'activity' | 'plans' | 'tokens'>('members');
  const [transferTarget, setTransferTarget] = useState<{ userId: string; name: string } | null>(null);

  const myRole = org.role || 'member';
  const isOwner = myRole === 'owner';
  const isAdmin = myRole === 'admin';
  const isManager = isOwner || isAdmin;

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const res = await organizationService.listMembers(org.id);
      setMembers(res.members);
    } catch { /* ignore */ }
    setLoadingMembers(false);
  }, [org.id]);

  useEffect(() => {
    if (expanded && members.length === 0) loadMembers();
  }, [expanded, loadMembers, members.length]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      await organizationService.addMember(org.id, { email: inviteEmail.trim(), role: inviteRole });
      setInviteSuccess(`Added ${inviteEmail.trim()}`);
      setInviteEmail('');
      loadMembers();
      setTimeout(() => setInviteSuccess(null), 3000);
    } catch (err: any) {
      setInviteError(err.message || 'Failed to add member');
    }
    setInviting(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemoving(memberId);
    try {
      await organizationService.removeMember(org.id, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch { /* ignore */ }
    setRemoving(null);
  };

  const handleChangeRole = async (memberId: string, role: string) => {
    try {
      await organizationService.updateMemberRole(org.id, memberId, role);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: role as any } : m));
    } catch { /* ignore */ }
  };

  const handleTransfer = async () => {
    if (!transferTarget) return;
    try {
      await organizationService.transferOwnership(org.id, transferTarget.userId);
      setTransferTarget(null);
      loadMembers();
      onUpdate(); // refresh my role (owner → admin)
    } catch { setTransferTarget(null); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await organizationService.update(org.id, { name: editName, description: editDesc || undefined });
      setEditing(false);
      onUpdate();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await organizationService.delete(org.id);
      onDelete(org.id);
    } catch { /* ignore */ }
  };

  const copySlug = () => {
    navigator.clipboard.writeText(org.slug);
    setSlugCopied(true);
    setTimeout(() => setSlugCopied(false), 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 overflow-hidden transition-all">
      {/* header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{org.name}</span>
            <RoleBadge role={myRole} />
            {org.isPersonal && (
              <span className="text-[9px] px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded">Personal</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{org.slug}</span>
            {org.memberCount !== undefined && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {org.memberCount} {org.memberCount === 1 ? 'member' : 'members'}
              </span>
            )}
            {org.planCount !== undefined && org.planCount > 0 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {org.planCount} {org.planCount === 1 ? 'plan' : 'plans'}
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
      </button>

      {/* expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800/60">
          {/* tab bar */}
          <div className="flex items-center gap-0.5 px-3 pt-2 border-b border-gray-100 dark:border-gray-800/60 overflow-x-auto">
            {([
              { key: 'details', label: 'Details', icon: Settings2, show: true },
              { key: 'members', label: 'Members', icon: Users, show: true },
              { key: 'activity', label: 'Activity', icon: ActivityIcon, show: isManager },
              { key: 'plans', label: 'Plans', icon: ListChecks, show: isManager },
              { key: 'tokens', label: 'Tokens', icon: KeyRound, show: isManager },
            ] as const).filter(t => t.show).map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as typeof activeTab)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                    activeTab === t.key
                      ? 'border-amber-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Details tab */}
          {activeTab === 'details' && (
          <>
          {/* org details / edit */}
          {editing ? (
            <div className="px-4 py-3 space-y-2 bg-gray-50/50 dark:bg-gray-800/20">
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-amber-500 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="What this organization is about"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-amber-500 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setEditing(false)} className="px-2.5 py-1 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editName.trim()}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex-1 min-w-0">
                {org.description && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{org.description}</p>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">slug: {org.slug}</span>
                  <button onClick={copySlug} className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {slugCopied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                </div>
              </div>
              {isOwner && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditName(org.name); setEditDesc(org.description || ''); setEditing(true); }}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  {!org.isPersonal && (
                    confirmDelete ? (
                      <div className="flex items-center gap-1">
                        <button onClick={handleDelete} className="px-2 py-1 text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          Confirm
                        </button>
                        <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete organization"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          )}
          </>
          )}

          {/* Members tab */}
          {activeTab === 'members' && (
          <div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Members</span>
              <span className="text-[10px] text-gray-400 tabular-nums">{members.length}</span>
            </div>

            {/* transfer-ownership confirm */}
            {transferTarget && (
              <div className="mx-3 mb-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded text-[11px] text-amber-800 dark:text-amber-300">
                <p className="mb-2">Transfer ownership of <b>{org.name}</b> to <b>{transferTarget.name}</b>? You'll become an admin.</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setTransferTarget(null)} className="px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
                  <button onClick={handleTransfer} className="px-2.5 py-1 text-[10px] font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors">Transfer</button>
                </div>
              </div>
            )}

            {loadingMembers ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
                {members.map(member => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    myRole={myRole}
                    onRemove={handleRemoveMember}
                    onChangeRole={handleChangeRole}
                    onTransfer={(userId, name) => setTransferTarget({ userId, name })}
                    removing={removing}
                  />
                ))}
              </div>
            )}

            {/* invite form */}
            {(isOwner || isAdmin) && (
              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-800/20">
                {inviteError && (
                  <div className="mb-2 px-2 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {inviteError}
                  </div>
                )}
                {inviteSuccess && (
                  <div className="mb-2 px-2 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3 h-3 flex-shrink-0" />
                    {inviteSuccess}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <UserPlus className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => { setInviteEmail(e.target.value); setInviteError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                      placeholder="Email address"
                      className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-amber-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                    />
                  </div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="text-[11px] bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    {inviting ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Activity tab */}
          {activeTab === 'activity' && isManager && <ActivityTab orgId={org.id} />}

          {/* Plans tab */}
          {activeTab === 'plans' && isManager && <PlansTab orgId={org.id} />}

          {/* Tokens tab */}
          {activeTab === 'tokens' && isManager && <TokensTab orgId={org.id} canRevoke={isManager} />}
        </div>
      )}
    </div>
  );
};

/* ─── main page ─── */
const OrganizationSettings: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await organizationService.list();
      // Fetch details for each to get memberCount/planCount
      const detailed = await Promise.all(
        res.organizations.map(async (o) => {
          try {
            const detail = await organizationService.get(o.id);
            return { ...o, ...detail };
          } catch {
            return o;
          }
        })
      );
      setOrgs(detailed);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadOrgs(); }, [loadOrgs]);

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await organizationService.create({ name: createName.trim(), description: createDesc.trim() || undefined });
      setCreateName('');
      setCreateDesc('');
      setShowCreate(false);
      loadOrgs();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create organization');
    }
    setCreating(false);
  };

  const handleDelete = (orgId: string) => {
    setOrgs(prev => prev.filter(o => o.id !== orgId));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SettingsNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {/* header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-semibold text-gray-900 dark:text-white">Organizations</h2>
            <span className="text-[10px] text-gray-400 tabular-nums">{orgs.length}</span>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors border border-dashed border-gray-300 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700"
          >
            {showCreate ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showCreate ? 'Cancel' : 'New'}
          </button>
        </div>

        {/* create form */}
        {showCreate && (
          <div className="mb-3 bg-white dark:bg-gray-900/80 rounded-lg border border-amber-200/50 dark:border-amber-800/30 p-4">
            <div className="space-y-2">
              {createError && (
                <div className="px-2 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  {createError}
                </div>
              )}
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Organization Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="e.g. Acme Corp"
                  autoFocus
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-amber-500 dark:text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Description <span className="normal-case opacity-60">(optional)</span></label>
                <input
                  type="text"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="What this organization works on"
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-amber-500 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleCreate}
                  disabled={creating || !createName.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Building2 className="w-3 h-3" />}
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        )}

        {/* org list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : orgs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 py-12 text-center">
            <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No organizations yet</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-4">Create one to collaborate with your team.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Create your first organization
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {orgs.map(org => (
              <OrgCard key={org.id} org={org} onUpdate={loadOrgs} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSettings;
