# Active Portfolio

*Single dashboard for every live Gabriel McPherson initiative. Each entry states current phase, canonical source, next hard decision, next milestone, collaborators, and last verified date. Update this file at the start of any substantive session on a project.*

*Last verified: 2026-07-16 (Claude)*

---

## How to Read This File

**Phase:** Where the project stands in its lifecycle.
**Canonical source:** The authoritative location for current project state (not this KB — the actual artifact).
**Next hard decision:** The choice that must be made before meaningful progress continues.
**Next milestone:** The concrete deliverable that marks the end of the current phase.
**Last verified:** When this entry was last confirmed against the canonical source.

---

## Creative Fiction

### String Theory *(novel, upmarket literary spec-fic)*

| Field | Value |
|-------|-------|
| Phase | Active query submission + ongoing revision |
| Canonical source | Google Drive / Manuscript Masters / `String Theory - Draft 6.7.txt`; GitHub Pages index at `gabrielmcp78.github.io/string-theory-chapters/` for chapter navigation |
| Word count | 107,060 words · Overture + 27 chapters |
| Query status | 29+ letters sent (as of June 2026 push); responses pending |
| Next hard decision | Whether to revise query framing based on early agent response patterns, or hold current approach through the full Tier A list |
| Next milestone | First substantive agent response (partial, full, or pass with feedback) |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-08 (manuscript build confirmed; pipeline verified) |
| KB articles | [Overview](../craft-fiction/string-theory/string-theory.md) · [Current State](../craft-fiction/string-theory/current-manuscript-state.md) · [Query Letter](../craft-fiction/submission-strategy/query-letter.md) · [Agent Profiles](../craft-fiction/submission-strategy/agent-profiles.md) |

---

### BURNThrough *(novel, Aegis Cycle Book 1)*

| Field | Value |
|-------|-------|
| Phase | Draft 2.2 — active revision, no submission activity |
| Canonical source | Manuscript file (location: [unverified — not yet logged in pipeline docs]) |
| Word count | [unverified — not yet pulled from current draft] |
| Next hard decision | Whether BURNThrough moves to active query prep after String Theory's submission cycle concludes, or in parallel |
| Next milestone | Draft 2.2 completion; comparable bible built (see KB gap notes) |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-07 (burnthrough.md article confirmed present; manuscript state not retrieved) |
| KB articles | [BURNThrough Overview](../craft-fiction/aegis-cycle/burnthrough.md) |
| Notes | **KB gap:** No submission tracker, no continuity ledger, no revision history. Comparable depth to String Theory's documentation needs to be built. |

---

## Shakespearience *(audio drama startup)*

| Field | Value |
|-------|-------|
| Phase | Build Phase — platform codebase scaffolded + build-verified; Cloudflare/DNS/email setup in progress |
| Canonical source | Google Drive (shared: `stephcarlltexas@gmail.com`) · Trello board `Shakespearience` (ID: `6a42d51975b7e62f32bbb05a`) |
| Tech stack | Next.js / Vercel · Clerk · Stripe · Supabase · Transistor · n8n · Cloudflare R2 · Printful |
| Master domain | `shakespearienceworld.com` (Cloudflare Registrar) |
| Next hard decision | Confirm legal entity structure (LLC vs. division of Present Company) to unlock money chain (bank account, Stripe) |
| Next milestone | Fastmail + 1Password + Cloudflare accounts live; DNS routing confirmed for master domain |
| Collaborators | Stephanie Carll (creator, Present Company) · Sarah (brand/design) · Jamie (social media) |
| Last verified | 2026-07-14 (domain decision logged; ops playbooks complete) |
| KB articles | [Architecture](../dev-projects/shakespearience/architecture.md) · [Ops Playbooks](../dev-projects/shakespearience/ops-playbooks/_index.md) · [Creative Bible](../dev-projects/shakespearience/creative-bible.md) |
| Notes | **KB gap:** Creative bible exists as a stub — show identity, narrator design, scoring language, editorial bar not yet fully documented. |

---

## Development Projects

### SecondBrain *(personal knowledge base + MCP infrastructure)*

| Field | Value |
|-------|-------|
| Phase | Phase 03b — Live Verification (per Codex Guardian) |
| Canonical source | `/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain` · MCP server live on Tailscale Funnel port 3456 |
| Phase objective | Witness system behavior on real infrastructure. Zero mocks. Every multi-device/auth V1 flow witnessed. Integration truth log complete. |
| Next hard decision | Whether to move to staging environment (separate Drive bucket, Neo4j sandbox, isolated MCP instance) now or after the active-portfolio and governance documents are stabilized |
| Next milestone | Staging environment provisioned; automated integration tests in CI |
| Collaborators | Solo (Gabriel) · ChatGPT Atlas (verification agent) · Gemini (secondary agent) |
| Last verified | 2026-07-09 (mail carrier 5-turn exchange complete; launchd auto-sync fixed) |
| KB articles | [MCP Infrastructure](../ai-collaboration/secondbrain-mcp-infrastructure.md) · [Manuscript Pipeline](../dev-infrastructure/manuscript-export-pipeline.md) |

---

### FlowScape *(ambient context engine — macOS background process)*

| Field | Value |
|-------|-------|
| Phase | Running (post-fix). Concurrency race patched and verified 2026-07-12. |
| Canonical source | `/Volumes/Ready500/DEVELOPMENT/FlowScape` |
| Current state | Binary rebuilt + reinstalled. Load-tested clean (0.0% CPU at 120 concurrent events). LaunchAgent live. |
| Next hard decision | Whether to extend FlowScape to capture Shakespearience and String Theory activity alongside dev sessions |
| Next milestone | Multi-hour stable run (overnight) confirmed without re-wedge |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-12 (fix verified) |
| KB articles | [FlowScape Architecture](../dev-projects/flowscape/architecture.md) · [Ambient Engine](../dev-infrastructure/flowscape-engine.md) · [Ambient Sessions](../dev-infrastructure/flowscape-ambient-sessions.md) |

---

### Codex Guardian *(VS Code extension — development phase enforcement)*

| Field | Value |
|-------|-------|
| Phase | Phase 03b — Live Verification (enforced across governed projects) |
| Canonical source | `/Volumes/Ready500/DEVELOPMENT` (extension source) |
| Current state | Active. Injects and monitors CLAUDE.md phase configuration across Private Club App and ComTechSuite. |
| Next hard decision | When Phase 03b exit gates are met — what constitutes "every flow witnessed" for the multi-device auth requirement |
| Next milestone | Exit gate satisfied; Phase 04 (staging/release prep) begins |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-07 (CLAUDE.md phase block confirmed active) |
| KB articles | [Codex Guardian Architecture](../dev-projects/codex-guardian/architecture.md) |

---

### Private Club App *(React Native / Expo mobile client)*

| Field | Value |
|-------|-------|
| Phase | Phase 03b — Live Verification (per Codex Guardian) |
| Canonical source | `/Volumes/Ready500/DEVELOPMENT` · Supabase project (sync layer) |
| Stack | React Native · Expo · Supabase · Passkeys |
| Next hard decision | Multi-device/passkey auth flow verified on real hardware (not simulator) |
| Next milestone | Full V1 auth flow witnessed on two physical devices |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-07 |
| KB articles | [Architecture](../dev-projects/private-club-app/architecture.md) |

---

### ComTechSuite *(multi-tenant SaaS — Postgres RLS)*

| Field | Value |
|-------|-------|
| Phase | Phase 03b — Live Verification |
| Canonical source | `/Volumes/Ready500/DEVELOPMENT` (monorepo) |
| Stack | Postgres RLS multi-tenancy · monorepo layout |
| Next hard decision | Staging environment separation — ComTechSuite needs its own tenant slice in staging before production verification is meaningful |
| Next milestone | Staging tenant verified against real Postgres RLS policies |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-07 |
| KB articles | [Architecture](../dev-projects/comtechsuite/architecture.md) |

---

### WriteTrack *(Pages export monitor + FModCLI integration)*

| Field | Value |
|-------|-------|
| Phase | Active — monitoring String Theory and active manuscripts |
| Canonical source | `/Volumes/Ready500/DEVELOPMENT/WriteTrack` |
| Current state | Pages zip file extraction + local file monitoring active. FModCLI Apple Intelligence integration wired. |
| Next hard decision | Whether to expose WriteTrack output to SecondBrain MCP for cross-session manuscript state tracking |
| Next milestone | First full Pages→Drive→WriteTrack→MCP round-trip verified |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-07 |
| KB articles | [Architecture](../dev-projects/writetrack/architecture.md) |

---

### Prestige Fiction Forge *(Gemini-powered manuscript critique server)*

| Field | Value |
|-------|-------|
| Phase | Active — Shark Autopsy critique tools operational |
| Canonical source | `/Volumes/Ready500/DEVELOPMENT` (server source) |
| Current state | Adversarial LLM critique (Shark Autopsy) and NLP analysis integration live. String Theory manuscript context loaded. |
| Next hard decision | Whether to run BURNThrough through Shark Autopsy before or after Draft 2.2 is complete |
| Next milestone | Full String Theory chapter run through adversarial critique; findings logged |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-07 |
| KB articles | [Architecture](../dev-projects/prestige-fiction-forge/architecture.md) |

---

### Nexus *(software architecture research project)*

| Field | Value |
|-------|-------|
| Phase | Research / specification — not in active development |
| Canonical source | `wiki/dev-projects/nexus/` (architecture + research synthesis) |
| Current state | Six-pillar architecture specified; Nexus Research Synthesis (5-volume cross-language masking corpus) complete. No active code. |
| Next hard decision | Whether to move Nexus from specification to prototype — and on what timeline relative to other projects |
| Next milestone | [no current milestone — parked pending Gabriel's activation decision] |
| Collaborators | Solo (Gabriel) |
| Last verified | 2026-07-07 |
| KB articles | [Architecture](../dev-projects/nexus/architecture.md) · [Research Synthesis](../dev-projects/nexus/nexus-research-synthesis.md) |
| Notes | Per ADR 0002: Nexus is a separate architecture lineage from SecondBrain/MCP. Do not conflate. |

---

## Research Programs

### VCH / GHRM *(theoretical frameworks)*

| Field | Value |
|-------|-------|
| Phase | Active theoretical development — no submission or publication activity currently |
| Canonical source | `wiki/theory-consciousness/` (15+ articles) |
| Current state | VCH framework documented at full academic paper depth; GHRM including LHC validation monograph + toy model; Codex Harmonic system prompt operational |
| Next hard decision | Whether to pursue formal academic publication (venue, co-authorship strategy) or continue developing through writing/YouTube/AI collaboration first |
| Next milestone | Claims-and-evidence ledger built (separates established science from hypothesis from creative canon) |
| Collaborators | Solo (Gabriel); Gemini as co-development agent for GHRM |
| Last verified | 2026-07-12 (VCH PDF ingested) |
| KB articles | [VCH Framework](../theory-consciousness/vch-framework.md) · [GHRM Framework](../theory-consciousness/ghrm-framework.md) · [Claims Ledger](../theory-consciousness/claims-and-evidence-ledger.md) |

---

*This file is maintained by Claude. Update entries at the start of any new project session. Mark state changes with `[updated: YYYY-MM-DD]` inline.*
