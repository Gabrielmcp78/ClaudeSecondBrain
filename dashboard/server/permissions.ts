/**
 * permissions.ts — Permission catalog + built-in privilege levels (roles)
 *
 * "Level and depth of control" in the dashboard maps to a Role, which is
 * just a named bundle of permission keys. Built-in roles (owner, admin,
 * collaborator, viewer) always exist and cannot be edited or deleted, so
 * there is always a safe default ladder of access. Anyone with the
 * `manage_roles` permission (Owner, by default) can create additional
 * custom privilege levels with any combination of these permissions —
 * this is the "creation of new privilege options" pathway.
 *
 * Project access (which project(s) a member may see/act on) is a
 * SEPARATE axis from role, stored per-member in members.json as
 * `projectAccess: { allProjects, projects[] }`. Two members can share the
 * same role (same depth of control) while having different project scopes.
 */

export interface Permission {
  key: string;
  label: string;
  description: string;
}

/** Canonical permission catalog. Server routes enforce these; the Setup
 *  UI's Role editor renders this list as the checklist for custom roles. */
export const PERMISSIONS: Permission[] = [
  { key: 'view_dashboard', label: 'View dashboard', description: 'View the knowledge graph, task ledger, and command rail (handoffs, decisions, raw queue).' },
  { key: 'view_agents', label: 'View agent hub', description: 'View agent status cards, task assignments, inbox, and outbox.' },
  { key: 'dispatch_agents', label: 'Dispatch to agents', description: 'Send directed dispatches, wake-up calls, and broadcasts to agent inboxes.' },
  { key: 'delegate_tasks', label: 'Delegate tasks', description: 'Create new tasks in the task ledger and assign them to an agent.' },
  { key: 'manage_agents', label: 'Manage agent registry', description: 'Add new agents through the setup wizard, edit agent details, activate/deactivate, or remove agents.' },
  { key: 'manage_members', label: 'Manage members', description: 'Invite new human members (local or remote), edit their role and project access, disable or remove them.' },
  { key: 'manage_roles', label: 'Manage roles & privileges', description: 'Create, edit, and delete custom privilege levels (roles). Built-in roles are always protected.' },
  { key: 'manage_system', label: 'Full system administration', description: 'Superset flag granted to Owner; treated as "all permissions" everywhere permissions are checked.' },
];

export const PERMISSION_KEYS = PERMISSIONS.map(p => p.key);

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  builtIn: boolean;
  createdAt: string;
  createdBy: string;
}

const now = () => new Date().toISOString();

/** Seeded once, on first server start, into wiki/_meta/roles.json.
 *  Built-in roles are never mutated or deleted by the API — they are the
 *  permanent floor of the privilege ladder. */
export function builtInRoles(): Role[] {
  return [
    {
      id: 'owner', name: 'Owner', builtIn: true, createdAt: now(), createdBy: 'system',
      description: 'Full control of the SecondBrain system, including creating new privilege levels and managing every member and agent.',
      permissions: PERMISSION_KEYS,
    },
    {
      id: 'admin', name: 'Admin', builtIn: true, createdAt: now(), createdBy: 'system',
      description: 'Operates day-to-day and manages agents and members, but cannot redefine the privilege structure itself.',
      permissions: ['view_dashboard', 'view_agents', 'dispatch_agents', 'delegate_tasks', 'manage_agents', 'manage_members'],
    },
    {
      id: 'collaborator', name: 'Collaborator', builtIn: true, createdAt: now(), createdBy: 'system',
      description: 'Full working access to the dashboard and agent hub — can dispatch agents and delegate tasks — without admin controls.',
      permissions: ['view_dashboard', 'view_agents', 'dispatch_agents', 'delegate_tasks'],
    },
    {
      id: 'viewer', name: 'Viewer', builtIn: true, createdAt: now(), createdBy: 'system',
      description: 'Read-only access to the dashboard and agent hub. Cannot send dispatches or create tasks.',
      permissions: ['view_dashboard', 'view_agents'],
    },
  ];
}

/** True if a role grants a given permission key. `manage_system` acts as a
 *  wildcard superset, matching Gabriel's directive that Owner always has
 *  unrestricted access even as new permission keys are added later. */
export function roleHasPermission(role: Role | undefined | null, permKey: string): boolean {
  if (!role) return false;
  if (role.permissions.includes('manage_system')) return true;
  return role.permissions.includes(permKey);
}
