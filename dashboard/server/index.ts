/**
 * SecondBrain Dashboard — Express API Server
 *
 * Runs on port 10888. In production, also serves the Vite-built
 * static frontend from /dist. In development, the Vite dev server
 * (port 10889) proxies /api requests here.
 *
 * All reads are from the SecondBrain directory on disk.
 * Writes are append-only to agent inbox files (Wake Up action), or go
 * through the access-control JSON stores in wiki/_meta/ (members, roles,
 * sessions, agents registry — see store.ts / auth.ts / agentRegistry.ts).
 *
 * Access control: every /api/* route except /api/auth/* and
 * /api/invites/* requires a valid session (see auth.ts). Write/admin
 * routes additionally require a specific permission on the caller's role.
 *
 * Start: npx tsx server/index.ts
 * Always-on: see launchd/com.gabrielmcp.sbbrain.dashboard.plist
 */

import 'dotenv/config'; // loads dashboard/.env, if present, before any process.env reads below
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import {
  parseTasks,
  parseHandoffs,
  parseDecisions,
  parseAgents,
  parseConnections,
  parseSystemStats,
  parseRawQueue,
  parseInboxEntries,
} from './parsers.js';
import {
  attachUser, requireAuth, requirePermission, canAccessProject, publicMember,
  bootstrapRequired, createOwner, verifyLogin, touchLastLogin,
  createSession, destroySession, cookieOptions, SESSION_COOKIE,
  listMembers, getMemberById, inviteMember, resendInvite, updateMember, deleteMember,
  findInvite, isInviteExpired, redeemInvite,
  listRoles, getRoleById, createRole, updateRole, deleteRole,
  type AuthedRequest,
} from './auth.js';
import { PERMISSIONS } from './permissions.js';
import { listAgents, listActiveAgentIds, addAgent, updateAgent, removeAgent } from './agentRegistry.js';

// ── Config ─────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 10888;

// In production the bundle lives at dashboard/dist-server/index.js.
// process.cwd() is set to the dashboard/ directory by the launchd plist.
// In dev (tsx watch), process.cwd() is also dashboard/.
const DASHBOARD_ROOT = process.cwd();

// SecondBrain root — one directory up from dashboard/
const SB_ROOT = path.resolve(DASHBOARD_ROOT, '..');

// Used to build absolute invite links. Set PUBLIC_URL in .env when the
// dashboard is reachable through a tunnel/VPN/reverse-proxy hostname
// rather than localhost — see README § Remote members.
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser(SB_ROOT));

// ── Auth routes (public) ─────────────────────────────────────────────────

/** Tells the frontend whether to show the "create Owner account" screen
 *  or the normal login screen. */
app.get('/api/auth/status', (_req, res) => {
  res.json({ bootstrapRequired: bootstrapRequired(SB_ROOT) });
});

/** One-time: create the Owner account. Refuses if any member already
 *  exists (see auth.ts createOwner). */
app.post('/api/auth/bootstrap', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || password.length < 8) {
    res.status(400).json({ error: 'name, email, and a password of at least 8 characters are required.' });
    return;
  }
  try {
    const member = createOwner(SB_ROOT, name, email, password);
    const session = createSession(SB_ROOT, member.id);
    res.cookie(SESSION_COOKIE, session.token, cookieOptions());
    res.json({ ok: true, member: publicMember(member) });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  const member = verifyLogin(SB_ROOT, email, password);
  if (!member) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }
  touchLastLogin(SB_ROOT, member.id);
  const session = createSession(SB_ROOT, member.id);
  res.cookie(SESSION_COOKIE, session.token, cookieOptions());
  res.json({ ok: true, member: publicMember(member) });
});

app.post('/api/auth/logout', (req: AuthedRequest, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) destroySession(SB_ROOT, token);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
});

/** Current session state. Always 200 — the frontend branches on the
 *  `authenticated` / `bootstrapRequired` fields rather than HTTP status,
 *  so a single call on app load can drive Login vs Bootstrap vs Dashboard. */
app.get('/api/auth/me', (req: AuthedRequest, res) => {
  if (!req.member) {
    res.json({ authenticated: false, bootstrapRequired: bootstrapRequired(SB_ROOT) });
    return;
  }
  const permissions = req.role?.permissions ?? [];
  res.json({
    authenticated: true,
    member: publicMember(req.member),
    role: req.role,
    permissions: permissions.includes('manage_system') ? PERMISSIONS.map(p => p.key) : permissions,
  });
});

// ── Invite redemption (public — the whole point is it works pre-auth,
//    from any network) ────────────────────────────────────────────────────

app.get('/api/invites/:token', (req, res) => {
  const invite = findInvite(SB_ROOT, req.params.token);
  if (!invite) { res.status(404).json({ error: 'Invite not found or already used.' }); return; }
  if (isInviteExpired(invite)) { res.status(410).json({ error: 'Invite has expired. Ask an admin to resend it.' }); return; }
  const role = getRoleById(SB_ROOT, invite.roleId);
  res.json({ name: invite.name, email: invite.email, roleName: role?.name ?? invite.roleId, remote: invite.remote });
});

app.post('/api/invites/:token/redeem', (req, res) => {
  const { name, password } = req.body || {};
  if (!password || password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters.' }); return; }
  try {
    const member = redeemInvite(SB_ROOT, req.params.token, name, password);
    const session = createSession(SB_ROOT, member.id);
    res.cookie(SESSION_COOKIE, session.token, cookieOptions());
    res.json({ ok: true, member: publicMember(member) });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

// ── Members (requires manage_members, except self-read via /api/auth/me) ──

app.get('/api/members', requireAuth, requirePermission('manage_members'), (req: AuthedRequest, res) => {
  const members = listMembers(SB_ROOT).map(m => {
    const safe = publicMember(m) as any;
    // Surface a ready-to-copy invite link for pending invites so the
    // inviter can hand it to someone off-network through any channel.
    if (m.status === 'invited' && m.inviteToken) {
      safe.inviteUrl = `${PUBLIC_URL}/?invite=${m.inviteToken}`;
    }
    return safe;
  });
  res.json(members);
});

app.post('/api/members', requireAuth, requirePermission('manage_members'), (req: AuthedRequest, res) => {
  const { name, email, roleId, projectAccess, remote } = req.body || {};
  if (!name || !email || !roleId) { res.status(400).json({ error: 'name, email, and roleId are required.' }); return; }
  if (!getRoleById(SB_ROOT, roleId)) { res.status(400).json({ error: `Unknown roleId "${roleId}".` }); return; }
  try {
    const member = inviteMember(SB_ROOT, {
      name, email, roleId,
      projectAccess: projectAccess || { allProjects: true, projects: [] },
      remote: Boolean(remote),
    }, req.member!.name);
    res.json({ ok: true, member: { ...publicMember(member), inviteUrl: `${PUBLIC_URL}/?invite=${member.inviteToken}` } });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

app.patch('/api/members/:id', requireAuth, requirePermission('manage_members'), (req, res) => {
  try {
    const member = updateMember(SB_ROOT, req.params.id, req.body || {});
    res.json({ ok: true, member: publicMember(member) });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

app.delete('/api/members/:id', requireAuth, requirePermission('manage_members'), (req, res) => {
  try {
    deleteMember(SB_ROOT, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

app.post('/api/members/:id/resend-invite', requireAuth, requirePermission('manage_members'), (req, res) => {
  try {
    const member = resendInvite(SB_ROOT, req.params.id);
    res.json({ ok: true, member: { ...publicMember(member), inviteUrl: `${PUBLIC_URL}/?invite=${member.inviteToken}` } });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

// ── Roles / privilege levels ────────────────────────────────────────────

/** Any authenticated member can read the role list (needed to render role
 *  names/badges), but only manage_roles can create/edit/delete. */
app.get('/api/roles', requireAuth, (_req, res) => {
  res.json(listRoles(SB_ROOT));
});

app.get('/api/permissions', requireAuth, (_req, res) => {
  res.json(PERMISSIONS);
});

app.post('/api/roles', requireAuth, requirePermission('manage_roles'), (req: AuthedRequest, res) => {
  const { name, description, permissions } = req.body || {};
  if (!name || !Array.isArray(permissions) || permissions.length === 0) {
    res.status(400).json({ error: 'name and a non-empty permissions[] array are required.' });
    return;
  }
  try {
    const role = createRole(SB_ROOT, { name, description: description || '', permissions }, req.member!.name);
    res.json({ ok: true, role });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

app.patch('/api/roles/:id', requireAuth, requirePermission('manage_roles'), (req, res) => {
  try {
    const role = updateRole(SB_ROOT, req.params.id, req.body || {});
    res.json({ ok: true, role });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

app.delete('/api/roles/:id', requireAuth, requirePermission('manage_roles'), (req, res) => {
  try {
    deleteRole(SB_ROOT, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

// ── Agent registry (the standard "add an agent" setup pathway) ─────────────

app.get('/api/agents/registry', requireAuth, requirePermission('view_agents'), (_req, res) => {
  res.json(listAgents(SB_ROOT));
});

app.post('/api/agents/registry', requireAuth, requirePermission('manage_agents'), (req: AuthedRequest, res) => {
  const { label, kind, focusTarget, color } = req.body || {};
  if (!label || !kind || !focusTarget) { res.status(400).json({ error: 'label, kind, and focusTarget are required.' }); return; }
  if (kind !== 'native' && kind !== 'web') { res.status(400).json({ error: 'kind must be "native" or "web".' }); return; }
  try {
    const agent = addAgent(SB_ROOT, { label, kind, focusTarget, color }, req.member!.name);
    res.json({ ok: true, agent });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

app.patch('/api/agents/registry/:id', requireAuth, requirePermission('manage_agents'), (req, res) => {
  try {
    const agent = updateAgent(SB_ROOT, req.params.id, req.body || {});
    res.json({ ok: true, agent });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

app.delete('/api/agents/registry/:id', requireAuth, requirePermission('manage_agents'), (req, res) => {
  try {
    removeAgent(SB_ROOT, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: String((err as Error).message || err) });
  }
});

// ── Core dashboard data routes (all require an authenticated session) ──────

/** System health and stats */
app.get('/api/system', requireAuth, requirePermission('view_dashboard'), (_req, res) => {
  try {
    res.json(parseSystemStats(SB_ROOT));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** All tasks from task-ledger.md, scoped to the caller's project access.
 *  Members with `allProjects` see everything; others only see tasks whose
 *  `project` field is in their projectAccess.projects list. */
app.get('/api/tasks', requireAuth, requirePermission('view_dashboard'), (req: AuthedRequest, res) => {
  try {
    const tasks = parseTasks(SB_ROOT);
    const member = req.member!;
    const scoped = member.projectAccess.allProjects
      ? tasks
      : tasks.filter(t => canAccessProject(member, t.project));
    res.json(scoped);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** Recent handoffs, newest first */
app.get('/api/handoffs', requireAuth, requirePermission('view_dashboard'), (_req, res) => {
  try {
    res.json(parseHandoffs(SB_ROOT));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** Settled decisions from decision-registry.md */
app.get('/api/decisions', requireAuth, requirePermission('view_dashboard'), (_req, res) => {
  try {
    res.json(parseDecisions(SB_ROOT));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** Agent status and inbox state for all active agents */
app.get('/api/agents', requireAuth, requirePermission('view_agents'), (_req, res) => {
  try {
    res.json(parseAgents(SB_ROOT));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** Live connection graph from _connections.md */
app.get('/api/graph', requireAuth, requirePermission('view_dashboard'), (_req, res) => {
  try {
    res.json(parseConnections(SB_ROOT));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** Unprocessed raw/ files */
app.get('/api/raw-queue', requireAuth, requirePermission('view_dashboard'), (_req, res) => {
  try {
    res.json(parseRawQueue(SB_ROOT));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Wake up an agent — appends a timestamped message to their inbox.md.
 * Body: { message?: string }
 */
app.post('/api/agents/:agent/wake', requireAuth, requirePermission('dispatch_agents'), (req, res) => {
  const { agent } = req.params;
  if (!listActiveAgentIds(SB_ROOT).includes(agent)) {
    res.status(400).json({ error: 'Unknown agent' });
    return;
  }

  const message = req.body?.message || 'Gabriel requests your attention. Check task-ledger.md and handoffs.md for pending work.';
  const timestamp = new Date().toISOString().slice(0, 10);
  const inboxPath = path.join(SB_ROOT, `wiki/_agents/${agent}/inbox.md`);

  const entry = `\n## ${timestamp} — Wake-up call from Gabriel\n\n${message}\n`;

  try {
    fs.appendFileSync(inboxPath, entry, 'utf-8');
    res.json({ ok: true, agent, timestamp });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Update agent status — writes to status.md.
 * Body: { lastActive?, currentTask?, awaiting? }
 */
app.post('/api/agents/:agent/status', requireAuth, requirePermission('dispatch_agents'), (req, res) => {
  const { agent } = req.params;
  if (!listActiveAgentIds(SB_ROOT).includes(agent)) {
    res.status(400).json({ error: 'Unknown agent' });
    return;
  }

  const statusPath = path.join(SB_ROOT, `wiki/_agents/${agent}/status.md`);
  const { lastActive, currentTask, awaiting } = req.body || {};

  const content = `# ${agent} Status\n\n*Current session state for ${agent}.*\n\n---\n\nLast active: ${lastActive || new Date().toISOString().slice(0, 10)}\nCurrent task: ${currentTask || '—'}\nAwaiting: ${awaiting || '—'}\n`;

  try {
    fs.writeFileSync(statusPath, content, 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Focus the Claude desktop app via AppleScript.
 * Called by AgentHub when the user clicks Focus on the Claude card.
 */
app.post('/api/focus-claude', requireAuth, requirePermission('view_agents'), (_req, res) => {
  exec(`osascript -e 'tell application "Claude" to activate'`, (err) => {
    if (err) {
      res.status(500).json({ ok: false, error: String(err) });
    } else {
      res.json({ ok: true });
    }
  });
});

/** Read-only access to wiki markdown files from graph links. */
app.get('/wiki/*', requireAuth, requirePermission('view_dashboard'), (req, res) => {
  const wikiRoot = path.resolve(SB_ROOT, 'wiki');
  const requestedPath = req.params[0] || '';
  const filePath = path.resolve(wikiRoot, requestedPath);

  if (!filePath.startsWith(`${wikiRoot}${path.sep}`) && filePath !== wikiRoot) {
    res.status(400).send('Invalid wiki path');
    return;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.status(404).send('Wiki file not found');
    return;
  }

  res.type('text/markdown').sendFile(filePath);
});

/**
 * Read a wiki article as JSON for in-dashboard rendering.
 * Returns { path, content, size, modified } or 404.
 * Path is relative to wiki/ root (e.g. "craft-fiction/string-theory/characters.md").
 */
app.get('/api/wiki/*', requireAuth, requirePermission('view_dashboard'), (req, res) => {
  const wikiRoot = path.resolve(SB_ROOT, 'wiki');
  const requestedPath = req.params[0] || '';
  const filePath = path.resolve(wikiRoot, requestedPath);

  if (!filePath.startsWith(`${wikiRoot}${path.sep}`) && filePath !== wikiRoot) {
    res.status(400).json({ error: 'Invalid wiki path' });
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Wiki file not found' });
    return;
  }

  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(filePath, { withFileTypes: true });
    res.json({
      type: 'directory',
      path: requestedPath,
      items: entries.map(e => ({
        name: e.name,
        type: e.isDirectory() ? 'dir' : 'file',
        path: path.join(requestedPath, e.name),
      })),
    });
    return;
  }

  if (!stat.isFile()) {
    res.status(400).json({ error: 'Not a file' });
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  res.json({
    type: 'file',
    path: requestedPath,
    content,
    size: stat.size,
    modified: stat.mtime.toISOString(),
  });
});

/**
 * Create a new task — appends to wiki/_meta/task-ledger.md.
 * Body: { title, owner, priority?, project?, notes? }
 * Owner may be an active agent id or any known human member's name.
 */
app.post('/api/tasks', requireAuth, requirePermission('delegate_tasks'), (req: AuthedRequest, res) => {
  const { title, owner, priority = 'normal', project = 'ClaudeSecondBrain', notes = '' } = req.body || {};
  if (!title || !owner) {
    res.status(400).json({ error: 'title and owner are required' });
    return;
  }

  const allowedOwners = [...listActiveAgentIds(SB_ROOT), ...listMembers(SB_ROOT).map(m => m.name.toLowerCase())];
  if (!allowedOwners.includes(owner.toLowerCase())) {
    res.status(400).json({ error: `Unknown owner. Allowed: ${allowedOwners.join(', ')}` });
    return;
  }

  if (!req.member!.projectAccess.allProjects && !canAccessProject(req.member!, project)) {
    res.status(403).json({ error: `Your project access does not include "${project}".` });
    return;
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const id = `TASK-${now.getTime().toString(36).toUpperCase()}`;

  const entry = `
---

### ${id} — ${title}

Status: pending
Owner: ${owner}
Requested by: ${req.member!.name}
Project: ${project}
Priority: ${priority}
${notes ? `Notes: ${notes}` : ''}
Created: ${date}
`;

  try {
    const ledgerPath = path.join(SB_ROOT, 'wiki/_meta/task-ledger.md');
    fs.appendFileSync(ledgerPath, entry, 'utf-8');
    res.json({ ok: true, id, title, owner, priority, project, date });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Send a directed message from a member to a specific agent inbox.
 * Body: { message, priority?, taskRef? }
 */
app.post('/api/agents/:agent/dispatch', requireAuth, requirePermission('dispatch_agents'), (req: AuthedRequest, res) => {
  const { agent } = req.params;
  if (!listActiveAgentIds(SB_ROOT).includes(agent)) {
    res.status(400).json({ error: 'Unknown agent' });
    return;
  }

  const { message, priority = 'normal', taskRef = '', broadcast = false } = req.body || {};
  // `from` is always derived from the authenticated session (never trusted
  // from the request body) so dispatches can't be spoofed as another member.
  const from = broadcast ? `${req.member!.name} (broadcast)` : req.member!.name;

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const priorityTag = priority === 'high' ? '🔴 HIGH PRIORITY' : priority === 'low' ? '⚪ LOW PRIORITY' : '🟡 NORMAL';

  const entry = `
## ${timestamp} — Dispatch from ${from}

**Priority:** ${priorityTag}${taskRef ? `\n**Task ref:** ${taskRef}` : ''}

${message}

---
`;

  try {
    const inboxPath = path.join(SB_ROOT, `wiki/_agents/${agent}/inbox.md`);
    fs.appendFileSync(inboxPath, entry, 'utf-8');
    res.json({ ok: true, agent, from, timestamp, priority });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Read an agent's full outbox — returns parsed outbox.md content.
 */
app.get('/api/agents/:agent/outbox', requireAuth, requirePermission('view_agents'), (req, res) => {
  const { agent } = req.params;
  if (!listActiveAgentIds(SB_ROOT).includes(agent)) {
    res.status(400).json({ error: 'Unknown agent' });
    return;
  }
  const outboxPath = path.join(SB_ROOT, `wiki/_agents/${agent}/outbox.md`);
  try {
    const content = fs.existsSync(outboxPath) ? fs.readFileSync(outboxPath, 'utf-8') : '';
    res.json({ agent, content });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Read an agent's full inbox — returns raw markdown for rendering.
 */
app.get('/api/agents/:agent/inbox', requireAuth, requirePermission('view_agents'), (req, res) => {
  const { agent } = req.params;
  if (!listActiveAgentIds(SB_ROOT).includes(agent)) {
    res.status(400).json({ error: 'Unknown agent' });
    return;
  }
  const inboxPath = path.join(SB_ROOT, `wiki/_agents/${agent}/inbox.md`);
  try {
    const content = fs.existsSync(inboxPath) ? fs.readFileSync(inboxPath, 'utf-8') : '';
    // `entries` is the structured, newest-first breakdown the UI renders as
    // cards; `content` is kept for anything that still wants raw markdown.
    res.json({ agent, content, entries: parseInboxEntries(content) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Write an outbox entry on behalf of an agent — used when an agent wants to
 * surface a report, status update, or completed-work record to the dashboard.
 * Body: { content, subject? }
 */
app.post('/api/agents/:agent/outbox', requireAuth, requirePermission('dispatch_agents'), (req, res) => {
  const { agent } = req.params;
  if (!listActiveAgentIds(SB_ROOT).includes(agent)) {
    res.status(400).json({ error: 'Unknown agent' });
    return;
  }

  const { content, subject = 'Status update' } = req.body || {};
  if (!content) {
    res.status(400).json({ error: 'content is required' });
    return;
  }

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const entry = `\n## ${timestamp} — ${subject}\n\n${content}\n\n---\n`;

  try {
    const outboxPath = path.join(SB_ROOT, `wiki/_agents/${agent}/outbox.md`);
    fs.appendFileSync(outboxPath, entry, 'utf-8');
    res.json({ ok: true, agent, subject, timestamp });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Static frontend (production) ───────────────────────────────────────────

const distPath = path.join(DASHBOARD_ROOT, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Start ──────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`SecondBrain Dashboard API — http://localhost:${PORT}`);
  console.log(`SB Root: ${SB_ROOT}`);
  console.log(`Public URL for invite links: ${PUBLIC_URL}`);
  console.log(`Bootstrap required: ${bootstrapRequired(SB_ROOT)}`);
  console.log(`Serving frontend: ${fs.existsSync(distPath) ? distPath : '(dev mode — use Vite on :10889)'}`);
});
