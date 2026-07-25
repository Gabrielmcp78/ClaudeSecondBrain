# SecondBrain Dashboard

Always-on control surface for the SecondBrain multi-agent knowledge system.
Runs as a launchd service on port **10888** — open `http://localhost:10888` in any browser.

Every session is now authenticated. The first person to open the dashboard
creates the **Owner** account (full access); everyone else is invited by
someone with the `manage_members` permission, whether they're on Gabriel's
local network or connecting from anywhere else — see
[§ Access control](#access-control) below.

---

## Architecture

```
dashboard/
├── server/
│   ├── index.ts          # Express API on :10888; serves static dist/ in production
│   ├── parsers.ts        # Markdown parsers → Task, Handoff, Decision, Agent, Connection
│   ├── store.ts           # Atomic JSON persistence (wiki/_meta/*.json)
│   ├── permissions.ts     # Permission catalog + built-in roles (Owner/Admin/Collaborator/Viewer)
│   ├── auth.ts            # Password hashing, sessions, invites, Express auth middleware
│   └── agentRegistry.ts   # Agent roster CRUD + wiki/_agents/<id>/ scaffolding
├── src/
│   ├── App.tsx            # Root: auth gate + 5-tab layout + parallel data fetch
│   ├── types.ts           # Shared interfaces, color maps, dynamic agent map builder
│   ├── lib/api.ts          # Shared fetch client
│   ├── context/AuthContext.tsx
│   └── components/
│       ├── Login.tsx             # Sign-in + first-run Owner bootstrap
│       ├── InviteRedeem.tsx      # Invite-link landing page (local or remote members)
│       ├── SystemPulse.tsx       # Header stat bar
│       ├── NetworkGraph.tsx      # D3 force-directed knowledge graph (live)
│       ├── NetworkSidebar.tsx    # Node/edge inspector
│       ├── AgentHub.tsx          # Data-driven agent status cards + Wake Up + Broadcast
│       ├── TaskBoard.tsx         # Task ledger grouped by status
│       ├── CommandRail.tsx       # Handoffs · Decisions · Raw queue
│       └── setup/
│           ├── AgentsPanel.tsx   # Add/remove/activate agents (standard setup pathway)
│           ├── MembersPanel.tsx  # Invite/manage human members, roles, project access
│           └── RolesPanel.tsx    # Create/edit custom privilege levels
├── launchd/
│   └── com.gabrielmcp.sbbrain.dashboard.plist
└── vite.config.ts       # Dev port :10889, proxies /api → :10888
```

**API endpoints** (all read markdown from SecondBrain wiki, no database for
content; access-control data lives in `wiki/_meta/*.json` — see below):

| Route | Source file |
|-------|------------|
| `GET /api/system` | `wiki/_index.md`, `wiki/_meta/change-log.md`, `raw/` dir |
| `GET /api/tasks` | `wiki/_meta/task-ledger.md` (project-scoped per caller) |
| `GET /api/handoffs` | `wiki/_meta/handoffs.md` |
| `GET /api/decisions` | `wiki/_meta/decision-registry.md` |
| `GET /api/agents` | `wiki/_agents/*/status.md` + `inbox.md` + `outbox.md` (active registry only) |
| `GET /api/graph` | `wiki/_connections.md` |
| `GET /api/raw-queue` | `raw/` directory listing |
| `POST /api/agents/:agent/wake` \| `/dispatch` | Appends entries to `wiki/_agents/:agent/inbox.md` |
| `GET/POST/PATCH/DELETE /api/agents/registry` | `wiki/_meta/agents.json` + scaffolds `wiki/_agents/<id>/` |
| `GET/POST/PATCH/DELETE /api/members` | `wiki/_meta/members.json` |
| `GET/POST/PATCH/DELETE /api/roles` | `wiki/_meta/roles.json` |
| `POST /api/auth/*`, `GET /api/invites/:token` | `wiki/_meta/members.json`, `sessions.json` |

---

## Setup

```bash
cd dashboard
pnpm install
```

### Development (hot-reload, two terminals or `pnpm run dev`)

```bash
pnpm run dev
# Vite dev server: http://localhost:10889
# Express API:     http://localhost:10888
```

Open `http://localhost:10889`. Since no members exist yet, you'll land on
**"Create the Owner account"** — that account gets every permission and
can never be locked out (the server refuses to demote/disable/delete the
last active Owner).

### Production build

```bash
pnpm run build   # TypeScript check + Vite build + esbuild server bundle
pnpm start       # Serves on :10888
```

---

## Access control

### Roles (level & depth of control)

A **Role** is a name plus a set of permission keys. Four roles are
built-in and permanent — they can be assigned to anyone but never edited
or deleted:

| Role | Typical use | Permissions |
|------|------------|-------------|
| Owner | Gabriel | Everything, including creating new privilege levels |
| Admin | A trusted co-operator | Manage agents & members, dispatch, delegate — not role editing |
| Collaborator | Day-to-day operator | Dispatch agents, delegate tasks — no admin controls |
| Viewer | Read-only observer | View the dashboard and Agent Hub only |

Anyone holding the `manage_roles` permission can create **additional
custom privilege levels** from any combination of the permission catalog
(Setup → Roles & Privileges → New Privilege Level) — this is the
"creation of new privilege options" pathway. The full catalog is served
from `GET /api/permissions` and rendered as a checklist there.

### Project access (separate from role)

Independently of role, each member has a `projectAccess` scope:
`allProjects: true`, or a specific list of project names (matched against
the `project` field already used in the task ledger). Two members can
share the same role while seeing different projects — set this per
member in Setup → Members.

### Agents (standard setup pathway)

Setup → Agents replaces what used to be a hardcoded 4-agent array
(`claude`, `chatgpt`, `gemini`, `cursor`) scattered across six files.
Adding an agent now means: give it a label, pick **native** (a desktop
app, focused via a custom handler) or **web** (opens a URL), give it a
focus target, submit. The server slugifies an id, scaffolds
`wiki/_agents/<id>/{status,inbox,outbox}.md`, and it appears in the
Agent Hub immediately. Removing an agent (Cursor was removed this way)
takes it out of the live roster instantly but never deletes its wiki
history from disk.

### Remote members

New human members may or may not be on Gabriel's local network. Onboarding
works the same way either way:

1. In Setup → Members, invite them with a name, email, role, and project
   access. Check **"Off local network (remote member)"** if applicable —
   this is informational and reminds you the invite link needs to be
   reachable from wherever they are.
2. The dashboard generates an invite link
   (`{PUBLIC_URL}/?invite=<token>`, valid for `INVITE_TTL_DAYS`, default
   7). There is no email-sending integration in this project — copy the
   link and send it through whatever channel you'd already use (text,
   email client, Slack).
3. They open the link from their own device, set a password, and land in
   the dashboard already signed in, scoped to the role and project access
   you set.

For that link to work off Gabriel's LAN, the dashboard's port needs to be
reachable from outside it. Options, roughly in order of how much they're
recommended for anything beyond a quick test:

- **Tailscale** (or another WireGuard-based mesh VPN) — invite the remote
  member into your tailnet; the dashboard stays on a private network the
  whole time, no public exposure.
- **Cloudflare Tunnel** — exposes the dashboard at a stable HTTPS hostname
  without opening a port on your router.
- **Router port-forward + reverse proxy with TLS** — works, but you're
  responsible for the TLS termination and for locking the port down;
  not recommended without a reverse proxy in front of it.

Whichever you use, set `PUBLIC_URL` in `.env` to the hostname members
will actually reach (see `.env.example`), and set `COOKIE_SECURE=true`
once it's served over HTTPS so session cookies get the `Secure` flag.

---

## Environment variables

Copy `.env.example` to `.env` (gitignored) and adjust:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PUBLIC_URL` | `http://localhost:10888` | Hostname used to build invite links |
| `COOKIE_SECURE` | `false` | Set `true` once served over HTTPS |
| `SESSION_TTL_DAYS` | `30` | How long a signed-in session lasts |
| `INVITE_TTL_DAYS` | `7` | How long an invite link stays valid |

---

## Always-On Service (launchd)

Install once, runs on login, restarts on crash — mirrors FlowScape behavior.

```bash
# 1. Build first
pnpm run build

# 2. Install the plist
cp launchd/com.gabrielmcp.sbbrain.dashboard.plist ~/Library/LaunchAgents/

# 3. Load it
launchctl load ~/Library/LaunchAgents/com.gabrielmcp.sbbrain.dashboard.plist

# Check status
launchctl list | grep sbbrain

# Logs
tail -f /tmp/sbbrain-dashboard.log
tail -f /tmp/sbbrain-dashboard.error.log

# Stop / unload
launchctl unload ~/Library/LaunchAgents/com.gabrielmcp.sbbrain.dashboard.plist
```

If the Volumes mount point changes or you rebuild, reload the service:

```bash
launchctl unload ~/Library/LaunchAgents/com.gabrielmcp.sbbrain.dashboard.plist
pnpm run build
launchctl load ~/Library/LaunchAgents/com.gabrielmcp.sbbrain.dashboard.plist
```

To set environment variables (e.g. `PUBLIC_URL`, `COOKIE_SECURE`) for the
always-on service, add an `EnvironmentVariables` dict to the plist rather
than relying on `.env` — launchd does not source shell profiles or dotenv
files.

---

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS v4
- D3 v7 (force-directed graph)
- Express (REST API + static serving)
- cookie-parser (session cookies) + Node's built-in `crypto.scrypt` (password hashing — no external auth dependency)
- dotenv (loads `.env` for `PUBLIC_URL` / `COOKIE_SECURE` / TTLs)
- chokidar (future: live reload via SSE)
- lucide-react (icons)

---

## Port Map

| Port | Purpose |
|------|---------|
| 10888 | Express API + production static serving |
| 10889 | Vite dev server (proxies /api → 10888) |
| 3456 | SecondBrain MCP server (separate; not this app) |
