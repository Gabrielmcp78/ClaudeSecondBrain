# Shakespearience — Technical Buildout Status

**Date:** 2026-07-13
**Requested by:** Gabriel — "tell me where we are with the shakespearience technical buildout"
**Sources:** `wiki/dev-projects/shakespearience/architecture.md`, `outputs/2026-07-08_shakespearience-full-integration.md`, `outputs/2026-07-07_system-work-shakespearience-update.md`, live Trello pull of "The Tech Guts" (14 cards) and "Tech Production" (8 cards), board `6a42d51975b7e62f32bbb05a`.

---

## One-line state

The **platform infrastructure is built and build-verified in code**, waiting on real third-party accounts to go live. The **audio production pipeline is fully specced** but still holds open tooling decisions and has recorded nothing yet. Two lanes, two very different maturity levels.

## Lane 1 — Platform / infrastructure (Shakespearience-Platform codebase)

**Location:** `/Volumes/Ready500/DEVELOPMENT/Shakespearience-Platform`
**Phase:** Build Phase — scaffolded and build-verified (2026-07-08).

Stack locked, every choice sourced from a Trello Tech Guts card: Next.js 14 (Vercel) · Clerk w/ Organizations · Stripe (Subscriptions + Invoicing + Portal) · Supabase/Postgres + Prisma · Cloudflare R2 signed URLs · Resend (transactional) · ConvertKit (marketing) · Transistor.fm (3-feed public/subscriber/bonus) · Printful · Plausible · n8n self-hosted on Hetzner · Sanity CMS · Trello status sync.

**Built and verified:**
- Full Prisma schema (members, subscriptions, school_licenses, license_seats, content_entitlements, episodes, downloads, webhook_events).
- Clerk auth with the six-role architecture (admin / team / subscriber / school_admin / student / free).
- Complete Stripe integration — 5-tier product seed, school NET-30 invoicing, webhook → Supabase sync.
- Seven Resend email templates.
- R2 signed-URL content-gating choke point with full audit logging (kit PDFs never get public URLs; 15-min expiry).
- All six admin control-panel sections.
- Teacher Portal with server-side seat enforcement.
- Printful order creation wired to the Stripe webhook.
- All 8 n8n workflows as real, importable JSON exports.
- `npm run build` clean; all 26 routes compile as dynamic server-rendered; 4 real bugs fixed; `npm audit` down to 0 critical.

**Not done, by design (the go-live gate):**
- No third-party accounts exist yet — every integration is real SDK-wired code waiting on real credentials, not a mock. `SETUP.md` has the 11-step account-creation order.
- Sanity episode content model deferred to a working session with Stephanie (content modeling, not infra).
- Visual / brand design not started — blocked on Sarah's estimate (same Trello budget line).

## Lane 2 — Audio production pipeline (Tech Production list, 8 cards, all Gabriel)

Fully specced, tooling decisions still open, nothing recorded:
- Script → Audio workflow, Recording Session Setup, Editing/Post standards, Mastering/QC specs (-16 LUFS / -1 dBTP), Show Notes/Metadata/SEO, Automated Publishing Pipeline, Multi-Platform Distribution, Release Calendar.
- Open decisions: DAW standard (Logic / Reaper / Audition), remote recording platform (Riverside / Squadcast / Zencastr), file-naming + Drive folder structure.
- Note the seam: Tech Guts cards carry *hard* decisions (Transistor chosen, n8n chosen); several Tech Production cards still list *candidates*. Infra side is decided; capture side is not.

## Trello movement since last pull

The 2026-07-07 flag — nine Tech Guts build-out cards (Database, Auth, Payments, Email, CDN, Admin, Licensing, Print-on-Demand, Analytics) sitting **unassigned** — is now **resolved**. Live pull shows all 14 Tech Guts cards and all 8 Tech Production cards assigned to Gabriel. Still zero due dates board-wide: assigned, decided, not yet dated execution.

## Critical path to a live Season 1

1. Run `SETUP.md` — create the 11 third-party accounts, drop real credentials into env.
2. Deploy to Vercel; point DNS + email auth (SPF/DKIM/DMARC) at the domain.
3. Sit down with Stephanie to build the Sanity content model.
4. Unblock brand/visual design (Sarah's estimate).
5. Lock the audio capture stack (DAW + remote platform) so recording can actually begin.

Items 1–2 are Gabriel-only and unblock the whole revenue model. Item 5 is the true gate on having episodes to publish.

---
*Drawn from: `wiki/dev-projects/shakespearience/architecture.md` · Trello board Shakespearience (Tech Guts, Tech Production) · prior outputs 2026-07-07, 2026-07-08.*
