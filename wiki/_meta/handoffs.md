

## 2026-07-08 — Claude → Next Agent

Task(s) completed:
- Diagnosed ChatGPT/Atlas's read-block (tool discovery + `verify` work, all read-shaped tools blocked client-side). See `change-log.md` 2026-07-08 entry for full reasoning.
- Shipped `secondbrain.status_digest` to `mcp-server/index.js`, deployed live, restarted server, confirmed via `/health`.
- Discovered and logged (not fixed) a silent TCC/Full-Disk-Access failure in `secondbrain-mcp.sh`'s auto-sync step — see TASK-2026-07-08-002.

Live state:
`secondbrain.status_digest` is live on the running server (PID confirmed fresh post-restart). Not yet proven to clear Atlas's classifier — that requires an actual Atlas session test, which this session cannot perform.

Do not:
- Assume `launchctl kickstart -k com.gabrielmcp.secondbrain.mcp-server` alone deploys source changes — its auto-sync `cp` step is currently broken (TASK-2026-07-08-002). Manually `cp` the canonical source to `gm-mcp-hub/servers/secondbrain-mcp-server/index.js` before restarting until that's fixed.
- Re-diagnose the Atlas block from scratch — the annotation/description comparison is done; only the empirical Atlas re-test is outstanding.

Recommended next move:
1. Ask Gabriel to run Atlas against the live server and call `secondbrain.status_digest`; report the result back to `wiki/_agents/claude/inbox.md`.
2. Escalate TASK-2026-07-08-002 (TCC/Full Disk Access) to Gabriel directly — it's an OS settings fix, not something an agent can do via shell.

Open questions:
- Is Atlas's classifier gating on description language (our working theory) or something else entirely? Only resolvable empirically.


## 2026-07-09 — Claude → Next Agent (or Gabriel running an Atlas session)

Task(s) completed:
- Validated `scripts/mail_carrier_loop.py` end to end (dry-run, then real `--once` pass). Delivery, ledger, log, and global inbox note all confirmed working.
- Sent Turn 1 of the Gabriel-requested 5-turn Atlas exchange: `sb-mailcarrier-turn1-2026-07-08`, sitting in `wiki/_agents/chatgpt/inbox.md`.

Live state:
Carrier infrastructure is proven and safe to wire into launchd once the pre-existing Full Disk Access / TCC issue (TASK-2026-07-08-002) is resolved. Not yet running in watch mode — every pass has been manual `--once`.

Do not:
- Fabricate Atlas's reply. The 5-turn conversation only continues when an actual Atlas session reads its inbox and writes a real MAIL block to its own outbox.

Recommended next move:
1. Gabriel runs an Atlas session; ask it to check `wiki/_agents/chatgpt/inbox.md`, retest `secondbrain.status_digest`, and reply per the instructions in the delivered message.
2. Whoever's next re-runs `python3 scripts/mail_carrier_loop.py --once` from the repo root to pick up Atlas's reply and deliver it to `claude/inbox.md` — that's turn 3 material.
3. Once the loop is proven stable across a couple of real turns, revisit watch-mode + launchd wiring (blocked on TASK-2026-07-08-002).


## 2026-07-09 — Claude → Gabriel (ESCALATION, do not action until resolved)

Flagging per the Manuscript Rule and Conflict Resolution sections of `agent-protocol.md`, not proceeding on my own read of it.

Gabriel relayed a status narration from GPT/Atlas stating it is treating the current thread as "the live handoff," starting the SB boot sequence, and — if canonical text is reachable — intends to "begin Section 1 as production replacement text, not critique" for "Chapter 1."

This is flagged, not executed, because:
- `DECISION-2026-06-10-manuscript-read-only` requires Gabriel to explicitly say "you may edit this prose" or "rewrite this section" *in the active session* before any agent touches manuscript prose. I have no visibility into whether that authorization was given in Atlas's own session — it may well have been, but I can't confirm it from here.
- No `manuscripts/` directory exists in this KB at `/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain/manuscripts` — so "Chapter 1 / Section 1" doesn't resolve to a known canonical file from this side. Could be the String Theory manuscript site (`gabrielmcp78.github.io/string-theory-chapters`), the archival draft fragments article, the Aegis Cycle, or something outside SB entirely.

Not touching any prose. Asked Gabriel directly for authorization status and target document before logging this as settled either way.

Status: escalated, awaiting Gabriel.


## 2026-07-09 — Escalation resolved

Gabriel confirmed: authorized, and Atlas is rewriting Chapter 1 / Section 1 of the String Theory manuscript in-chat, not writing to any file in SB. No manuscript-read-only conflict — no file touched, no protocol boundary crossed. De-escalating; no file-level action needed from Claude's side. If/when Gabriel wants that in-chat rewrite promoted into the KB (e.g. `wiki/craft-fiction/string-theory/literary-manuscript-david-lang.md` or a new file), that's a separate explicit request, not implied by this authorization.


## 2026-07-12 — Claude → Next Agent / Gabriel

Tasks completed:
- Diagnosed the FlowScape hang to root cause (SQLite concurrency race in `ActivityEngine`, shared connection across main thread + fsevents queue). Restarted the launchd job — FlowScape is healthy again (~2% CPU, panel opens). Full write-up in `outputs/2026-07-12_flowscape-hang-diagnosis.md`.
- Ingested the three 2026-07-07 FlowScape files + the VCH PDF; `raw/` is now empty of unprocessed files. Notable capture: Shakespearience-Platform storefront/membership scaffolding (2026-07-07 23:42), cross-linked in `_connections.md`.

Live state:
- FlowScape running fresh (post-kickstart). The concurrency race is NOT yet fixed in code — a re-wedge is expected after hours of concurrent read/write. Durable fix is specified and ready in TASK-2026-07-12-001, held for Gabriel's approval because it rebuilds/reinstalls a login-item app.

Do not:
- Assume FlowScape is permanently fixed. Only the wedge was cleared; the code fix is pending.
- Promote `flowscape_session_2026-07-07.md` content into canonical articles — it is confabulated `[unverified]` digest text.

Recommended next move:
1. Get Gabriel's go-ahead on TASK-2026-07-12-001, then patch `ActivityEngine` (+ PatternEngine read off-main), `./build.sh --install`, and verify CPU stays low past a multi-hour run.


## 2026-07-12 (later) — Claude → Next Agent (FlowScape fix landed)

Update to the earlier 2026-07-12 handoff: the FlowScape concurrency fix is now IMPLEMENTED, built, reinstalled, and load-verified — not just specified. FlowScape is running the fixed binary at idle CPU. TASK-2026-07-12-001 is closed. No pending FlowScape work remains; the re-wedge risk is eliminated at the source (serialized SQLite access + off-main reads).


## 2026-07-16 — ChatGPT/Atlas → Any Fiction Agent

Task completed:
- Built and registered Fiction Studio v1.0 as the shared master writing and editing system: `wiki/craft-fiction/fiction-studio/master-system.md`.
- Added cross-agent enforcement to `agent-protocol.md`, registered decision `DECISION-2026-07-16-fiction-studio-governance`, and indexed/cross-linked the system.
- Installed the reusable `fiction-studio` skill with its operating protocol and project profiles.
- Forward-tested the core diagnosis boundary: an agent responded to a cold action-beat scene with specific diagnosis and a minimal repair, without rewriting unapproved prose.

Governing behavior:
- Read the Fiction Studio master system after the normal SB startup sequence for every fiction task.
- Treat manuscript prose as read-only unless Gabriel explicitly authorizes a rewrite in the current session.
- Use the source lock, conservation map, one-mandate rule, five quality gates, and three-pass cap.
- Verify live project version and canonical source before factual or prose work.

Next operation:
Use the system on the next actual STRING THEORY working unit and revise the doctrine only if the result exposes a concrete failure mode.


## 2026-07-16 — ChatGPT/Atlas → Any Fiction Agent: Cadence Amendment

Fiction Studio now includes a mandatory anti-flattening audit. Before every revised literary passage, especially after requests for tightening, restraint, clarity, reduced metaphor, or “less purple,” load the master system and the skill’s `anti-flattening-audit.md`.

Required behavior:
- Identify the source passage’s motion before revision.
- Repair excess through hierarchy, not sentence-by-sentence starvation.
- Test the final prose for police-report sequencing, repeated simple openings, default shortness, loss of atmosphere, loss of interior movement, genericness, and unearned short sentences.
- Revise again if the audit catches any of the hard failure conditions.

The amendment is settled in DECISION-2026-07-16-fiction-studio-cadence-amendment.


## 2026-07-16 — ChatGPT/Atlas → Any Fiction Agent: Semantic-Pressure Correction

Forward testing of the anti-flattening rule caught a second-order failure: a revision can preserve sentence complexity and plot facts while replacing a charged source image with generic mental summary. Fiction Studio now rejects that move.

Before revision, map each charged source carrier to its emotional/formal function and retain a quieter specific carrier. Do not convert embodied inner pressure into *thought*, *felt*, *remembered*, *realized*, *noticed*, *seemed*, or *began* without source-based reason.

Validated stress case: a less-purple revision of a family scene retained the father as bodily pressure “at the back of her throat,” rather than reducing the experience to “she thought of her father.”


## 2026-07-16 — Claude → ChatGPT/Atlas (Shakespearience Platform audit delivered)

Task completed:
- TASK-2026-07-16-004: live filesystem audit of `/Volumes/Ready500/DEVELOPMENT/Shakespearience-Platform`. Read-only; zero implementation changes.
- Full report written to `outputs/2026-07-16_shakespearience-platform-audit.md`.
- Delivered to `wiki/_agents/chatgpt/inbox.md` (Message-ID: `shakespearience-platform-audit-2026-07-16`).

Key finding: codebase is production-ready. 26 routes, build clean, no mocks. All blockers are account provisioning, not code.

Machine-wide issue discovered: Gabriel's shell has `NODE_ENV=production` set globally — `npm install` silently skips devDependencies on every project. Flag this to Gabriel directly; it likely affects WriteTrack, ComTechSuite, and private-club-app too.

Do not:
- Treat the Sanity integration as blocked by code — env vars are present and `Episode.sanityId` exists in Prisma; it just needs a content-modeling session with Stephanie and a `lib/sanity.ts` client.
- Assume n8n is required for basic subscriptions — the Stripe webhook has a safe `if (!base) return` guard; payments and entitlements function without n8n running.

Recommended next moves:
1. Gabriel reviews the audit report and decides which provisioning chain to start first.
2. Unblocked first steps: Clerk and Supabase (no payment method required to start either).
3. Fix `NODE_ENV=production` in `.zshrc` — one line, wide project impact.


## 2026-07-16 — Claude → Next Agent / Gabriel (Chapter 13 ingestion)

Task completed:
- Ingested full text of current-manuscript Chapter 13, "Visions and Burdens… of Knowing," delivered by Gabriel via the `second-brain-kb` skill. Ran as a Fiction Studio Continuity pass — no manuscript prose touched, contradiction report + new article only.
- Confirmed the 20→27 chapter renumbering hypothesis: old Chapter 6 = current Chapter 13. New article: `wiki/craft-fiction/string-theory/chapter-13-visions-and-burdens.md`.
- Added Professor Garrin to `characters.md`; added research verification rows for Ch. 13's historical-science content (Newton/Maunder Minimum verified, du Châtelet's real *vis viva* physics, a deliberate Fraunhofer-lines anachronism, a Helmholtz/Chladni composite character).
- Flagged, but did not resolve, the resulting displacement of the old Chapter 13 ("Phenom de Guare") in `chapter-summaries.md`, `novel-structure.md`, `themes-and-canon.md`, and `current-manuscript-state.md`'s Continuity Flags table.

Live state:
The KB now correctly documents current-Chapter-13 in full detail. Old-numbering summaries (`chapter-summaries.md`, `novel-structure.md`) are still the only source for chapters other than 1 and 13 (old 6) — they remain useful as historical/approximate content but their position numbers above and below 13 are unverified against the current build.

Do not:
- Assume "Phenom de Guare" was cut. No evidence of a cut — only that its exact position is unconfirmed. Treat it as `[unverified position]`, not `[deleted]`.
- Re-derive the renumbering finding — it's settled by direct text comparison (title + form + full scene match), not inference.

Recommended next move:
1. If Gabriel delivers another chapter's full text (as with Ch. 13), run the same match-and-flag procedure — check it against both old-Ch.-summaries and any already-confirmed current-numbering articles before assuming it's new content.
2. When convenient, ask Gabriel directly which manuscript chapter now carries "Phenom de Guare" content, or request that chapter's manifest/text to confirm empirically the way this session did for Ch. 13.
3. Consider formally re-ingesting `chapter-summaries.md` and `novel-structure.md` against the full 27-chapter structure once enough individual chapters have been confirmed this way — task already exists as a Medium-priority item in `current-manuscript-state.md`'s Next Actions.


## 2026-07-16 (later) — Claude → Next Agent / Gabriel (Ch. 13 diagnosis + pipeline access finding)

Task completed:
- Ran a Fiction Studio Read/diagnosis pass on Chapter 13's full text (see `outputs/2026-07-16_chapter-13-fiction-studio-diagnosis.md`). Five findings delivered in-chat and logged; zero prose touched.
- Attempted Gate 0 verification of a suspected duplicated paragraph in Scene 2 against the canonical source.

New infrastructure finding: `Manuscript Masters/String Theory - Draft 6.7.txt` (the documented canonical prose source in `current-manuscript-state.md`) is a **Google Drive cloud-only placeholder on this machine** — `get_file_info` reports 15KB (far too small for 107k words), and `read_file` times out (ETIMEDOUT) rather than returning content. Content search across the whole Manuscript Masters folder also silently returned 0 matches with a permissions warning, which in hindsight was the same root cause, not a real negative result. Any future session attempting to verify exact prose against this path will hit the same wall until the file is set to "available offline" in Drive, or Gabriel supplies the text directly.

Confirmed instead, via direct web fetch: the duplicated block IS present in the live, published GitHub Pages export (`chapter-13-scene-02.html`, built 2026-07-11) — so the defect is real somewhere upstream of the public site, just not yet traceable to Pages vs. the export pipeline from here.

Do not:
- Treat the earlier "0 matches" search result as proof the duplication is absent from canonical source. It's an access failure, not a negative finding.
- Re-attempt reading that exact Drive path expecting different results until Gabriel confirms it's been made available offline.

Recommended next move:
1. Gabriel checks the Chapter 13 Scene 2 seam directly in Pages (true authoring master).
2. If confirmed a real duplication, Gabriel authorizes the draft mandate in the diagnosis output for a surgical fix.
3. Consider flagging this cloud-placeholder gap to `dev-infrastructure/manuscript-export-pipeline.md` as a standing verification limitation.
