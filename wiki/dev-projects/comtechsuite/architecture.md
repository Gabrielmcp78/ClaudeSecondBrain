# ComTechSuite — Project Architecture

*ComTechSuite (Retirement Community Hub) is a multi-tenant enterprise platform that coordinates operations, AI-driven resident services, scheduling, geofencing, and dining/housekeeping tasks for senior living communities.* (source: package.json, TASK.md, PROJECT_SUMMARY.md)

<!-- kb-status: level=active | phase="Iteration 1 — Stabilization complete" | updated=2026-06-15 -->
**Status:** 🟡 Active — Iteration 1 stabilization complete, iterating · Last updated: 2026-06-15 [unverified: exact date inferred from article content, not a logged timestamp]

---

## Monorepo Workspace Structure

ComTechSuite is managed as a unified workspace using `pnpm`:

```
ComTechSuite/
├── package.json              # Monorepo root, backend runtime, DB validation scripts
├── db/                       # PostgreSQL migrations (001–009) and seed files
├── src/                      # Express backend service written in TypeScript
├── frontend/                 # React + Vite web dashboard (Liquid Glass Design System)
└── mobile/                   # Expo React Native driver mobile client
```

---

## Technical Stack

### Backend Services (Root)
- **Runtime**: Node.js with TypeScript v6
- **Web Server**: Express v5
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Testing**: Vitest v3 and Supertest v7

### Frontend Dashboard (`frontend/`)
- **Framework**: React v18 and Vite v6
- **Styling**: Tailwind CSS v4 and Liquid Glass custom styling
- **Icons**: Lucide React

### Mobile Client (`mobile/`)
- **Framework**: Expo v55 (React Native)

---

## Core System Architecture

### 1. Database Platform & Multi-Tenancy
The system relies on PostgreSQL for persistent storage. Multi-tenancy isolation is enforced at the database layer using Row Level Security (RLS) policies:
- All tenant queries are scoped using `SET LOCAL app.tenant_id`.
- Migrations `001` through `009` cover core tables (residents, calendar events, transport outings, social interactions, dining reservations, housekeeping logs).

### 2. Frontend Dashboards
The React-based dashboard implements the Liquid Glass design language with WCAG AAA conformance (18px base typography, 56px touch targets, high contrast). It includes:
- **Calendar & Waitlists**: Dynamic event planning with recurring rule builders (RRULE) and conflict warnings.
- **Resident Directory**: Emergency contact listings, mobility tracking (wheelchair designations), and interest graphs.
- **Transport Scheduler**: Route optimizer with interactive map displays (numbered stop markers, wheelchair-accessible routing).
- **Kiosk Interface**: PIN-pad login and idle timeouts.
- **Display Board**: SSE-backed slideshows for public area monitors.

### 3. AI Orchestration Layer
An intelligent backend service that translates user statements into secure database queries or operational actions:
- Operates via OpenAI or Azure OpenAI API.
- Implements structured action audit logging and intervention policy controls.
- Employs struggle-detection overlays on client screens to trigger AI assistance.

### 4. Geofencing & Location Monitoring
- Uses Google Maps JavaScript SDK to display live chaperone and resident positions.
- Arms geofence boundaries automatically upon outing start and releases them at completion.
- Triggers alert notifications for fence breaches or chaperone-resident separations.

### 5. Dining Room & Housekeeping Modules
- **Dining Room**: Governs daily menus, meal slots, private bookings, and enforces dietary restrictions (flagging kitchen alerts for allergies).
- **Housekeeping**: Manages staff cleaning logs, recurring unit schedules, and priority SLA ticket dispatching.

---

## Roadmap & Release Gates

### Release Gates (Must Pass)
1. Zero open Severity 1 defects in main resident workflows.
2. Full API contract parity for all frontend clients.
3. Postgres persistence for all production features.
4. Active Auth and RLS enforcement.

### Iteration Timeline
- **Iteration 1 (Stabilization)**: Completed contract testing, route guards, and local validation smoke tests.
- **Iteration 2 (Postgres Migration)**: In progress. Migration validation script (`db:validate`) successfully runs against local target databases. Staging DB setup is pending.
- **Iteration 3 (AI Integration)**: Core tool-calling bridge and safety evaluations implemented.
- **Iteration 4 (Google Maps)**: Active geofencing and breach alert mechanisms built.
- **Iteration 5 (Driver Mobile)**: Not started. Stack selection confirmed as React Native.
- **Iteration 6 & 7 (Dining & Housekeeping)**: Core backend services and database schemas migrated.
