/**
 * RolesPanel — Setup → Roles & Privileges
 *
 * "Level and depth of control" is a Role: a name plus a set of permission
 * keys. Owner/Admin/Collaborator/Viewer always exist and can't be edited
 * or deleted (the permanent floor of the privilege ladder). Anyone with
 * `manage_roles` can create additional custom privilege levels here with
 * any combination of permissions — this is the "creation of new privilege
 * options" pathway. Project access is intentionally NOT part of a role;
 * it's set per-member in the Members panel, so two members can share a
 * role while seeing different projects.
 */

import { useEffect, useState } from 'react';
import { Plus, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import type { Role, Permission, Member } from '../../types';

interface Props { canManage: boolean; members: Member[] }

export default function RolesPanel({ canManage, members }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [r, p] = await Promise.all([
      api.get<Role[]>('/api/roles'),
      api.get<Permission[]>('/api/permissions'),
    ]);
    setRoles(r.data ?? []);
    setPermissions(p.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePerm = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const memberCount = (roleId: string) => members.filter(m => m.roleId === roleId).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const { data, error } = await api.post<{ ok: boolean }>('/api/roles', { name, description, permissions: [...selected] });
    setSubmitting(false);
    if (!data?.ok) { setFormError(error || 'Could not create role.'); return; }
    setName(''); setDescription(''); setSelected(new Set()); setFormOpen(false);
    load();
  };

  const removeRole = async (role: Role) => {
    if (!confirm(`Delete the "${role.name}" privilege level?`)) return;
    const { error } = await api.del(`/api/roles/${role.id}`);
    if (error) alert(error);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-white/40 leading-relaxed max-w-lg">
          Built-in roles (Owner, Admin, Collaborator, Viewer) are permanent. Create custom privilege levels for any other depth of control you need.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 glass-btn rounded-lg text-white/45 hover:text-white/80 transition text-[10px] font-mono">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {canManage && (
            <button onClick={() => setFormOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-400/20 transition text-[10px] font-mono uppercase">
              <Plus size={11} /> New Privilege Level
            </button>
          )}
        </div>
      </div>

      {formOpen && canManage && (
        <form onSubmit={handleCreate} className="glass-panel rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Name</span>
              <input className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none" placeholder="e.g. Editor" value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Description</span>
              <input className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none" placeholder="What can this role do?" value={description} onChange={e => setDescription(e.target.value)} />
            </label>
          </div>

          <div>
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider block mb-2">Permissions</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permissions.map(p => (
                <label key={p.key} className={`flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition border ${selected.has(p.key) ? 'bg-indigo-500/10 border-indigo-400/30' : 'glass-inner border-transparent'}`}>
                  <input type="checkbox" className="mt-0.5 accent-indigo-400" checked={selected.has(p.key)} onChange={() => togglePerm(p.key)} />
                  <span>
                    <span className="block text-xs text-white/80 font-medium">{p.label}</span>
                    <span className="block text-[10px] text-white/35 leading-snug">{p.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formError && <p className="text-[11px] text-red-400 font-mono">{formError}</p>}
          <button type="submit" disabled={submitting || selected.size === 0} className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/25 text-[11px] font-mono uppercase transition disabled:opacity-40">
            {submitting ? 'Creating…' : 'Create privilege level'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map(role => (
          <div key={role.id} className="glass-panel rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {role.builtIn && <ShieldCheck size={13} className="text-amber-400" />}
                <span className="font-display font-semibold text-sm text-white/88">{role.name}</span>
                {role.builtIn && <span className="font-mono text-[8px] uppercase px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300">Built-in</span>}
              </div>
              {canManage && !role.builtIn && (
                <button onClick={() => removeRole(role)} className="p-1 rounded glass-btn text-white/35 hover:text-red-400 transition">
                  <Trash2 size={11} />
                </button>
              )}
            </div>
            <p className="text-[11px] text-white/45 leading-snug">{role.description}</p>
            <div className="flex flex-wrap gap-1">
              {role.permissions.map(p => (
                <span key={p} className="font-mono text-[8px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-white/40">{p}</span>
              ))}
            </div>
            <div className="font-mono text-[9px] text-white/25 pt-1 border-t glass-divider">{memberCount(role.id)} member(s)</div>
          </div>
        ))}
      </div>
    </div>
  );
}
