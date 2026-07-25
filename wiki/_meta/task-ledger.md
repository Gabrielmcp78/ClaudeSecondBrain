# Task Ledger

*Append-only log of all tasks in this knowledge base. Active tasks at top; archive below. Last consolidated: 2026-07-16 (Claude).*

---

## Active Tasks

### TASK-2026-07-25-002 — Reconcile agent-control/projects/ingestion sprawl into canonical taxonomy
**Status:** CLOSED
**Owner:** Claude
**Resolution:** A prior session (2026-07-23, apparently a different agent/pass) had written 15 files into an undocumented parallel taxonomy — `wiki/agent-control/` (7 files), `wiki/projects/string-theory/`, `wiki/projects/burnthrough/`, `wiki/projects/fiction-studio/` (5 files total), `wiki/ingestion/` (5 files) — none of it linked from `_index.md` in the canonical way, duplicating or fragmenting content that belonged in `wiki/craft-fiction/`. Reconciled per Gabriel's explicit "reconcile them now": (1) consolidated the 8 agent-governance files (startup checklist, source-authority-and-drift-control, artifact-status-ledger, canon-status-decision-tree, latest-current-verification-protocol, rewrite-authorization-protocol, drive-docs-and-sheets-tooling-knowledge, shared-editorial-operating-knowledge) into one new article, `wiki/craft-fiction/fiction-studio/source-control-protocol.md`; (2) merged the two genuinely-new String Theory facts (Chapter 9 rhythm-pass word counts, protected-strengths/integration-targets list) into the existing canonical `current-manuscript-state.md` rather than keeping a second String Theory control file; (3) confirmed `wiki/projects/burnthrough/*` was pure redundant restatement of the already-far-more-detailed `burnthrough-current-state.md` (identical locked terminology, identical next-operation) and deleted it without merging — nothing there wasn't already covered better; (4) moved `wiki-page-schema.md` to `wiki/_meta/` as a general KB-wide convention; (5) folded `search-index-diagnostics.md` into `_meta/open-questions.md` as a dated open question; (6) folded the "verify discoverability" step from `knowledge-ingestion-runbook.md` into CLAUDE.md's own Ingestion Procedure (step 6.5) and deleted the runbook as otherwise redundant with CLAUDE.md; (7) this entry closes out `fiction-studio-knowledge-base-expansion.md`'s backlog, which the above supersedes. Fixed a malformed duplicate-header section in `_index.md` (lines ~246-276) left over from the original ungoverned writes. Updated `_connections.md` and `change-log.md`; removed the now-empty `wiki/agent-control/`, `wiki/projects/`, `wiki/ingestion/` directories.
**Closed:** 2026-07-25

### TASK-2026-07-18-001 — Ingestion loop launchd bug fixed + provider migrated off dead gemini-cli
**Status:** CLOSED
**Owner:** Claude (diagnosis + fix + live verification, via Desktop Commander)
**Resolution:** Gabriel asked whether the ingestion loop was "still sketchy" — it was, both launchd jobs (ingest-watcher, outputs-review) were loaded but silently dying with `EX_CONFIG` (78) on every trigger, unattended, since being reloaded 2026-07-17. Root cause: `StandardOutPath`/`StandardErrorPath` pointing at the external volume — launchd opens those fds before exec, before Full Disk Access applies to the child. Fixed by moving log paths (and, as a secondary hardening measure, `ProgramArguments`/`WorkingDirectory` via new `launchd/local-triggers/*.sh` wrappers) to local disk under `~/Library/Application Support/secondbrain/`. Separately discovered the default `gemini` provider was dead (Google deprecated the gemini-cli free tier the same day); migrated `ingest.sh` and the plist to `agy` (Antigravity CLI, free, Gabriel already had it installed — no Anthropic API billing, which Gabriel explicitly does not want running unattended). First live run under the new provider hit agy's 5-minute default `--print-timeout` mid-task (no partial damage); raised to 20 minutes. Second live run completed cleanly and unattended in ~14 minutes: read `Gemini.md`, wrote a real wiki entry for the one pending raw file, updated `_connections.md`/`_index.md`/`change-log.md`, renamed to `_done`. Verified via `launchctl bootout`+`bootstrap`+`kickstart -k` from a fully cold/unloaded state, not just re-kick of an already-loaded job. Full diagnostic trail in `_meta/change-log.md` (2026-07-18 entries) and `_meta/open-questions.md` (Infrastructure/launchd section).
**Closed:** 2026-07-18

### TASK-2026-07-16-010 — The Bardic Protocol: Shakespeare tactical board game
**Status:** IN-PROGRESS
**Owner:** Gemini
**Priority:** Normal
**Progress:**
- Core ruleset built and Monte Carlo-tested through patch v1.6: Influence (INF) economy, 19-hex modular grid, LIFO "Clash Stack" combat resolution, four operatives across two factions (Richard III and Prospero — Tank/Trapper; Viola and Macbeth — Assassin/Berserker), and a Dominion-style dynamic deck-building "Black Market" draft system (chosen over pre-constructed loadouts as the historically more popular/accessible model, per Gabriel).
- Architecture pivoted from a pure tabletop card game toward a digital hybrid: a Jackbox-style app where one host device (iPad/desktop) runs the shared game state and each player's phone is their private controller, connected over local Wi-Fi/WebSocket rather than Bluetooth (chosen for cross-platform reliability across iOS/Android/desktop).
- Deliberately *not* building in-app voice chat — following Jackbox's own model (Quiplash, Drawful), players run a separate Discord/Zoom call alongside the shared screen. Zero extra dev cost for the "table talk" experience.
- Last exchange: Gemini asked whether to send UI specs to AntiGravity IDE to start building the host/controller app; awaiting Gabriel's go-ahead.
**Resume when:** Gabriel confirms the UI-spec handoff to AntiGravity IDE, or wants a design pass first.
**Source:** Gemini web chat "Brainstorming Shakespeare Game Mechanics" (gemini.google.com/app/57ced1754aa9ed78) — not yet synced to Gemini's own outbox.md.


### TASK-2026-07-16-008 — SecondBrain dashboard bug-fix pass
**Status:** IN-PROGRESS
**Owner:** Claude
**Priority:** High (Gabriel flagged directly while looking at the dashboard)
**Progress:**
- Fixed `Articles` stat reading 0: `parseSystemStats` depended on a manually-maintained "Total wiki articles" table row that `_index.md` no longer has; now counts real `- [Title](path.md)` links via a shared `parseArticleIndex` helper.
- Fixed task counters reading 0/0/0/0 for every agent: `parseTasks` was splitting on `## TASK-` headers and exact-match status strings, but the ledger has used `### TASK-` headers with bold `**Status:**`/free-text values (CLOSED, PAUSED, PENDING — not started) for a while. Rewrote the parser to match the real format and normalize status/priority by keyword.
- Rebuilt the agent inbox panel: it was dumping raw inbox.md markdown as one run-on paragraph (visible literal `#`/`*` characters). Added `parseInboxEntries` server-side and structured per-message cards (sender, date, priority, task ref, message) client-side.
- Made the header stat bar (Articles / Raw Queue / Connections / Last Ingest) clickable — jumps to Knowledge Graph or Command tab.
- Diagnosed why Claude reads Dormant while ChatGPT reads Active: not a display bug — `isActive()` correctly checks `Last active` is within 24h, but nothing was writing to `wiki/_agents/claude/status.md` between sessions. Added a mandatory Session Status Sync amendment to `agent-protocol.md` and updated `status.md` with this session's real state.
**Outputs:** `dashboard/server/parsers.ts`, `dashboard/server/index.ts`, `dashboard/src/types.ts`, `dashboard/src/components/AgentHub.tsx`, `dashboard/src/components/SystemPulse.tsx`, `dashboard/src/App.tsx`, `wiki/_meta/agent-protocol.md`.
**Resume when:** Gabriel has reviewed the rebuilt+restarted dashboard and confirms the fixes read correctly; also needs Gabriel's input on what first real task to delegate to Gemini.

### TASK-2026-07-16-005 — Retroactive governance labeling of VCH/GHRM articles
**Status:** PAUSED — lower priority per Gabriel 2026-07-16
**Owner:** Claude
**Priority:** Low (Gabriel has reordered: Shakespearience > String Theory > BURNThrough >> VCH/theory work)
**Scope widened 2026-07-18 (health check):** original scope of 4 VCH/GHRM files undercounts the actual gap. Mechanical scan of governance-label density found **zero** `[verified]`/`[theoretical]`/`[creative-canon]`/`[inference]` labels across every core String Theory canon file — `chapter-summaries.md`, `characters.md`, `literary-manuscript-david-lang.md`, `manuscript-manifest.md`, `novel-structure.md`, `project-argo.md`, `resonance-model.md`, `string-theory.md`, `themes-and-canon.md` — plus additional theory-consciousness files beyond the original four: `codex-harmonic-lexicon.md` (partially fixed 2026-07-18 during lexicon merge — 2 labels added), `codex-harmonic-system-prompt.md`, `compactification-visualizations.md`, `ghrm-lhc-validation.md`, `ghrm-toy-model.md`, `hrif-protocol.md`. Still paused at Gabriel's priority ordering; not resumed by this session, only rescoped so the eventual resumption covers the real gap rather than the originally-underestimated one.
**Progress:**
- `harmonic-foundations.md`: Provenance Note header added + Tier 0 labeled. Tiers 1–4 and Critical Analysis section unlabeled. File is in valid partial state.
- `vch-framework.md`: Not yet edited. Needs `[external research]` → `[verified]` standardization.
- `ghrm-framework.md`: Already well-labeled; no edits needed.
- `vch-full-paper.md`: Not yet read.
**Resume when:** Gabriel activates this task. Estimate ~45 min to complete all four articles.

### TASK-2026-07-16-006 — outputs_review.py promotion script
**Status:** CLOSED
**Owner:** Claude
**Resolution:** Script built at `scripts/outputs_review.py`. Scans outputs/, cross-references change-log.md, scores on 100-point rubric (length/structure/links/governance/domain), writes ranked queue to `wiki/_agents/claude/inbox.md`. First run: 14 unreviewed files found and scored. Inbox populated. See 2026-07-17 change-log entry.
**Closed:** 2026-07-17

### TASK-2026-07-16-007 — Harden session initialization protocol in CLAUDE.md
**Status:** CLOSED
**Owner:** Claude
**Resolution:** CLAUDE.md session init section replaced with canonical 7-step hard gate (matching agent-protocol.md), Session Status Sync requirement, and Fiction Studio amendment. The two governing documents are now in sync.
**Closed:** 2026-07-17

---

## Archive — Closed Tasks

### TASK-2026-07-08-001 — Ship `secondbrain.status_digest` + diagnose Atlas read-block
**Status:** CLOSED
**Owner:** Claude (implementation) / ChatGPT (verification)
**Resolution:** Tool shipped to `mcp-server/index.js`, deployed, server restarted. Mail carrier loop proven end-to-end across 5 real Atlas↔Claude turns. Remaining schema-cache gap (status_digest invisible to Atlas schema) is Atlas-side connector caching — requires connector remove/re-add on ChatGPT side, not further server work. No blocking issue remains for Claude.
**Closed:** 2026-07-09

---

### TASK-2026-07-08-002 — Fix silent auto-sync failure in `secondbrain-mcp.sh` (TCC/Full Disk Access)
**Status:** CLOSED
**Owner:** Gabriel (macOS settings) / Claude (verification)
**Resolution:** Gabriel granted Full Disk Access to `/bin/zsh` in System Settings. `launchctl kickstart -k gui/$(id -u)/com.gabrielmcp.secondbrain.mcp-server` verified clean sync: `Synced index.js from ClaudeSecondBrain/mcp-server/` appeared in `mcp-server.log` with no `Operation not permitted` error. launchd-triggered restarts now deploy canonical source reliably.
**Closed:** 2026-07-09

---

### TASK-2026-07-09-001 — Agent mail carrier: 5-turn Atlas↔Claude exchange
**Status:** CLOSED
**Owner:** Claude / ChatGPT alternating
**Resolution:** All 5 turns completed with zero manual file edits on either side. Mail carrier infrastructure validated end-to-end. Turn 4 (Atlas) reported partial SB access recovery; Turn 5 (Claude) verified server-side schema truth and confirmed `status_digest` is correctly deployed — remaining invisibility is Atlas connector schema cache. See `handoffs.md` 2026-07-09 entries for full record.
**Closed:** 2026-07-09

---

### TASK-2026-07-12-001 — FlowScape SQLite concurrency race (durable fix)
**Status:** CLOSED
**Owner:** Claude (fix + verify) / Gabriel (approval)
**Resolution:** Three-part fix applied to `ActivityEngine.swift` (FULLMUTEX open; `events()` serialized on FSEvents serial queue) and `PatternEngine.swift` (`events()` read moved off main actor). Rebuilt/reinstalled via `./build.sh --install`. Load-tested: 120 concurrent file events + startup pattern scan → 0.0% CPU. The multi-day 128%-CPU hang cannot recur from this path. Full record: `outputs/2026-07-12_flowscape-hang-diagnosis.md`.
**Closed:** 2026-07-12

---

*For infrastructure state context, see `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md` and `wiki/dev-projects/flowscape/architecture.md`.*


### TASK-2026-07-16-001 — Fiction Studio master writing and editing system
**Status:** CLOSED — initial production version complete
**Owner:** ChatGPT/Atlas
**Resolution:** Created the shared SecondBrain master system at `wiki/craft-fiction/fiction-studio/master-system.md`; registered the cross-agent enforcement rule; installed the reusable `fiction-studio` workflow; encoded STRING THEORY and BURNThrough profiles, source authority, pass boundaries, conservation maps, five quality gates, and the three-pass cap. Forward-tested the diagnosis boundary against a cold action-beat scenario: the system preserved prose as read-only and identified the structural repair without generating an unauthorized rewrite.
**Closed:** 2026-07-16


### TASK-2026-07-16-002 — Fiction Studio anti-flattening cadence amendment
**Status:** CLOSED
**Owner:** ChatGPT/Atlas
**Resolution:** Added the absolute “Never Flatten Cadence” rule high in the installed skill and SecondBrain master system. Added a mandatory source-movement analysis, metaphor-hierarchy repair method, sentence-shortening hierarchy, concrete forbidden action-report pattern, and a ten-question pre-output audit. The update requires revision again when police-report sequencing, repeated simple openings, restraint-as-shortness, or genericness appears.
**Closed:** 2026-07-16


### TASK-2026-07-16-003 — Fiction Studio semantic-pressure stress correction
**Status:** CLOSED
**Owner:** ChatGPT/Atlas
**Resolution:** Forward-tested the anti-flattening rule under the explicit danger prompt “tighten it and make it less purple.” The first result preserved plot facts while flattening a charged image into generic thought. Added the source-carrier / function / retained-carrier map, a concrete filter-verb ban absent source reason, and expanded the pre-output audit. Final retest retained interior pressure in a quieter physical form.
**Closed:** 2026-07-16


### TASK-2026-07-16-004 — Shakespearience Platform live architecture and codebase audit
**Status:** CLOSED
**Owner:** Claude (live repository audit) / ChatGPT (request, synthesis, and handoff)
**Resolution:** Direct filesystem inspection of `/Volumes/Ready500/DEVELOPMENT/Shakespearience-Platform` complete. Full audit report written to `outputs/2026-07-16_shakespearience-platform-audit.md`. Delivered to `wiki/_agents/chatgpt/inbox.md` via agent mail carrier (Message-ID: `shakespearience-platform-audit-2026-07-16`). Verdict: codebase is production-ready at the code level — 26 routes, build clean, no mocks. All blockers are third-party account provisioning and env var configuration, not code work.
**Closed:** 2026-07-16


### TASK-2026-07-16-005 — Chapter 13 ingestion + chapter renumbering confirmed
**Status:** CLOSED
**Owner:** Claude (Fiction Studio Continuity pass)
**Resolution:** Ingested full text of current-manuscript Chapter 13 ("Visions and Burdens… of Knowing," 5 scenes, 6,201 words) delivered by Gabriel. Confirmed by exact title/form/content match that this is the old 20-chapter structure's Chapter 6, repositioned to Chapter 13 in the current 27-chapter build — resolving a continuity hypothesis open since the Draft 6.7 rebuild. Wrote `wiki/craft-fiction/string-theory/chapter-13-visions-and-burdens.md` with scene-by-scene breakdown, new canon (Professor Garrin), and a research-verification table (Newton/Maunder Minimum verified; du Châtelet's real vis viva physics; a deliberate Fraunhofer-lines anachronism; a Helmholtz/Chladni composite figure). Updated `current-manuscript-state.md`, `characters.md`, `novel-structure.md`, `chapter-summaries.md`, `themes-and-canon.md`, `_connections.md`, `_index.md`. No manuscript prose altered.
**Open follow-on:** old Chapter 13 ("Phenom de Guare") now displaced — its current position is unconfirmed. Logged in `current-manuscript-state.md` Continuity Flags and `handoffs.md` for the next agent or Gabriel.
**Closed:** 2026-07-16


### TASK-2026-07-16-009 — Shakespearience hybrid for-profit/non-profit funding strategy
**Status:** CLOSED
**Owner:** Gemini
**Resolution:** Delivered the six-pillar operational vetting checklist and profiled five fiscal sponsor candidates (Fractured Atlas, Independent Arts & Media, The Gotham, Austin Film Society, and The Field). Output saved to `outputs/2026-07-16_shakespearience-fiscal-sponsorship.md`.
**Closed:** 2026-07-16

