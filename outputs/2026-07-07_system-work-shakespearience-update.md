# System Work + Shakespearience Update — 2026-07-07

*Sources: CLAUDE.md (Codex Guardian block), wiki/_meta/change-log.md, wiki/dev-projects/shakespearience/architecture.md, Trello board "Shakespearience" (6a42d51975b7e62f32bbb05a).*

## Infrastructure / System Work

- **Codex Guardian phase:** Phase 03b — Live Verification. Zero-mock policy in force; only bug fixes, logging, and error handling are in scope. Blockers: no staging environment (separate Drive bucket / Neo4j / MCP instance), no automated integration tests or CI, no external beta loop.
- **Tunnel/notify fixes (2026-07-07):** Tailscale funnel reconnected after corrupted VPN tunnel state; all 4 routes (/mcp /sse /messages /health → localhost:3456) restored. `com.gabrielmcp.secondbrain.tunnel` now KeepAlive=true. New launchd agent `com.gabrielmcp.secondbrain.notify` installed — fires macOS banner + iMessage on any agent inbox change.
- **Agent protocol formalized:** `agent-protocol.md` is now the canonical 7-step startup contract for all agents (Claude, ChatGPT/Atlas, Gemini, Cursor), per ChatGPT/Atlas's recommendation, actioned same day.
- **Simple Memory endpoint fixed:** `unified_api.py` `SIMPLE_MEMORY_URL` corrected to port 8766; `/memories` confirmed live.
- **Still broken (unresolved, logged in open-questions):** `com.gabriel.mem0-services` (exit 127, binary missing), `com.gabriel.manuscriptwatcher` (exit 78), `com.gabrielmcp.memoryserver` (exit 78), `com.gabrielmcp.secondbrain.ingest` (exit 78, volume not mounted at boot), `com.gabriel.burnthrough-rebuild-watch` / `manuscript-rebuild-watch` (exit 1), `com.gabriel.mem0-apple-intelligence` (exit 1).
- **This session:** `neo4j-memory` MCP returned "Unable to retrieve routing information" on all calls — appears unreachable. Flagging for Gabriel; did not block this update since the wiki + Trello covered the ground.

## Shakespearience — Architecture Status

Full architecture article live at `wiki/dev-projects/shakespearience/architecture.md`. Cross-linked into `music-performance/acting-and-performance-pedagogy`, `craft-fiction/craft-principles/writing-principles`, and `ai-collaboration/gabriel-profile`. This is a Present Company (Stephanie Carll) production; Gabriel is composer, narrator, and production/business collaborator — not a passive contributor.

## Shakespearience — Trello Production Status (live pull)

Board has 8 lists, 58 open cards, zero due dates set anywhere — still in scaffolding, not yet in dated execution.

| List | Cards | Assigned to Gabriel | Unassigned |
|---|---|---|---|
| Big Biz Picture | 7 | 1 (Budget) | 6 |
| The Creative Vision | 7 | 0 | 7 |
| The Tech Guts | 14 | 5 | 9 |
| Tech Production | 8 | 8 | 0 |
| Marketing | 8 | 0 | 8 |
| Curricula | 4 | 0 | 4 |
| Bonus Content | 5 | 0 | 5 |
| Group Curricula & Licensing | 5 | 0 | 5 |

**Gabriel's assigned cards** (14 total): Tech Production is entirely his (Script→Audio Workflow, Recording Setup, Post-Production Standards, Mastering/QC/Delivery, Show Notes/SEO, Automated Publishing Pipeline, Multi-Platform Distribution, Release Calendar). In Tech Guts he holds Podcast Hosting Platforms, Episode Dissemination Plan, Storefront & Membership Architecture, Back End Automation, Website Hosting.

**Flag for review:** The Tech Guts stack that unlocks the storefront/membership model is unassigned — Database Architecture, Auth (Clerk), Payments (Stripe), Email (Resend/ConvertKit), CDN (Cloudflare R2), Admin Panel, School/Group Licensing System, Print-on-Demand (Printful), Analytics Dashboard. These are the build-out items behind the revenue model in the architecture doc. Creative Vision, Marketing, Curricula, Bonus Content, and Group Curricula lists are 100% unassigned — likely Stephanie's lanes but nothing in Trello confirms that; board member data didn't resolve names this pull.
