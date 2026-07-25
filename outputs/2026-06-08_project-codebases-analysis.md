# Project Codebases Analysis — Sunday/private-club-app, ComTechSuite, and Codex Guardian

*Compiled on June 8, 2026. This report details the architecture, technical stacks, current development states, and cross-project connections for the active software development projects in Gabriel McPherson's ecosystem.*

---

## 1. Sunday/private-club-app
A mobile-first member application built with Expo/React Native. It handles authentication and local profiles, syncing directly with a Supabase database.

### Core Stack
- **Framework**: Expo (React Native) v55.0 with React 19.2
- **State Management**: Zustand v5, React Query v5
- **Auth & Database Backend**: Supabase JS Client v2.56
- **UI & Styling**: `@callstack/liquid-glass` (macOS 26 Design System) and `react-native-paper`
- **Crypto & Storage**: `@noble/hashes` (SHA-256 validation), `expo-secure-store`

### Authentication Architecture
The auth controller supports three authentication flows:
- **Supabase OTP**: standard SMS/email OTP logins.
- **WebAuthn Passkeys**: device-bound passkeys that authenticate members directly without OTP or passwords.
- **Local Dev Fallback**: allows local mock member and admin sessions to run when Supabase client credentials are not defined.

### Phase 03 Blockers & Next Actions
The app is in **Phase 03 — Active Development**.
- **Mock Auth**: Mock overrides exist in `authService.ts` to facilitate local runs; these must be stripped for live OTP auth testing.
- **RLS Migrations**: Supabase schema migrations `025` and `026` are pending and must be applied to establish correct table security.
- **Live Verify**: Multi-device and real-hardware verification runs under `.env.liveverify` are pending.

---

## 2. ComTechSuite (Retirement Community Hub)
An enterprise-grade monorepo containing backend services, a frontend dashboard, and a mobile driver application.

### Monorepo Workspaces
- **Backend (Root)**: Express v5 server written in TypeScript v6, with PostgreSQL database migrations (`db/migrations/001..009`). Uses Row Level Security (RLS) policies scoped by `SET LOCAL app.tenant_id`.
- **Frontend Dashboard (`frontend/`)**: React + Vite + TypeScript web application implementing Liquid Glass Design System. Features visual calendar builders (RRULE), resident management directory, route visualization maps, and an SSE-based Display Board.
- **Mobile Client (`mobile/`)**: Expo React Native mobile client for driver dispatch, route details, and status updates.

### System Integration Modules
- **AI Orchestration**: Invokes OpenAI or Azure OpenAI, logging intents and actions securely, with a proactive struggle-detection interface.
- **Geofence Monitoring**: Google Maps JS SDK showing chaperone (green) and resident (blue) positions, automatically arming and disarming geofences per outing.
- **Dining & Housekeeping**: Dining manages menus, slot conflicts, and dietary/allergy safety flags; Housekeeping schedules cleaning tasks, staff boards, and SLA prioritizations.

### Iteration State
- **Iteration 1 & 2 (Postgres Migration)**: Database schema migration and RLS policy verification tests are complete or in progress. Local database validation (`db:validate`) is active; setup of the staging Postgres DB is pending.

---

## 3. Codex Guardian (OpenAI Codex CLI)
A terminal-based coding agent and project supervisor that sandboxes model executions and ensures phase compliance across active workspaces.

### Security Sandbox Architecture
To protect host environments from arbitrary command execution, Codex employs strict OS sandboxing:
- **macOS 12+ (Apple Seatbelt)**: Wraps commands with `sandbox-exec`. Everything is read-only except for `$PWD`, `$TMPDIR`, and `~/.codex/`. Outbound network access is entirely blocked.
- **Linux**: Launches a Docker container mounting the repository read-write. Custom `iptables` and `ipset` rules block all network traffic except requests targeting the OpenAI API.

### Config and Compliance
- **Configurations Layering**: Merges global instructions (`~/.codex/instructions.md`), root project directives (`codex.md`), and directory-specific constraints.
- **Phase Enforcement**: Auto-manages the `Codex Guardian — Active Phase Context` block in project `CLAUDE.md` files (like the second brain and the private club app), enforcing exit gates, mock policies, and forbidden states (e.g. TODOs in production paths).

---

## 4. Cross-Project Connections

The files are tightly integrated across three dimensions:
1. **Compliance Boundaries**: Codex Guardian injects phase context constraints directly into the `CLAUDE.md` of `private-club-app`, regulating code style, testing gates, and mock allowances during local development.
2. **Infrastructure Sharing**: Both `private-club-app` and the `ComTechSuite/frontend` dashboard utilize the Liquid Glass Design System tokens and custom components (LGButton, LGCard, etc.) to establish visual design parity across resident PWAs and admin portals.
3. **Core Principles Alignment**: The Nexus semantic transformation principles (preserving intent across translation boundaries) find concrete code instantiations in the FModCLI Apple Intelligence integrations of `WriteTrack` and the custom tool contracts of `ComTechSuite`'s AI orchestration layer.
