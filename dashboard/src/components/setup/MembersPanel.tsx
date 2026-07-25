/**
 * MembersPanel — Setup → Members
 *
 * Invite human members, assign their privilege level (role) and project
 * access scope, and flag whether they're remote (not on Gabriel's local
 * network). Invited members get a copyable link — there's no outbound
 * email integration here, so the inviter shares the link through whatever
 * channel reaches that person (text, email client, Slack, etc.). The link
 * works the same regardless of network: it's just a URL to wherever this
 * dashboard is reachable (see README § Remote members for exposing the
 * dashboard beyond localhost).
 */

import { useEffect, useState } from 'react';
import { Plus, Trash2, Copy, RotateCw, Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import { api } from '../../lib/api';
import type { Member, Role } from '../../types';

interface Props { canManage: boolean; knownProjects: string[] }

function RoleBadge({ role }: { role?: Role }) {
  if (!role) return <span className="font-mono text-[9px] text-white/30">—</span>;
  return <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">{role.name}</span>;
}

function StatusBadge({ status }: { status: Member['status'] }) {
  const map: Record<Member['status'], string> = {
    active: 'text-emerald-400 bg-emerald-400/10',
    invited: 'text-amber-400 bg-amber-400/10',
    disabled: 'text-white/30 bg-white/5',
  };
  return <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded ${map[status]}`}>{status}</span>;
}

export default function MembersPanel({ canManage, knownProjects }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Invite form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('collaborator');
  const [remote, setRemote] = useState(false);
  const [allProjects, setAllProjects] = useState(true);
  const [projects, setProjects] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [m, r] = await Promise.all([
      api.get<Member[]>('/api/members'),
      api.get<Role[]>('/api/roles'),
    ]);
    setMembers(m.data ?? []);
    setRoles(r.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const roleById = (id: string) => roles.find(r => r.id === id);

  const toggleProject = (p: string) => {
    setProjects(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setLastInviteUrl(null);
    const { data, error } = await api.post<{ ok: boolean; member: Member }>('/api/members', {
      name, email, roleId, remote,
      projectAccess: { allProjects, projects: allProjects ? [] : [...projects] },
    });
    setSubmitting(false);
    if (!data?.ok) { setFormError(error || 'Could not invite member.'); return; }
    setLastInviteUrl(data.member.inviteUrl ?? null);
    setName(''); setEmail(''); setProjects(new Set());
    load();
  };

  const copyInvite = (url: string, id: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resend = async (id: string) => {
    const { data } = await api.post<{ ok: boolean; member: Member }>(`/api/members/${id}/resend-invite`);
    if (data?.member.inviteUrl) copyInvite(data.member.inviteUrl, id);
    load();
  };

  const setStatus = async (id: string, status: Member['status']) => {
    await api.patch(`/api/members/${id}`, { status });
    load();
  };

  const setRole = async (id: string, newRoleId: string) => {
    await api.patch(`/api/members/${id}`, { roleId: newRoleId });
    load();
  };

  const removeMember = async (m: Member) => {
    if (!confirm(`Remove ${m.name} (${m.email})? This revokes their access immediately.`)) return;
    await api.del(`/api/members/${m.id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-white/40 leading-relaxed max-w-lg">
          Invite human collaborators — local or remote. Level of control comes from their Role; project scope is set independently below.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 glass-btn rounded-lg text-white/45 hover:text-white/80 transition text-[10px] font-mono">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {canManage && (
            <button onClick={() => setFormOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-400/20 transition text-[10px] font-mono uppercase">
              <Plus size={11} /> Invite Member
            </button>
          )}
        </div>
      </div>

      {formOpen && canManage && (
        <form onSubmit={handleInvite} className="glass-panel rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Name</span>
              <input className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none" value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Email</span>
              <input type="email" className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Level of control (role)</span>
              <select className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none" value={roleId} onChange={e => setRoleId(e.target.value)}>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}{r.builtIn ? '' : ' (custom)'}</option>)}
              </select>
              {roleById(roleId) && <p className="text-[10px] text-white/30 mt-1 leading-snug">{roleById(roleId)!.description}</p>}
            </label>
            <label className="flex items-center gap-2 py-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} className="accent-amber-400" />
              <span className="text-xs text-white/65">Off local network (remote member)</span>
            </label>
          </div>

          {remote && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[11px] text-amber-200 leading-snug">
              <WifiOff size={13} className="shrink-0 mt-0.5" />
              This person isn't on Gabriel's LAN. The invite link only works if they can reach this dashboard's host — expose it via a tunnel/VPN (Tailscale, Cloudflare Tunnel) or set PUBLIC_URL in .env, then share the generated link below through any channel.
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
              <input type="checkbox" checked={allProjects} onChange={e => setAllProjects(e.target.checked)} className="accent-indigo-400" />
              <span className="text-xs text-white/65 font-mono uppercase tracking-wider">All projects</span>
            </label>
            {!allProjects && (
              <div className="flex flex-wrap gap-2">
                {knownProjects.length === 0 && <span className="text-[10px] text-white/25 font-mono">No projects found yet in the task ledger.</span>}
                {knownProjects.map(p => (
                  <button type="button" key={p} onClick={() => toggleProject(p)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition ${projects.has(p) ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200' : 'glass-inner text-white/35 border-transparent'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {formError && <p className="text-[11px] text-red-400 font-mono">{formError}</p>}
          {lastInviteUrl && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-[11px] text-emerald-200">
              <span className="flex-1 truncate font-mono">{lastInviteUrl}</span>
              <button type="button" onClick={() => copyInvite(lastInviteUrl, 'new')} className="shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/15">
                {copiedId === 'new' ? <Check size={11} /> : <Copy size={11} />} Copy
              </button>
            </div>
          )}

          <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/25 text-[11px] font-mono uppercase transition disabled:opacity-40">
            {submitting ? 'Inviting…' : 'Send invite link'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {members.map(m => (
          <div key={m.id} className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="min-w-[160px]">
              <div className="text-sm font-medium text-white/85 flex items-center gap-1.5">
                {m.name}
                {m.remote ? <Wifi size={11} className="text-amber-400" /> : <WifiOff size={11} className="text-white/20" />}
              </div>
              <div className="font-mono text-[9px] text-white/35">{m.email}</div>
            </div>

            <div className="flex items-center gap-1.5">
              <StatusBadge status={m.status} />
              {canManage ? (
                <select value={m.roleId} onChange={e => setRole(m.id, e.target.value)} className="font-mono text-[9px] uppercase bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-indigo-300 outline-none">
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              ) : (
                <RoleBadge role={roleById(m.roleId)} />
              )}
            </div>

            <div className="font-mono text-[9px] text-white/30">
              {m.projectAccess.allProjects ? 'All projects' : (m.projectAccess.projects.join(', ') || 'No projects')}
            </div>

            <div className="font-mono text-[9px] text-white/25 ml-auto">
              {m.lastLogin ? `Last login ${new Date(m.lastLogin).toLocaleDateString()}` : 'Never signed in'}
            </div>

            {canManage && (
              <div className="flex items-center gap-1 shrink-0">
                {m.status === 'invited' && m.inviteUrl && (
                  <button onClick={() => copyInvite(m.inviteUrl!, m.id)} title="Copy invite link" className="p-1.5 rounded-lg glass-btn text-white/40 hover:text-emerald-300 transition">
                    {copiedId === m.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
                {m.status === 'invited' && (
                  <button onClick={() => resend(m.id)} title="Resend / regenerate invite" className="p-1.5 rounded-lg glass-btn text-white/40 hover:text-white/80 transition">
                    <RotateCw size={12} />
                  </button>
                )}
                {m.status !== 'invited' && (
                  <button
                    onClick={() => setStatus(m.id, m.status === 'active' ? 'disabled' : 'active')}
                    title={m.status === 'active' ? 'Disable' : 'Re-activate'}
                    className="px-2 py-1 rounded-lg glass-btn text-white/40 hover:text-white/80 transition text-[9px] font-mono uppercase"
                  >
                    {m.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                )}
                <button onClick={() => removeMember(m)} title="Remove" className="p-1.5 rounded-lg glass-btn text-white/40 hover:text-red-400 transition">
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && !loading && (
          <p className="text-white/25 font-mono text-xs">No members yet.</p>
        )}
      </div>
    </div>
  );
}
