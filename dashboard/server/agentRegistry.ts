/**
 * agentRegistry.ts — The standard pathway for adding/removing agents.
 *
 * Previously the agent list was a hardcoded string array
 * (`['claude', 'chatgpt', 'gemini', 'cursor']`) duplicated across six
 * places in server/index.ts, parsers.ts, types.ts, and AgentHub.tsx.
 * Cursor is removed here by simply not seeding it into the registry —
 * its wiki/_agents/cursor/ history is left untouched on disk, it just no
 * longer appears anywhere in the live dashboard.
 *
 * Every other file now reads the agent list from here (backed by
 * wiki/_meta/agents.json), so adding a new agent is a data operation via
 * the Setup → Agents panel, not a code change.
 */

import fs from 'fs';
import path from 'path';
import { readJSON, writeJSON, newId } from './store.js';

export type AgentKind = 'native' | 'web';

export interface AgentConfig {
  id: string;
  label: string;
  color: string;
  kind: AgentKind;
  focusTarget: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
}

const AGENTS_FILE = 'agents.json';

/** Rotating fallback palette for agents added without an explicit color. */
const PALETTE = ['#06b6d4', '#ec4899', '#84cc16', '#f59e0b', '#8b5cf6', '#14b8a6', '#f43f5e', '#3b82f6'];

function seedDefaults(): AgentConfig[] {
  const now = new Date().toISOString();
  return [
    { id: 'claude', label: 'Claude', color: '#f97316', kind: 'native', focusTarget: 'claude-app://focus', active: true, createdAt: now, createdBy: 'system' },
    { id: 'chatgpt', label: 'ChatGPT', color: '#10b981', kind: 'web', focusTarget: 'https://chat.openai.com', active: true, createdAt: now, createdBy: 'system' },
    { id: 'gemini', label: 'Gemini', color: '#6366f1', kind: 'web', focusTarget: 'https://gemini.google.com', active: true, createdAt: now, createdBy: 'system' },
    // 'cursor' intentionally omitted — removed from the active roster.
    // wiki/_agents/cursor/ is left on disk untouched if it exists.
  ];
}

export function listAgents(sbRoot: string): AgentConfig[] {
  let agents = readJSON<AgentConfig[]>(sbRoot, AGENTS_FILE, []);
  if (agents.length === 0) {
    agents = seedDefaults();
    writeJSON(sbRoot, AGENTS_FILE, agents);
  }
  return agents;
}

export function listActiveAgentIds(sbRoot: string): string[] {
  return listAgents(sbRoot).filter(a => a.active).map(a => a.id);
}

export function isKnownAgent(sbRoot: string, id: string): boolean {
  return listActiveAgentIds(sbRoot).includes(id);
}

function slugify(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Scaffold the three wiki files an agent needs (status/inbox/outbox),
 *  mirroring the exact template already used by claude/chatgpt/gemini so
 *  parsers.ts's markdown parsing keeps working unmodified. */
function scaffoldAgentWiki(sbRoot: string, id: string): void {
  const dir = path.join(sbRoot, 'wiki/_agents', id);
  fs.mkdirSync(dir, { recursive: true });

  const statusPath = path.join(dir, 'status.md');
  if (!fs.existsSync(statusPath)) {
    fs.writeFileSync(statusPath, `# ${id} Status\n\n*Current session state for ${id}.*\n\n---\n\nLast active: —\nCurrent task: —\nAwaiting: —`, 'utf-8');
  }
  const inboxPath = path.join(dir, 'inbox.md');
  if (!fs.existsSync(inboxPath)) {
    fs.writeFileSync(inboxPath, `# ${id} Inbox\n\n*Unresolved findings and questions awaiting ${id} review. Do not promote to canonical wiki articles until verified.*\n\n---\n\n*No entries yet.*\n`, 'utf-8');
  }
  const outboxPath = path.join(dir, 'outbox.md');
  if (!fs.existsSync(outboxPath)) {
    fs.writeFileSync(outboxPath, `# ${id} Outbox\n\n*Findings and work products ready for review or promotion to canonical wiki articles.*\n\n---\n\n*No entries yet.*`, 'utf-8');
  }
}

/** The standard setup pathway: validate a unique slug id, assign a color
 *  if none given, scaffold its wiki folder, and register it as active. */
export function addAgent(
  sbRoot: string,
  input: { label: string; kind: AgentKind; focusTarget: string; color?: string },
  createdBy: string
): AgentConfig {
  const agents = listAgents(sbRoot);
  let id = slugify(input.label);
  if (!id) throw new Error('Agent label must contain at least one letter or number.');
  if (agents.some(a => a.id === id)) throw new Error(`An agent with id "${id}" already exists.`);
  if (!input.focusTarget || !input.focusTarget.trim()) throw new Error('focusTarget is required (a URL, or a custom:// scheme for native apps).');

  const color = input.color || PALETTE[agents.length % PALETTE.length];
  const agent: AgentConfig = {
    id, label: input.label, color, kind: input.kind, focusTarget: input.focusTarget,
    active: true, createdAt: new Date().toISOString(), createdBy,
  };
  scaffoldAgentWiki(sbRoot, id);
  writeJSON(sbRoot, AGENTS_FILE, [...agents, agent]);
  return agent;
}

export function updateAgent(sbRoot: string, id: string, patch: Partial<Pick<AgentConfig, 'label' | 'color' | 'kind' | 'focusTarget' | 'active'>>): AgentConfig {
  const agents = listAgents(sbRoot);
  const idx = agents.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Agent not found in registry.');
  agents[idx] = { ...agents[idx], ...patch };
  writeJSON(sbRoot, AGENTS_FILE, agents);
  return agents[idx];
}

/** Removes the agent from the registry (it disappears from the live
 *  dashboard immediately). wiki/_agents/<id>/ is deliberately NOT deleted
 *  from disk — history is preserved in case the agent is re-added later,
 *  the same non-destructive treatment applied when Cursor was removed. */
export function removeAgent(sbRoot: string, id: string): void {
  const agents = listAgents(sbRoot);
  if (!agents.some(a => a.id === id)) throw new Error('Agent not found in registry.');
  writeJSON(sbRoot, AGENTS_FILE, agents.filter(a => a.id !== id));
}
