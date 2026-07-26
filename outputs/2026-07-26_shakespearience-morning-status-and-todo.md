# Shakespearience — Morning Status & Afternoon Tech Push
**2026-07-26, Sunday morning sync**

*Drawn from: live Trello board (`shakespearience_status`, The Tech Guts / Tech Production / Ops & Setup), the platform repo's own git log + CLAUDE.md phase gate, and README/CHANGELOG. Sources: [Shakespearience Architecture](../wiki/dev-projects/shakespearience/architecture.md), live Trello (not this wiki — see that article's sourcing note).*

---

## Where we actually are

Three things are true at once, and all three matter.

The **application is built.** Every Tech Guts decision — Clerk auth, Stripe billing, Supabase/Prisma data model, Cloudflare R2 storage, Resend/ConvertKit email, Transistor podcast hosting, Printful, the admin control panel, school licensing — has real code behind it. Not stubs. The README says it plainly: "no mock data, no placeholder logic, no simulated responses" — every route calls the real SDK and throws a clear config error rather than faking success. Git confirms recent motion: episode content management + publishing API (Jul 25), the new Shakespearience MCP server for ChatGPT (Jul 22), email rendering previews, Stripe module init. The Jul 22 stack-simplification pass also cut real complexity — Sanity CMS, Buffer, and Plausible are gone, folded into the admin panel, n8n, and Cloudflare Web Analytics respectively. That's a healthier stack than a month ago, not just a bigger one.

The **infrastructure behind it is still theoretical.** `DATABASE_URL` in `.env.local` is a literal `[HOST]` placeholder — no Supabase project exists yet, so no migration has ever run against it. There's no `prisma/migrations` folder at all. There's no `.github/workflows` — zero CI, zero automated tests. `.env.staging` and `.env.liveverify` don't exist. This is exactly what Codex Guardian's Phase 03 gate is flagging, and it's why "code-built" and "live" are different words on every single Tech Guts card right now.

The **board itself just got sharper.** Four new cards appeared on The Tech Guts on Jul 16 that didn't exist before: *Pilot Environment and End-to-End Verification*, *Release Engineering CI and Quality Gates*, *Platform Delivery State: Source of Truth*, and *Command Center — Live Operations Dashboard*. All four are unassigned. Together they're the board finally naming the exact gap the codebase audit above describes — they're not new scope, they're the missing proof layer for scope that already exists. The Command Center in particular is further along than you might remember: dashboard foundation is code-built on `feat/command-center-foundation`, just not deployed or wired to real Trello credentials yet.

---

## The three real blockers

1. **No database.** Supabase project doesn't exist → `DATABASE_URL`/`DIRECT_URL` are placeholders → migrations have never run → every Prisma-backed route is unverifiable until this exists.
2. **No CI.** No `.github/workflows`, no test script beyond manual `typecheck`/`build` (last verified passing 8 July). Nothing blocks a bad merge.
3. **No environment tiers.** Only `.env.local` exists — no staging, no Live Verify env — so there's no safe place to run the Pilot Environment card's journey matrix even once the database exists.

Ops & Setup has its own three flagged gaps, lower urgency but real: 🚩 Kids' Privacy/COPPA-FERPA (legal review, not just code), 🚩 Contracts & People, 🚩 Brand & Trademark, 🚩 Insurance & Risk — all unassigned, none blocking today's tech push.

---

## Next steps for tech development (the actual sequence)

The dependency chain is linear and short:

**Supabase project → real `DATABASE_URL`/`DIRECT_URL` → `prisma migrate dev`** unblocks everything downstream, because Database Architecture is the one card every other Tech Guts card's "still needed" section points back to (Storefront Architecture, Auth, Payments, School Licensing, Admin Panel — all waiting on the same connection string).

In parallel, **CI costs nothing to start and blocks nothing** — a GitHub Actions workflow running `npm install --include=dev`, `prisma generate`, `typecheck`, `build` can exist today with zero external accounts, directly closing the Release Engineering card.

Once both exist, **Stripe test-mode + Clerk test instance** wiring lets `seed:stripe` actually run and a real signup/checkout/entitlement loop become testable locally — which is the first real slice of the Pilot Environment journey matrix.

Command Center deployment and the staging/Live Verify env files are the next layer after that — they need the database and CI in place first to mean anything.

---

## This afternoon — ambitious version

Split by who's driving: some of this needs your hands on external dashboards (Supabase, GitHub, Vercel), some I can build outright right now with no new accounts.

**I can build immediately, no account needed:**
- [ ] `.github/workflows/ci.yml` — lint, typecheck, `prisma generate`, build, on every push/PR. Closes the Release Engineering card's first bullet outright.
- [ ] `prisma/migrations/` scaffolding + a `.env.staging.example` and `.env.liveverify.example` (mirroring `.env.example`, per Codex Guardian's blocker #3) so the moment real credentials land, the tiers exist.
- [ ] A pre-migration checklist script (`scripts/verify-env.ts`) that validates required env vars are present without printing secret values — the CI card explicitly calls for this.

**Needs you, ~15 minutes each:**
- [ ] Spin up the Supabase project, drop real `DATABASE_URL`/`DIRECT_URL` into `.env.local`.
- [ ] Run `npm run prisma:migrate` against it — first real schema deploy.
- [ ] Stripe test-mode keys in `.env.local`, run `npm run seed:stripe`, confirm the 5 products/prices print out.
- [ ] Clerk test instance keys, confirm `/sign-in` and `/sign-up` render locally.

**Stretch, if the above goes fast:**
- [ ] `vercel link` + first preview deploy — even without production DNS, a preview URL proves the build survives outside your machine.
- [ ] One full local walkthrough of Stage 1 of the Pilot Environment journey matrix: sign up → checkout (test mode) → land on gated dashboard. First entry in what becomes the "dated evidence" the card requires.
- [ ] Update the four new Tech Guts cards (Pilot Environment, Release Engineering, Platform Delivery State, Command Center) with today's actual state and assign them to you — they're sitting unassigned right now and shouldn't be by tonight.

Say the word and I'll start on the CI workflow and the env-tier scaffolding now — those don't need anything from you first.
