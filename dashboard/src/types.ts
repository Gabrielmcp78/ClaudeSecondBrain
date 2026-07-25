// Shared types used across all dashboard components.
// Mirror the server-side types in server/parsers.ts.

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked' | 'cancelled';
  owner: string;
  requestedBy: string;
  project: string;
  priority: 'high' | 'normal' | 'low';
  outputs: string[];
  notes: string;
}

export interface Handoff {
  date: string;
  from: string;
  to: string;
  completed: string[];
  doNotDo: string[];
  nextMove: string;
  openQuestions: string[];
}

export interface Decision {
  id: string;
  date: string;
  decidedBy: string;
  context: string;
  decision: string;
  appliesTo: string[];
  rationale: string;
  reopeningCondition: string;
}

export interface AgentStatus {
  name: string;
  lastActive: string;
  currentTask: string;
  awaiting: string;
  inboxCount: number;
  inboxMessages: string[];
  outboxCount: number;
}

export interface InboxEntry {
  date: string;
  from: string;
  priority: 'high' | 'normal' | 'low' | null;
  taskRef: string;
  message: string;
}

export interface Connection {
  source: string;
  target: string;
  sourceDomain: string;
  targetDomain: string;
  description: string;
  sourcePath: string | null;
  targetPath: string | null;
}

export interface SystemStats {
  articleCount: number;
  rawQueueSize: number;
  processedCount: number;
  connectionCount: number;
  lastIngest: string;
}

// Domain color mapping — shared between graph and agent hub
export const DOMAIN_COLORS: Record<string, string> = {
  'theory-consciousness': '#6366f1',
  'craft-fiction': '#10b981',
  'dev-projects': '#f43f5e',
  'dev-infrastructure': '#06b6d4',
  'ai-collaboration': '#a855f7',
  'reference-external': '#0ea5e9',
  'decision-records': '#f59e0b',
  'core-principles': '#eab308',
  'music-performance': '#ec4899',
  'unknown': '#475569',
};

// ── Agent registry (dynamic — see server/agentRegistry.ts) ─────────────────
//
// The agent roster (which used to be a hardcoded 4-entry array including
// Cursor) is now server-driven data, fetched from GET /api/agents/registry
// and added/removed through the Setup → Agents panel. AGENT_COLORS/LABELS
// below are built at runtime from that response — see buildAgentMaps().

export interface AgentConfig {
  id: string;
  label: string;
  color: string;
  kind: 'native' | 'web';
  focusTarget: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export function buildAgentMaps(agents: AgentConfig[]) {
  const colors: Record<string, string> = {};
  const labels: Record<string, string> = {};
  const focusTargets: Record<string, string> = {};
  for (const a of agents) {
    colors[a.id] = a.color;
    labels[a.id] = a.label;
    // claude-app://... and similar custom schemes are intercepted natively
    // in AgentHub rather than window.open'd like a normal web URL.
    focusTargets[a.id] = a.focusTarget;
  }
  return { colors, labels, focusTargets };
}

// ── Access control (members, roles, permissions) ───────────────────────────

export interface Permission {
  key: string;
  label: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  builtIn: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ProjectAccess {
  allProjects: boolean;
  projects: string[];
}

export type MemberStatus = 'active' | 'invited' | 'disabled';

export interface Member {
  id: string;
  name: string;
  email: string;
  roleId: string;
  projectAccess: ProjectAccess;
  remote: boolean;
  status: MemberStatus;
  createdAt: string;
  createdBy: string;
  lastLogin: string | null;
  inviteUrl?: string; // only present for status:'invited' when requester has manage_members
}

export interface AuthState {
  authenticated: boolean;
  bootstrapRequired: boolean;
  member?: Member;
  role?: Role;
  permissions: string[];
}
