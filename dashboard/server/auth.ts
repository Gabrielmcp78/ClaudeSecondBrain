/**
 * auth.ts — Members, sessions, invites, and Express access-control
 * middleware for the SecondBrain Dashboard.
 *
 * Design notes:
 *  - Passwords are hashed with Node's built-in `crypto.scrypt` (no external
 *    dependency; scrypt is a memory-hard KDF suitable for this trust
 *    level — a personal/small-team tool, not a public multi-tenant SaaS).
 *    https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback
 *  - Sessions are opaque random tokens stored server-side (sessions.json)
 *    and handed to the browser as an httpOnly cookie — not a JWT, so a
 *    session can be revoked instantly by deleting its record.
 *  - Invite tokens let a human member who is NOT on Gabriel's local
 *    network join: Gabriel (or anyone with `manage_members`) generates an
 *    invite link, sends it through any channel (text, email, Slack), and
 *    the recipient opens it from wherever they are to set their own
 *    password. No SMTP/email-sending integration exists in this project,
 *    so the dashboard surfaces a copyable link rather than pretending to
 *    send email — see README "Remote members" section.
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { readJSON, writeJSON, newId, newToken } from './store.js';
import { builtInRoles, roleHasPermission, PERMISSION_KEYS as PERMISSION_KEYS_LOCAL, type Role } from './permissions.js';

// ── Types ─────────────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'invited' | 'disabled';

export interface ProjectAccess {
  allProjects: boolean;
  projects: string[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  roleId: string;
  projectAccess: ProjectAccess;
  remote: boolean;
  status: MemberStatus;
  passwordHash: string | null;
  salt: string | null;
  inviteToken: string | null;
  inviteExpires: string | null;
  createdAt: string;
  createdBy: string;
  lastLogin: string | null;
}

interface Session {
  token: string;
  memberId: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthedRequest extends Request {
  member?: Member;
  role?: Role;
}

// ── Config ────────────────────────────────────────────────────────────────

const SESSION_COOKIE = 'sb_session';
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 30);
const INVITE_TTL_DAYS = Number(process.env.INVITE_TTL_DAYS || 7);
export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

// ── Password hashing (scrypt) ────────────────────────────────────────────

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, 'hex');
  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}

// ── Members store ─────────────────────────────────────────────────────────

const MEMBERS_FILE = 'members.json';
const ROLES_FILE = 'roles.json';
const SESSIONS_FILE = 'sessions.json';

export function listMembers(sbRoot: string): Member[] {
  return readJSON<Member[]>(sbRoot, MEMBERS_FILE, []);
}

function saveMembers(sbRoot: string, members: Member[]): void {
  writeJSON(sbRoot, MEMBERS_FILE, members);
}

export function getMemberById(sbRoot: string, id: string): Member | undefined {
  return listMembers(sbRoot).find(m => m.id === id);
}

export function getMemberByEmail(sbRoot: string, email: string): Member | undefined {
  const target = email.trim().toLowerCase();
  return listMembers(sbRoot).find(m => m.email.trim().toLowerCase() === target);
}

export function bootstrapRequired(sbRoot: string): boolean {
  return listMembers(sbRoot).length === 0;
}

/** Create the Owner account on first run. Only succeeds once — after the
 *  first member exists, callers must use the normal invite flow. */
export function createOwner(sbRoot: string, name: string, email: string, password: string): Member {
  if (!bootstrapRequired(sbRoot)) {
    throw new Error('Bootstrap already completed — an Owner account exists.');
  }
  ensureRolesSeeded(sbRoot);
  const { hash, salt } = hashPassword(password);
  const member: Member = {
    id: newId('mem'), name, email, roleId: 'owner',
    projectAccess: { allProjects: true, projects: [] },
    remote: false, status: 'active',
    passwordHash: hash, salt,
    inviteToken: null, inviteExpires: null,
    createdAt: new Date().toISOString(), createdBy: 'system',
    lastLogin: new Date().toISOString(),
  };
  saveMembers(sbRoot, [member]);
  return member;
}

/** Invite a new human member. They are `status: 'invited'` with no
 *  password until they redeem the invite token — this is how members who
 *  are NOT on Gabriel's local network get onboarded: the link works from
 *  anywhere the dashboard host is reachable. */
export function inviteMember(
  sbRoot: string,
  input: { name: string; email: string; roleId: string; projectAccess: ProjectAccess; remote: boolean },
  invitedBy: string
): Member {
  const members = listMembers(sbRoot);
  if (members.some(m => m.email.trim().toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error('A member with that email already exists.');
  }
  const member: Member = {
    id: newId('mem'), name: input.name, email: input.email, roleId: input.roleId,
    projectAccess: input.projectAccess, remote: input.remote, status: 'invited',
    passwordHash: null, salt: null,
    inviteToken: newToken(),
    inviteExpires: new Date(Date.now() + INVITE_TTL_DAYS * 86400_000).toISOString(),
    createdAt: new Date().toISOString(), createdBy: invitedBy, lastLogin: null,
  };
  saveMembers(sbRoot, [...members, member]);
  return member;
}

export function resendInvite(sbRoot: string, memberId: string): Member {
  const members = listMembers(sbRoot);
  const idx = members.findIndex(m => m.id === memberId);
  if (idx === -1) throw new Error('Member not found');
  members[idx] = {
    ...members[idx],
    inviteToken: newToken(),
    inviteExpires: new Date(Date.now() + INVITE_TTL_DAYS * 86400_000).toISOString(),
    status: 'invited',
  };
  saveMembers(sbRoot, members);
  return members[idx];
}

export function findInvite(sbRoot: string, token: string): Member | undefined {
  return listMembers(sbRoot).find(m => m.inviteToken === token && m.status === 'invited');
}

export function isInviteExpired(member: Member): boolean {
  if (!member.inviteExpires) return true;
  return new Date(member.inviteExpires).getTime() < Date.now();
}

/** Redeem an invite: recipient sets their name/password and the account
 *  becomes active. Works identically whether the recipient is on the same
 *  LAN as Gabriel's Mac or connecting remotely over a tunnel/VPN — the
 *  invite link is the only thing that has to reach them. */
export function redeemInvite(sbRoot: string, token: string, name: string, password: string): Member {
  const members = listMembers(sbRoot);
  const idx = members.findIndex(m => m.inviteToken === token && m.status === 'invited');
  if (idx === -1) throw new Error('Invite not found or already used.');
  if (isInviteExpired(members[idx])) throw new Error('Invite has expired. Ask an admin to resend it.');
  const { hash, salt } = hashPassword(password);
  members[idx] = {
    ...members[idx],
    name: name || members[idx].name,
    passwordHash: hash, salt,
    status: 'active',
    inviteToken: null, inviteExpires: null,
    lastLogin: new Date().toISOString(),
  };
  saveMembers(sbRoot, members);
  return members[idx];
}

export function verifyLogin(sbRoot: string, email: string, password: string): Member | null {
  const member = getMemberByEmail(sbRoot, email);
  if (!member || member.status !== 'active' || !member.passwordHash || !member.salt) return null;
  if (!verifyPassword(password, member.passwordHash, member.salt)) return null;
  return member;
}

export function touchLastLogin(sbRoot: string, memberId: string): void {
  const members = listMembers(sbRoot);
  const idx = members.findIndex(m => m.id === memberId);
  if (idx === -1) return;
  members[idx] = { ...members[idx], lastLogin: new Date().toISOString() };
  saveMembers(sbRoot, members);
}

/** Update role / project access / remote flag / status / name for an
 *  existing member. Guards against removing the last active Owner so the
 *  system can never be locked out of `manage_system`. */
export function updateMember(sbRoot: string, id: string, patch: Partial<Pick<Member,
  'name' | 'roleId' | 'projectAccess' | 'remote' | 'status'>>): Member {
  const members = listMembers(sbRoot);
  const idx = members.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Member not found');

  const willChangeRoleAway = patch.roleId && patch.roleId !== 'owner' && members[idx].roleId === 'owner';
  const willDisable = patch.status && patch.status !== 'active' && members[idx].status === 'active' && members[idx].roleId === 'owner';
  if (willChangeRoleAway || willDisable) {
    const activeOwners = members.filter(m => m.roleId === 'owner' && m.status === 'active');
    if (activeOwners.length <= 1) {
      throw new Error('Cannot change this member — at least one active Owner must remain.');
    }
  }

  members[idx] = { ...members[idx], ...patch };
  saveMembers(sbRoot, members);
  return members[idx];
}

export function deleteMember(sbRoot: string, id: string): void {
  const members = listMembers(sbRoot);
  const target = members.find(m => m.id === id);
  if (!target) throw new Error('Member not found');
  if (target.roleId === 'owner') {
    const activeOwners = members.filter(m => m.roleId === 'owner' && m.status === 'active');
    if (activeOwners.length <= 1) throw new Error('Cannot remove the last Owner.');
  }
  saveMembers(sbRoot, members.filter(m => m.id !== id));
}

// ── Roles store ───────────────────────────────────────────────────────────

export function ensureRolesSeeded(sbRoot: string): Role[] {
  let roles = readJSON<Role[]>(sbRoot, ROLES_FILE, []);
  if (roles.length === 0) {
    roles = builtInRoles();
    writeJSON(sbRoot, ROLES_FILE, roles);
  }
  return roles;
}

export function listRoles(sbRoot: string): Role[] {
  return ensureRolesSeeded(sbRoot);
}

export function getRoleById(sbRoot: string, id: string): Role | undefined {
  return listRoles(sbRoot).find(r => r.id === id);
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || newId('role');
}

/** Create a brand-new privilege level. This is the "creation of new
 *  privilege options" pathway — any permission-key combination is valid. */
export function createRole(sbRoot: string, input: { name: string; description: string; permissions: string[] }, createdBy: string): Role {
  const roles = listRoles(sbRoot);
  let id = slugify(input.name);
  if (roles.some(r => r.id === id)) id = `${id}-${newId('r').slice(-6)}`;
  const invalid = input.permissions.filter(p => !PERMISSION_KEYS_LOCAL.includes(p));
  if (invalid.length > 0) throw new Error(`Unknown permission key(s): ${invalid.join(', ')}`);
  const role: Role = { id, name: input.name, description: input.description, permissions: input.permissions, builtIn: false, createdAt: new Date().toISOString(), createdBy };
  writeJSON(sbRoot, ROLES_FILE, [...roles, role]);
  return role;
}

export function updateRole(sbRoot: string, id: string, patch: { name?: string; description?: string; permissions?: string[] }): Role {
  const roles = listRoles(sbRoot);
  const idx = roles.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Role not found');
  if (roles[idx].builtIn) throw new Error('Built-in roles cannot be edited.');
  if (patch.permissions) {
    const invalid = patch.permissions.filter(p => !PERMISSION_KEYS_LOCAL.includes(p));
    if (invalid.length > 0) throw new Error(`Unknown permission key(s): ${invalid.join(', ')}`);
  }
  roles[idx] = { ...roles[idx], ...patch };
  writeJSON(sbRoot, ROLES_FILE, roles);
  return roles[idx];
}

export function deleteRole(sbRoot: string, id: string): void {
  const roles = listRoles(sbRoot);
  const role = roles.find(r => r.id === id);
  if (!role) throw new Error('Role not found');
  if (role.builtIn) throw new Error('Built-in roles cannot be deleted.');
  const inUse = listMembers(sbRoot).filter(m => m.roleId === id).length;
  if (inUse > 0) throw new Error(`${inUse} member(s) currently hold this role. Reassign them first.`);
  writeJSON(sbRoot, ROLES_FILE, roles.filter(r => r.id !== id));
}

// ── Sessions ──────────────────────────────────────────────────────────────

function listSessions(sbRoot: string): Session[] {
  const sessions = readJSON<Session[]>(sbRoot, SESSIONS_FILE, []);
  const live = sessions.filter(s => new Date(s.expiresAt).getTime() > Date.now());
  if (live.length !== sessions.length) writeJSON(sbRoot, SESSIONS_FILE, live); // prune expired
  return live;
}

export function createSession(sbRoot: string, memberId: string): Session {
  const sessions = listSessions(sbRoot);
  const session: Session = {
    token: newToken(),
    memberId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 86400_000).toISOString(),
  };
  writeJSON(sbRoot, SESSIONS_FILE, [...sessions, session]);
  return session;
}

export function destroySession(sbRoot: string, token: string): void {
  writeJSON(sbRoot, SESSIONS_FILE, listSessions(sbRoot).filter(s => s.token !== token));
}

function getSession(sbRoot: string, token: string): Session | undefined {
  return listSessions(sbRoot).find(s => s.token === token);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: COOKIE_SECURE,
    maxAge: SESSION_TTL_DAYS * 86400_000,
    path: '/',
  };
}

export { SESSION_COOKIE };

// ── Express middleware ───────────────────────────────────────────────────

/** Reads the session cookie (if any) and attaches `req.member` / `req.role`.
 *  Never rejects — routes decide what to do with an unauthenticated
 *  request via `requireAuth` / `requirePermission`. */
export function attachUser(sbRoot: string) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) return next();
    const session = getSession(sbRoot, token);
    if (!session) return next();
    const member = getMemberById(sbRoot, session.memberId);
    if (!member || member.status !== 'active') return next();
    req.member = member;
    req.role = getRoleById(sbRoot, member.roleId);
    next();
  };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.member) {
    res.status(401).json({ error: 'Not authenticated. Please log in.' });
    return;
  }
  next();
}

/** Route guard: `app.get('/api/x', requireAuth, requirePermission('view_dashboard'), handler)` */
export function requirePermission(permKey: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.member) {
      res.status(401).json({ error: 'Not authenticated. Please log in.' });
      return;
    }
    if (!roleHasPermission(req.role, permKey)) {
      res.status(403).json({ error: `Your role (${req.role?.name ?? 'unknown'}) does not have the "${permKey}" permission.` });
      return;
    }
    next();
  };
}

/** True if the member can see a given project's data — either they have
 *  `allProjects`, or the project is explicitly in their scope list. */
export function canAccessProject(member: Member, project: string): boolean {
  if (member.projectAccess.allProjects) return true;
  return member.projectAccess.projects.includes(project);
}

export function publicMember(member: Member) {
  const { passwordHash, salt, inviteToken, ...safe } = member;
  return safe;
}
