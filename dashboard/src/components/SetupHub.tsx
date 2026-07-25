/**
 * SetupHub — "Setup" tab root.
 *
 * Three subtabs, each independently permission-gated so a custom role
 * that has e.g. only `manage_agents` still gets a useful Setup tab instead
 * of an all-or-nothing wall:
 *   - Agents   → standard pathway for adding/removing agents (manage_agents)
 *   - Members  → invite/manage human members, local or remote (manage_members)
 *   - Roles    → create new privilege levels (manage_roles)
 */

import { useEffect, useState } from 'react';
import { Bot, Users, ShieldCheck } from 'lucide-react';
import AgentsPanel from './setup/AgentsPanel';
import MembersPanel from './setup/MembersPanel';
import RolesPanel from './setup/RolesPanel';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { Member, Task } from '../types';

type SubTab = 'agents' | 'members' | 'roles';

export default function SetupHub({ tasks }: { tasks: Task[] }) {
  const { hasPermission } = useAuth();
  const canAgents = hasPermission('manage_agents');
  const canMembers = hasPermission('manage_members');
  const canRoles = hasPermission('manage_roles');

  const firstAvailable: SubTab = canAgents ? 'agents' : canMembers ? 'members' : 'roles';
  const [sub, setSub] = useState<SubTab>(firstAvailable);

  // RolesPanel shows a per-role member count, which needs the members
  // list even when the viewer only has manage_roles (not manage_members).
  const [members, setMembers] = useState<Member[]>([]);
  useEffect(() => {
    if (canMembers) api.get<Member[]>('/api/members').then(({ data }) => setMembers(data ?? []));
  }, [canMembers]);

  const knownProjects = Array.from(new Set(tasks.map(t => t.project).filter(Boolean))).sort();

  const SUBTABS: { id: SubTab; label: string; Icon: typeof Bot; visible: boolean }[] = [
    { id: 'agents', label: 'Agents', Icon: Bot, visible: true }, // view_agents suffices to see (read-only if !canAgents)
    { id: 'members', label: 'Members', Icon: Users, visible: canMembers },
    { id: 'roles', label: 'Roles & Privileges', Icon: ShieldCheck, visible: canRoles },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-wider uppercase text-white/75">Setup</h2>
      </div>

      <div className="flex gap-1 border-b glass-divider">
        {SUBTABS.filter(t => t.visible).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono tracking-wider uppercase border-b-2 transition ${
              sub === id ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-white/35 hover:text-white/65'
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {sub === 'agents' && <AgentsPanel canManage={canAgents} />}
      {sub === 'members' && canMembers && <MembersPanel canManage={canMembers} knownProjects={knownProjects} />}
      {sub === 'roles' && canRoles && <RolesPanel canManage={canRoles} members={members} />}
    </div>
  );
}
