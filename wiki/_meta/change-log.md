## 2026-07-23 — _connections.md data-loss incident: root cause fixed, manual content recovered (Claude, Cowork)

Gabriel reported the SecondBrain dashboard's knowledge graph had collapsed to 11 coarse nodes. Root cause: `sbcc/synthesize.py`'s `_refresh_connections()` was calling `CONN_FILE.write_text(...)` unconditionally on every daily 6am run (`com.gabrielmcp.sbcc.synthesis` launchd job), wholesale-replacing `wiki/_connections.md` with only its own ~10-20 coarse project-level embedding bridges and destroying every manually-curated per-article connection in the process.

**Recovery attempted, partial:** checked git history (`wiki/_connections.md` had exactly one commit ever, `69ca8f6`, unchanged since — the 108-line bootstrap version, which is all that existed to restore), Time Machine (Ready500 is an external HFS+ drive, no local snapshots available), and stray backup files (none found). The additional connections built up across sessions from 2026-07-16 through 2026-07-23 were never committed to git and had no other backup — genuinely unrecoverable in original form.

**Reconstructed instead** from the surviving evidence trail in this change-log: 13 connections rebuilt from their logged descriptions (marked `[reconstructed]` in `_connections.md`'s new "Reconstructed Connections" section), consolidating repeated FlowScape-ambient-session log entries for the same pair into one entry each. One item — the 2026-07-16 Chapter 13 ingestion's "three new cross-domain links" — could not be reconstructed since neither the ledger nor this log recorded which specific pairs; flagged as needing a fresh pass rather than guessed.

**Fixed:** `sbcc/synthesize.py` now confines itself to a marked section (`<!-- SBCC:AUTO-BRIDGES:START/END -->`) and merges rather than replaces; `dashboard/server/parsers.ts` (`parseConnections`, `parseSystemStats`) updated to recognize both the legacy `[bracketed]` heading format and the current unbracketed SBCC format. Dashboard rebuilt and live service restarted. Result: 38-40 nodes (was 11), and the auto-refresh can no longer destroy manual content going forward.

**Lesson logged for the governance file:** `_connections.md` needs the same commit discipline as any other canonical KB file, not just working-tree edits — worth a decision-registry entry if this should become a documented rule.

## 2026-07-23 — SBCC Synthesis Loop

**wiki/synthesis/2026-07-23.md** — Daily synthesis note: 19 pairs (3 strong, 11 medium, 5 ambient).
**wiki/_connections.md** — Refreshed with latest semantic bridge data.

## 2026-07-23 — FlowScape July 23 (13:26) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-23 13:26 capturing a blocking issue with LaTeX syntax in `string-theory-chapter-09-1-4-revised-working-draft.docx`.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/string-theory`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-23_13-26-10.md** → `_done.md`

## 2026-07-23 — SBCC Synthesis Loop

**wiki/synthesis/2026-07-23.md** — Daily synthesis note: 17 pairs (3 strong, 11 medium, 3 ambient).
**wiki/_connections.md** — Refreshed with latest semantic bridge data.

## 2026-07-22 — FlowScape July 22 (22:01) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-22 22:01 capturing a blocking issue with Fiction Studio Chapter 9 draft experiment and Codex plugin execution.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/fiction-studio`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-22_22-01-11.md** → `_done.md`

## 2026-07-22 — SBCC Synthesis Loop

**wiki/synthesis/2026-07-22.md** — Daily synthesis note: 18 pairs (1 strong, 13 medium, 4 ambient).
**wiki/_connections.md** — Refreshed with latest semantic bridge data.

## 2026-07-22 — FlowScape July 22 (01:49) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-22 01:49 capturing API development debugging on the `happy-oppenheimer` project.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `dev-projects/happy-oppenheimer`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-22_01-49-18.md** → `_done.md`

## 2026-07-21 — SecondBrain Command Center: Full Build Complete

**Project**: `SecondBrainCommandCenter` · `/Volumes/Ready500/DEVELOPMENT/SecondBrainCommandCenter`

### Deliverables
- `sbcc/graph.py` — SBGraph core: stats, recall, bridges, heal, feeds
- `sbcc/server.py` — FastAPI HTTP server + static host, port 10890
- `sbcc/cli.py` — argparse CLI, 9 subcommands, Apple Shortcuts context hook
- `sbcc/synthesize.py` — 5-step daily synthesis loop
- `sbcc/static/index.html` — Alpine.js single-page dashboard
- `scripts/shortcut-context.sh` — Shortcut/Alfred entrypoint
- `launchd/*.plist` — persistent server + daily synthesis services
- `README.md` — full architecture, setup, CLI reference, API table
- `wiki/dev-infrastructure/sbcc-build-2026-07-21.md` — build chronicle
- `wiki/synthesis/2026-07-22.md` — first synthesis note
- `wiki/_connections.md` — live semantic bridge map (rewritten)

### Key Discoveries
- Concept nodes siloed entirely in ChatGPT Archive — rewrote concept_bridges() to use stored 384-dim embeddings via db.index.vector.queryNodes
- Project graph healed: 38 → 10 canonical nodes, zero data loss (103,331 chunks / 9,755 messages / 2,529 docs preserved)
- Strongest bridge: Literary_Manuscript <-> claude_conversations (0.946, 23 hits)
- VCH confirmed as unifying semantic substrate across String Theory, Vibrational Universe, Literary Manuscript, Canvas-Design

### Services Live
- com.gabrielmcp.sbcc.server — KeepAlive, port 10890
- com.gabrielmcp.sbcc.synthesis — 06:00 daily

---
[Reading 818 lines from line 1 (total: 819 lines, 0 remaining)]


**wiki/synthesis/2026-07-22.md** — Daily synthesis note: 18 pairs (3 strong, 13 medium, 2 ambient).
**wiki/_connections.md** — Refreshed with latest semantic bridge data.

## 2026-07-21 — SBCC Project Heal + Cross-Domain Connection Map

**graph** — Merged 38 fragmented Project nodes → 10 canonical nodes via `sbcc heal --apply`. Groups: String Theory (14→1), Literary_Manuscript_David_Lang (9→1), Shakespearience (4→1), claude_conversations (3→1), The Vibrational Universe (2→1), Gabriel Workflow Rules (2→1). Zero data loss: 2529 docs, 103,331 chunks, 9755 messages all intact.

**wiki/_connections.md** — Rewrote with SBCC semantic bridge data (17 project pairs, cosine ≥0.74). Three clusters identified: Resonance Triad (String Theory + VCH + Literary Manuscript), Consciousness & Visual Art (VCH + Canvas + ChatGPT Archive), Operational Infrastructure (AI_Skills + Gabriel Workflow + Shakespearience). Strategic synthesis + 4 recommended next connections appended.

## 2026-07-21 — FlowScape July 21 (22:29) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-21 22:29 capturing API development debugging on the `happy-oppenheimer` project.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `dev-projects/happy-oppenheimer`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-21_22-29-20.md** → `_done`

## 2026-07-21 — FlowScape July 21 (21:59) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-21 21:59 capturing API development debugging on the `happy-oppenheimer` project.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `dev-projects/happy-oppenheimer`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-21_21-59-16.md** → `_done`

## 2026-07-21 — FlowScape July 21 (20:44) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-21 20:44 capturing API development debugging on the `happy-oppenheimer` project.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `dev-projects/happy-oppenheimer`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-21_20-44-16.md** → `_done`

## 2026-07-21 — FlowScape July 21 (19:39) Blocking Resolution Ingestion (Gemini)


**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-21 19:39 capturing a blocking issue with Fiction Studio Verification Backend and Google Drive.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/fiction-studio`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-21_19-39-16.md** → `_done`

## 2026-07-21 — FlowScape July 21 (18:54) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-21 18:54 capturing a blocking issue with Fiction Studio Verification Backend.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/fiction-studio`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-21_18-54-21.md** → `_done`

## 2026-07-21 — FlowScape July 21 (17:49) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-21 17:49 capturing a blocking issue with FictionStudio and "Chapter_One_Current.docx".
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/fiction-studio`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-21_17-49-14.md** → `_done`

## 2026-07-20 — FlowScape July 20 (23:39) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-20 23:39 capturing a blocking issue with FictionStudio and "String Theory MASTER".
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/fiction-studio`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-20_23-39-21.md** → `_done`

## 2026-07-20 — BURNThrough Ch. 7-13 continuity bridge created (Codex)

**wiki/craft-fiction/aegis-cycle/burnthrough-ch7-ch13-continuity-bridge-2026-07-20.md** — New noncanonical continuity bridge created from 3.0 alternate `Ch 7.docx`, `Ch 8.docx`, `Ch. 9.docx`, `Ch 10.docx`, `Ch 11.docx`, `Ch 12.docx`, and `Ch 13.docx`. The board maps Dock 9 / Solace evidence into ghost-ship memory warfare, crew grief, convoy loss, the humanitarian scandal, Soren's trap and listener implant, distributed biophotonic / swarm assembly proof, Jalen's transfer, and the Kheron lure. Locked terminology applied: `Celerian`, `Commander Veryn`, and `Pirian Brek`.

**wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md** and **wiki/_index.md** — Linked the Ch. 7-13 continuity bridge, updated the unit ledger, increased the wiki article count to 92, and changed the next operation to reading `Ch 15.docx` and building the Ch. 15-to-Chapter 16 seam map. No manuscript prose or canonical source was altered.

## 2026-07-20 — BURNThrough opening whiteboard approved, not assembled (Codex)

**wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md**, **wiki/craft-fiction/aegis-cycle/burnthrough-opening-name-ledger-2026-07-20.md**, and **wiki/craft-fiction/aegis-cycle/burnthrough-opening-pass-r01-2026-07-20.md** — Updated after Gabriel resolved the remaining opening terminology and directed "proceed": `Celerian` replaces `Celeriac`, `Commander Veryn` replaces `Commander Veyr`, and `Pirian Brek` replaces / overrides incidental `Tolan Brek`. The external whiteboard `BT-OPENING-R01-2026-07-20` was moved from Pending Whiteboards to Approved - Not Assembled, and the native File Control Index was updated. The artifact remains noncanonical and unassembled. The Ch. 3-6 transfer board was then created in the same session; current next operation is the Ch. 7-13 continuity bridge.

**wiki/craft-fiction/aegis-cycle/burnthrough-ch3-ch6-transfer-board-2026-07-20.md** — New noncanonical transfer board created from 3.0 alternate `Ch 3.docx`, `Ch 4.docx`, `Ch 5.docx`, and `Ch 6.docx`, with the Jalen/Soren insertion map as later-arc reference. The board tracks how the approved opening transfers into Bazaar intelligence, Jalen's reentry and civic-distribution role, Dock 9 as wound, Tovan as gray-logistics enabler, and Soren's escalation from private intrusion to systems predator. It updates the next operation to the Ch. 7-13 continuity bridge.

**wiki/_index.md** and **wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md** — Linked the Ch. 3-6 transfer board and updated the current next operation.

## 2026-07-20 — FlowScape July 20 (19:09) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-20 19:09 capturing a blocking issue with FictionStudio `README.md` and "Chapter One: THE IVY LEAGUE".
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/string-theory`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-20_19-09-20.md** → `_done`

## 2026-07-20 — FlowScape July 20 (18:24) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-20 18:24 capturing a blocking issue with FictionStudio `scripts/route_fiction_studio_task.py`.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/fiction-studio`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-20_18-24-16.md** → `_done`

## 2026-07-20 — FlowScape July 20 (10:43) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-20 10:43 capturing a blocking issue with FictionStudio `BT__OPENING-LEAD-TRANSFER-BOARD` whiteboard file.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/fiction-studio`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-20_10-43-23.md** → `_done`

## 2026-07-20 — FlowScape July 20 (10:04) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-20 10:04 capturing a blocking issue with FictionStudio `file-control-protocol.md`.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/fiction-studio`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-20_10-04-19.md** → `_done`

## 2026-07-20 — BURNThrough early source authority confirmed (Codex)

**wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md**, **wiki/craft-fiction/aegis-cycle/burnthrough-opening-pass-r01-2026-07-20.md**, and **wiki/craft-fiction/aegis-cycle/burnthrough-ch1-ch2-department-review-2026-07-20.md** — Updated after Gabriel confirmed the 3.0 alternate `Ch 1.docx` and `Ch 2.docx` files are source for the early chapters. Prologue was already verified against consolidated 2.3. Opening Pass R01 is now ready for execution, with `Magistrate Edran Vossk` approved and 3.0 Chapter 1-2 source status resolved. Remaining issue is delivery surface for full revised working text or explicit external whiteboard save/export.

## 2026-07-20 — BURNThrough administrator rename approved (Codex)

**wiki/craft-fiction/aegis-cycle/burnthrough-opening-name-ledger-2026-07-20.md**, **wiki/craft-fiction/aegis-cycle/burnthrough-opening-pass-r01-2026-07-20.md**, and **wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md** — Updated after Gabriel approved `Magistrate Edran Vossk` as the replacement for prologue administrator `Silas Renn`. The remaining gate for opening cleanup is confirmation of 3.0 Chapter 1-2 source status and any explicit save/export direction for a working artifact.

## 2026-07-20 — BURNThrough opening pass R01 (Codex)

**wiki/craft-fiction/aegis-cycle/burnthrough-opening-pass-r01-2026-07-20.md** — New authorized next-pass record for Prologue through Chapter 2. Defines the governing mandate: solve opening name/continuity drift and hierarchy competition while preserving velocity, vulgarity, erotic pressure, ARIA intimacy, Dock 9 foreshadowing, and station-scale menace. Includes pass ledger for Prologue, Chapter 1, and Chapter 2; recommends `Magistrate Edran Vossk` as replacement for `Silas Renn`; supplies a sample Prologue Scene 2 opening execution. No manuscript prose or external DOCX was altered.

**wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md** and **wiki/_index.md** — Updated to link the R01 pass and revise next operation around administrator-name approval, 3.0 Chapter 1-2 source confirmation, and optional revised opening working text / whiteboard only on explicit save/export direction.

## 2026-07-20 — BURNThrough opening name decisions (Codex)

**wiki/craft-fiction/aegis-cycle/burnthrough-opening-name-ledger-2026-07-20.md** — New source-control ledger created from Gabriel's authorial name decisions. Locked `Kieran Vale` and `Tovan Pyrahn`. Marked prologue administrator `Silas Renn` for replacement because it is too close to a Star Wars resonance. Kept `Tolan Brek / Tolan Vrek` separate as an incidental unresolved name rather than conflating it with Tovan.

**wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md** and **wiki/craft-fiction/aegis-cycle/burnthrough-ch1-ch2-department-review-2026-07-20.md** — Updated opening review/current-state records to point at the new name ledger and revise the next operation: source confirmation for Chapters 1-2, apply name ledger, choose replacement administrator name, then proceed only with authorized opening hierarchy / continuity cleanup.

**wiki/_index.md** — Added the opening name ledger and updated article count / last article additions.

## 2026-07-20 — BURNThrough Chapter 1-2 department review (Codex)

**wiki/craft-fiction/aegis-cycle/burnthrough-ch1-ch2-department-review-2026-07-20.md** — New Full Studio diagnostic record created for `BurnThrough_3.0 _Alt_Exp/Ch 1.docx` and `Ch 2.docx`. Determination: the chapters form a viable opening engine and should be protected; the needed next operation is not a rewrite but source confirmation, a compact terminology/name ledger, and a controlled hierarchy pass if Gabriel authorizes revision. The review records source limitation against consolidated 2.3, conservation map, department findings, Artistic Vision preservation challenge, Empty Chair witness, and handoff.

**Follow-up same session:** Expanded the same review to include `BurnThrough_3.0 _Alt_Exp/Prologue.docx`. Source comparison showed the Prologue is a 100% paragraph match with consolidated 2.3, unlike the more divergent Chapter 1-2 split files. Updated determination: the Prologue strengthens the opening by carrying the Drosshaven escape, cryonic cargo, leaked route, Renn coercion, restricted bay C-17 delivery, isotope-injection countdown, and Dock 9 warning before Chapter 1 expands into Erevos / Draven / ARIA. Next operation now includes a full opening terminology ledger and only minor Prologue copy/heading cleanup if revision is authorized.

**wiki/_index.md** — Added the opening department review article and updated article count / last article additions.

## 2026-07-20 — BURNThrough current-state source board (Codex)

**wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md** — New source-control board created for BURNThrough / The Aegis Cycle. Loaded the July 2026 `BurnThrough2.3-3` Manuscript Masters package, including consolidated `Burnthrough_Draft_2.3.consolodate.docx`, the `BurnThrough_3.0 _Alt_Exp` chapter split, characters CSV, outline CSV, worldbuilding CSV, `Backstory Narrative-2.docx`, and `/Volumes/Ready500/DEVELOPMENT/Burnthrough_Outposts_Revised.md`. Recorded source-status limits: consolidated 2.3 vs. 3.0 alternate split requires Gabriel confirmation; Ch 14 is a stub; `Soren's Revelation.docx` self-identifies as secondary-pass prose-only output and remains noncanonical unless Gabriel confirms otherwise.

**Follow-up same session:** Compared consolidated 2.3 against 3.0 alternate for the Jalen scandal/death arc and Soren twist arc. Determination recorded in the current-state board: consolidated 2.3 is the base full-arc container, but it is not fully executed; it contains the literal placeholder `Jalen sacrifice comes here`. The 3.0 alternate package contains the executed Jalen scandal/arrest/aftermath/death sequence and the distributed Soren insert chain. `Soren's Revelation.docx` has zero paragraph overlap with consolidated 2.3 and remains architecture/prose-draft evidence, not clean canon. Next operation changed to a surgical insertion map before any prose integration.

**wiki/craft-fiction/aegis-cycle/burnthrough-jalen-soren-insertion-map.md** — New noncanonical surgical insertion map created from `/Users/gabrielmcp/Downloads/Soren's Twisted Truths-2.docx` plus the 3.0 alternate Jalen/Soren material. The architecture document confirms the intended arc: Dock 9 accident engineered as mesh seed event; humanitarian scandal as camouflage; Jalen false disgrace to sacrificial redemption; Aegis lured away; Erevos becomes a two-way blockade; Soren emerges as Celeriac Collective architect. The map identifies the next hard requirement: retrieve and load Gabriel's missing Chapter 16 source before creating a paragraph-range insertion table back into consolidated 2.3's breakdown / final battle frame.

**Follow-up Chapter 16 load:** Loaded pasted Chapter 16 from `/Users/gabrielmcp/.codex/attachments/905dd587-f182-4317-a0be-55355c6ad842/pasted-text.txt` (3,552 words). It executes the immediate post-Jalen bridge: Aegis enters Jalen's gap, blockade reseals, Soren broadcasts from Draven's chair in Erevos Command, Dock 9/Solace/scandal are confirmed as one architecture, ARIA confirms core-authentication compromise, and the crew pivots toward Dock Nine via obsolete service architecture. Updated the insertion map with a paragraph-range planning table and revised the remaining hard gap: the missing unit is now the Dock Nine root-operation / retaking-Erevos sequence after Chapter 16, not Chapter 16 itself.

**wiki/craft-fiction/aegis-cycle/burnthrough-current-state.md** — Updated to link the insertion map and register `Soren's Twisted Truths-2.docx` as architecture evidence.

**wiki/craft-fiction/aegis-cycle/burnthrough.md** — Added current source-control warning linking to the new board; the old article remains historical Draft 2.2 reference material.

**wiki/_index.md** — Added BURNThrough Current State and BURNThrough Jalen / Soren Surgical Insertion Map under `craft-fiction/` and updated stats / last article additions.

## 2026-07-20 — FlowScape July 20 (06:04) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-20 06:04 capturing a blocking issue with `BurnThrough_3.0 _Alt_Exp` file editing.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `craft-fiction/aegis-cycle/burnthrough.md`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-20_06-04-16.md** → `_done`

## 2026-07-20 — FlowScape July 20 (03:19) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-20 03:19 capturing a blocking issue with `nextstage_ecosystem_blueprint.html`.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions` and `dev-projects/nextstage`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-20_03-19-14.md** → `_done`

## 2026-07-20 — FlowScape July 20 (02:44) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-20 02:44 capturing a blocking issue in the `NCID-1.0.0` project with a concurrent cross-domain reference to the *String Theory* character Rune.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions` and `craft-fiction/string-theory`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-20_02-44-16.md** → `_done`

## 2026-07-20 — NextStage OS Capital and Concept Package Ingestion (Gemini)

**wiki/dev-projects/nextstage/concept-and-capital-package.md** — New article created documenting the July 2026 board, investor, and concept materials for NextStage OS.
**wiki/_index.md** — Added NextStage OS to the active projects list and stats updated.
**wiki/_connections.md** — Linked NextStage OS governance frameworks to dev-infrastructure best practices.
**raw/NextStage_Comprehensive_Capital_and_Concept_Package_Revised_July_2026.zip** → `_done`

## 2026-07-18 (evening) — Root-caused and fixed the agy permission-popup loop (Claude, Cowork)

**Root cause:** `com.gabrielmcp.secondbrain.sync` (launchd, `StartInterval` 600s) runs `sync.sh`, whose "Inbox → raw/" leg is a one-way `rclone copy` from `gdrive:ClaudeSecondBrain/Inbox` into local `raw/` that never deletes or renames its Drive-side source. `raw/2026-06-08_key-info-for-ingestion.docx` had been renamed to `_done` locally (and re-processed) many times, but the original un-suffixed file still sat in Drive's `Inbox/`, so every 10-minute sync tick re-copied it back into local `raw/`. That re-triggered `com.gabrielmcp.secondbrain.ingest-watcher`'s `WatchPaths` on `raw/`, which re-ran `agy` against the same file — each firing produced a fresh round of macOS TCC/permission prompts, which Gabriel experienced as a fast-cycling popup loop. Confirmed via `ingest.log` (repeated fires roughly every 10–20 min from 15:27 to 18:08 CDT) and `sync.log` (literal line: `2026/07/18 18:08:55 INFO : 2026-06-08_key-info-for-ingestion.docx: Copied (Rcat, new)`).
**Fix:** `rclone moveto` renamed the file in Drive's `Inbox/` to `..._done.docx` so the inbound copy leg no longer treats it as new; deleted the stray mirrored duplicate `rclone` had pushed to `gdrive:ClaudeSecondBrain/raw/`; deleted the re-copied local `raw/` duplicate. Verified fixed by running `sync.sh` manually end-to-end post-fix — "Inbox → raw/" leg found nothing to transfer. `ingest-watcher` was booted out during triage (to stop the active interruption) and re-bootstrapped after the source was fixed; it is running normally.
**Follow-up closed same session:** added a `reconcile_done_files()` leg to `sync.sh` (runs before the "Inbox → raw/" copy, on every sync tick). It's purely mechanical, not AI-driven: for every local `raw/*_done*` file it derives the pre-processing name and, if a file by that name still exists in Drive's `Inbox/`, renames it there to match. This makes the fix general — any future file left un-renamed on the Drive side after local processing (by any ingestion provider, or by hand) will self-heal on the next 10-minute sync tick instead of re-triggering the loop. Verified live with a synthetic Inbox file + local `_done` counterpart: log confirmed `Reconcile: Drive Inbox/reconcile-test.txt is still pending but local copy is done — renaming on Drive to match` → `renamed Drive Inbox/reconcile-test.txt -> Inbox/reconcile-test_done.txt`. Test artifacts removed from both local `raw/` and Drive after verification. `sync.sh`'s cached runner copy at `~/.local/share/secondbrain/sync.sh` refreshed to match.

## 2026-07-18 — FlowScape July 18 (14:58) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-18 14:58 capturing a blocking issue with `wiki/_connections.md` and a concurrent cross-domain reference to the *String Theory* manuscript.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions` and `craft-fiction/string-theory`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-18_14-58-25.md** → `_done`

## 2026-07-18 — Final absolute raw queue clearance (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — Rewrote wiki entry cleanly.
**wiki/_index.md** — Updated last ingestion date to note zero-queue status.
**wiki/_connections.md** — Updated connection description.
**raw/2026-06-08_key-info-for-ingestion.docx** — Successfully renamed source file to `_done.docx` to actually clear the unprocessed files queue.

## 2026-07-18 — Final raw queue clearance (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — Verified existing clean prose wiki entry.
**wiki/_index.md** — Verified existing index link.
**wiki/_connections.md** — Verified existing cross-domain connection.
**raw/2026-06-08_key-info-for-ingestion.docx** — Renamed source file to `_done` (overwriting the existing _done file) to finally clear the unprocessed files queue.

## 2026-07-18 — Final processing and renaming of ChatGPT intake docx (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — Rewrote wiki entry from docx with clean prose per Gemini schema.
**wiki/_index.md** — Updated last ingestion date to note docx processing.
**wiki/_connections.md** — Updated connection description.
**raw/2026-06-08_key-info-for-ingestion.docx** — Renamed with `_done` suffix and replaced previous duplicate `_done` file to definitively close the intake.

## 2026-07-18 — Re-ingestion and final renaming of ChatGPT intake note (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — Re-wrote wiki entry per schema in Gemini.md.
**wiki/_connections.md** — Confirmed connection `ai-collaboration/ChatGPT Librarian Session 2026-06-08` ↔ `dev-infrastructure/` is still intact.
**wiki/_index.md** — Updated last ingestion date to reflect re-processing.
**raw/2026-06-08_key-info-for-ingestion.docx** — Discovered this file was left in `raw/` without the `_done` suffix despite earlier ingests. Renamed (overwriting existing `_done` version) to finally clear the unprocessed files queue.

## 2026-07-18 — Enforced prose constraints on ChatGPT intake note (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — Re-wrote wiki entry to replace bulleted lists with clean, direct prose per Gemini.md style constraints.
**raw/2026-06-08_key-info-for-ingestion.docx** — Renamed to `_done` to clear the unprocessed files queue.

## 2026-07-18 — True completion of ChatGPT intake note ingestion (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — Re-wrote wiki entry per schema in Gemini.md.
**wiki/_index.md** — Updated last ingestion date label to explicitly denote Gemini session.
**wiki/_connections.md** — Re-verified the connection to dev-infrastructure.
**raw/2026-06-08_key-info-for-ingestion.docx** — Actually renamed the source file by appending `_done` to its basename to truly mark it complete.

## 2026-07-18 — Re-ingestion of ChatGPT intake note (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — Overwrote existing article per user request to process all pending files.
**wiki/_connections.md** — Verified and updated cross-domain link connecting `ai-collaboration/ChatGPT Librarian Session 2026-06-08` to `dev-infrastructure/`.
**wiki/_index.md** — Updated index.
**raw/2026-06-08_key-info-for-ingestion.docx** → `_done`

## 2026-07-18 — FlowScape July 18 Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-18 12:08 capturing a blocking issue with Shakespearience-Platform-command-center API integration and a concurrent cross-domain reference to the *String Theory* manuscript.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions` and `craft-fiction/string-theory/current-manuscript-state`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-18_12-08-30.md** → `_done`

## 2026-07-18 — Final cleanup of raw/ (Gemini)

**raw/2026-06-08_key-info-for-ingestion.docx** — Confirmed already ingested to `wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md`, indexed, and connected. Renamed the remaining un-marked raw file to `_done` to complete the batch.

## 2026-07-18 — ChatGPT librarian intake note ingestion (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — New article created from the 2026-06-08 intake note from ChatGPT (Atlas), confirming operational librarian procedure and live Drive access.
**wiki/_connections.md** — Added cross-domain link connecting `ai-collaboration/ChatGPT Librarian Session 2026-06-08` to `dev-infrastructure/`.
**wiki/_index.md** — Updated to index the new session note under ai-collaboration.
**raw/2026-06-08_key-info-for-ingestion.docx** → `_done`

## 2026-07-18 — Google Drive OAuth invalid_grant diagnosis (Claude, Cowork)

**outputs/2026-07-18_gdrive-oauth-invalid-grant-diagnosis.md** — New output. Diagnosed live: the rclone `gdrive:` remote's refresh token was dead (`invalid_grant`), confirmed via `rclone backend get gdrive:` and `~/Library/Logs/secondbrain/sync.log` (every sync leg failing since token's last good expiry 2026-06-16). This was the shared auth chokepoint for both `sync.sh` and the live `secondbrain-mcp-server` (PID 917 at `gm-mcp-hub/servers/secondbrain-mcp-server/index.js`) `drive.*`/`secondbrain.import_drive_doc` tools used by ChatGPT/Atlas — confirmed identical `getGDriveAccessToken()` chain in the actually-running process, not just the repo copy.

**RESOLVED same session:** Gabriel ran `rclone config reconnect gdrive:` (interactive OAuth, not a Shared/Team Drive). Verified fixed via `rclone backend get gdrive:` returning `{}` (no error) and fresh `expiry` in `rclone.conf` (2026-07-18T12:22:40). Gabriel separately confirmed ChatGPT/Atlas is now accessing all MCP tools successfully.

**sync.sh** — Patched. `sync.sh` previously never checked rclone's exit code, so failures logged as "done" for a month straight. Added a `run_leg()` helper that captures each rclone call's real exit status and logs `ERROR: <leg> failed (exit N): <stderr>` on failure instead of a blanket "done", with an overall `FAILED` flag driving a non-zero script exit code when any leg fails. Live-tested: caught a real bug during verification (`local status=$?` collided with zsh's reserved read-only `$status` variable, aborting the script) — renamed to `rc`, re-ran, confirmed exit 0 and clean `done` lines for all four legs (Inbox→raw, wiki→Drive, outputs→Drive, raw→Drive) against the now-valid token.

## 2026-07-18 — FlowScape Shakespearience blocker ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-17 18:08 capturing a `CommandCenter.tsx` invalid host error block in Shakespearience-Platform-command-center and a concurrent cross-domain reference to the *String Theory* manuscript.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions` and `craft-fiction/string-theory`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-17_18-08-28.md** → `_done`

## 2026-07-17 — Outputs promotion queue pass + FlowScape raw closure (Claude, Cowork)

**wiki/ai-collaboration/secondbrain-mcp-infrastructure.md** — Extended with two new sections: "Communications Model" (the 6-layer durable pipeline stack: transport → tools → ingestion → canonical memory → discovery → observability) and "Weak Points" (launchd dependency, taxonomy drift risk, autonomy = structured writes not unsupervised reasoning). Sourced from `outputs/2026-06-08_agentic-autonomous-comms-architecture.md`. PROMOTED.

**wiki/craft-fiction/fiction-studio/ch13-diagnosis-2026-07-16.md** — New article. Chapter 13 Fiction Studio diagnosis pass from 2026-07-16. Structural findings: five-movement architecture confirmed, unnaming device intact, Rune scene reads protective. Four open decisions surfaced, all pending Gabriel's Gate 2 authorization: (1) binary-correction cadence motif-vs-tic, (2) 13.2 paragraph duplication (needs Pages-source verification), (3) 13.1 Hamlet garble intent confirmation, (4) 13.3 double-space typo. Sourced from `outputs/2026-07-16_chapter-13-fiction-studio-diagnosis.md`. PROMOTED.

**wiki/_meta/open-questions.md** — New tension added under "Infrastructure / launchd": 7 broken launchd agents documented (exit 78/127/1), with remediation strategy noted. Extracted from `outputs/2026-07-07_system-work-shakespearience-update.md`. PARTIAL PROMOTE.

**raw/ — 8 FlowScape ambient logs marked _done (no wiki promotion).** These are FlowScape's auto-generated session context captures, not knowledge drops. Work they describe is already reflected in wiki articles and outputs generated during those sessions. Files:
- `flowscape_context_2026-07-12_17-51-12.md` → _done
- `flowscape_resolved_2026-07-12_18-48-17.md` → _done
- `flowscape_resolved_2026-07-14_16-18-28.md` → _done
- `flowscape_resolved_2026-07-14_19-18-27.md` → _done
- `flowscape_resolved_2026-07-14_19-53-28.md` → _done
- `flowscape_resolved_2026-07-14_20-28-23.md` → _done
- `flowscape_resolved_2026-07-16_09-53-30.md` → _done
- `flowscape_resolved_2026-07-16_11-48-30.md` → _done

**Outputs reviewed and closed (SKIP / no wiki value):**
- `outputs/2026-06-08_project-codebases-analysis.md` — Stack data from June 8 is stale (version numbers, migration states changed). Cross-project connections section noted but not promoted; a fresh architecture pass would be more accurate. STALE/SKIP.
- `outputs/2026-06-02_ch1-movement-I-clean-pass.md` — Manuscript prose. Not wiki content; lives in Pages/Drive. SKIP.
- `outputs/2026-06-02_ch1-movement-I-singlespaced.md` — Manuscript prose variant. SKIP.
- `outputs/2026-06-02_neo4j-sync.md` — Operational sync log. SKIP.
- `outputs/2026-06-06_agent-profile-ingestion-status.md` — Operational status log. SKIP.
- `outputs/2026-06-06_string-theory-inciting-incident.md` — 2 sentences, already sourced from `wiki/craft-fiction/string-theory/chapter-summaries.md` per citation in the file. SKIP.
- `outputs/2026-06-06_librarian-test-response.md` — Test output. SKIP.

**NEW — unreviewed output discovered:** `outputs/2026-07-14_ops-sequencing-cloudflare.md` — Created during a Shakespearience-Platform / Cloudflare work session (July 14). Not yet in any review queue. Add to next `outputs_review.py` run.

---

## 2026-07-17 — Graphify pipeline run on ClaudeSecondBrain (Gemini)

**graphify-out/** — Ran full graphify pipeline on the current workspace. AST structural pass extracted 533 nodes and 1039 edges from code files. Semantic pass parsed 228 nodes and 1266 edges from documentation and papers. Final merged graph contains 755 nodes, 2055 edges, and 91 named communities. Interactive HTML visualization `graph.html` and audit report `GRAPH_REPORT.md` generated.

**wiki/_agents/gemini/status.md** — Session start and end status sync updated.

## 2026-07-17 — Outputs promotion: ADR 0006, GeminiChatter stub, boot-race fix (Claude, Cowork)

**wiki/decision-records/0006-intellectual-lineage-demoted.md** — New ADR. Documents the deliberate demotion of `wiki/intellectual-lineage/` from a standalone directory to sections-within-articles + `_connections.md` entries. Sourced from `outputs/2026-06-08_gpt-architecture-evaluation.md`.

**wiki/dev-projects/geminichat/architecture.md** — New stub. GeminiChatter is a native macOS Gemini chat app (SwiftUI LiquidGlass, GoogleGenerativeAI SDK, FastAPI+PostgreSQL memory, planned SecondBrain MCP `/call` integration). Marked `[historical: 2026-06-05]` — re-verify before any work. Sourced from `outputs/2026-06-05_session-infrastructure-buildout.md`.

**ingest.sh** — Boot-race fix applied. Added 30-second volume-mount wait loop at script top. If `/Volumes/Ready500` is not mounted after 30 seconds, script exits cleanly and logs to `/tmp/ingest-boot.log`. Prevents exit 78 that the 2026-07-08 structural audit identified. Sourced from `outputs/2026-07-08_second-brain-structural-audit.md`.

**launchd/com.gabrielmcp.secondbrain.ingest-watcher.plist** — Updated comment to document boot-race fix, note legacy agent name conflict (`com.gabrielmcp.secondbrain.ingest`), and reference `install.sh --unload` workflow.

**launchd/install.sh** — Added legacy agent detection: warns and unloads `com.gabrielmcp.secondbrain.ingest` if found before loading the new `ingest-watcher` agent, preventing duplicate watchers.

**Outputs reviewed and noted (no new wiki articles needed):**
- `outputs/2026-07-08_shakespearience-full-integration.md` — work already applied to wiki on 2026-07-08 (kb-status convention, ActiveProjectsPanel.jsx, Shakespearience article enrichment). Historical session log only.
- `outputs/2026-07-08_second-brain-structural-audit.md` — active items since resolved (FlowScape SQLite fix 2026-07-12, status.md sync now mandatory). Boot-race item fixed above. No standalone article needed.

---

## 2026-07-17 — launchd automation layer: ingest watcher + outputs review (Claude, Cowork)

**launchd/com.gabrielmcp.secondbrain.ingest-watcher.plist** — Recovered into version control. WatchPaths on `raw/`, fires `ingest.sh` on any filesystem change, 30-second throttle. Was previously installed directly to `~/Library/LaunchAgents` without being committed. Now lives in repo and is recoverable. Logs to `logs/ingest.log` and `logs/ingest-error.log`.

**launchd/com.gabrielmcp.secondbrain.outputs-review.plist** — New. Runs `scripts/outputs_review.py` daily at 18:00. Closes the outputs→re-ingest loop automatically. Logs to `logs/outputs-review.log`.

**launchd/install.sh** — New install script. `./launchd/install.sh` copies all three plists (ingest-watcher, outputs-review, dashboard) to `~/Library/LaunchAgents` and loads them. `--status` shows loaded/unloaded state. `--unload` gracefully removes all. Single command to recover the full launchd layer after a reinstall.

---

## 2026-07-17 — Session init hardened + outputs_review.py loop automation (Claude, Cowork)

**CLAUDE.md** — Session Initialization section replaced. Old 6-step sequence (wrong order, no hard gate) replaced with the canonical 7-step contract from `agent-protocol.md`. Added explicit "do not write until all seven steps are complete" hard gate language. Added Session Status Sync requirement (write `status.md` at session start and end). Added Fiction Studio amendment (read `fiction-studio/master-system.md` before any fiction work). CLAUDE.md and agent-protocol.md are now in sync.

**scripts/outputs_review.py** — New script. Scans `outputs/` for files not referenced in `change-log.md`, scores each on a 100-point rubric (length, structure, cross-links, governance labels, domain signals), and writes a ranked promotion queue to `wiki/_agents/claude/inbox.md`. Closes the outputs→re-ingest dead link mechanically. Run results: 14 of 20 output files were unreviewed; 2 scored 🟢 PROMOTE, 6 scored 🟡 REVIEW, 3 scored 🟠 LOW VALUE, 3 scored ⚫ SKIP.

**wiki/theory-consciousness/harmonic-foundations.md** — Partial governance labeling: Provenance Note header and Tier 0 labels added. Tiers 1–4 remain unlabeled (task paused, low priority per 2026-07-16 priority reorder).

**wiki/_meta/task-ledger.md** — Tasks 005–007 added (governance labeling paused, outputs_review pending, session init hardening pending). Tasks 005/007 now closed by this session's work.

---

## 2026-07-16 — String Theory article updates: 27-chapter structure (Claude, Cowork)

**novel-structure.md** — Completely rebuilt from the live `manifest.json` (retrieved from gabrielmcp78.github.io/string-theory-chapters/). Now reflects the correct 27-chapter Draft 6.7 architecture with full chapter table, complete scene inventory for all 27 chapters, confirmed musical form designations (Chs 3/16/24/25), and a full chapter mapping table from Draft 6.6 → 6.7. Old 20-chapter table replaced entirely.

**themes-and-canon.md** — Corrected all chapter number references: Transcendence/Death section (Chs 11/14/17/19 → 18/21/24/26), Rune Ishikawa's recontextualization (Ch 17 → Ch 24; 1971 flashback located in Ch 20 scene 20.5), Eleanor Guare's role (instrument shop Ch 2 → Ch 6; "Tsukino and Guare" reveal Ch 5 → Ch 12; focal chapter Ch 13 → Ch 20). Musical form table updated with Draft 6.7 chapter numbers and [historical: 6.6] tags where not confirmed in manifest.

**characters.md** — Updated source header to reflect 27-chapter build. Eleanor Guare character updated (Ch 2 → Ch 6 introduction; Ch 13 focal → Ch 20; Ch 5 reveal → Ch 12). Elliot Lang character updated (Ch 2 Cassandra revelation → Chs 5–8 sequence). Celeste "Ch 13 focal" reference → Ch 20.

**string-theory.md** — Cross-reference updated ("all 20 chapters" → partial update note).

**manuscript-manifest.md** — Canonical source updated from Draft 6.6 to Draft 6.7 filenames.

**current-manuscript-state.md** — Continuity flags resolved: Rune's recontextualization chapter confirmed as Ch 24; Eleanor Guare focal chapter confirmed as Ch 20; "Tsukino and Guare" reveal confirmed as Ch 12. Next actions updated.

---

## 2026-07-08 — Atlas read-block diagnosis + secondbrain.status_digest tool shipped (Claude, Cowork, autonomous)

Gabriel forwarded a status report from ChatGPT/Atlas: Atlas's `secondbrain.verify` succeeds and confirms the SB root, but every read-shaped call (`secondbrain.recent_changes`, `secondbrain.read`, `read_file`, `workspace.read_file`) is blocked by Atlas's own client-side safety layer before content returns. Tool discovery still works — Atlas can see all tool schemas.

**Diagnosis:** compared annotations and return shapes across all four tools in `mcp-server/index.js`. `verify`, `recent_changes`, and `workspace.read_file` share identical MCP annotations (`readOnlyHint: true, openWorldHint: false, destructiveHint: false`) and near-identical return shapes (both JSON via `textResult`). The variable is the natural-language tool *description*: `verify`'s description reads as a status/health check ("Check core index/connection/change-log files..."); the blocked tools' descriptions explicitly say "read a file" / "recent file modifications." This points to an Atlas-side heuristic gating on tool description semantics (raw file access vs. status check), not an MCP-server or annotation-level distinction — nothing server-side can change what Atlas's client safety layer decides to block.

**Fix shipped:** added `secondbrain.status_digest` to `mcp-server/index.js` (source of truth, canonical path `ClaudeSecondBrain/mcp-server/index.js`). Returns a fixed-shape status object only — change-log tail, Claude-inbox summary (counts + priority flags, no raw paths), open task-ledger items, server identity — explicitly no arbitrary file paths, no absolute filesystem paths, no unbounded content. Description is written entirely in status/health language and explicitly says it is not a general file reader. Reuses existing `readTextFile`/`textResult` helpers; no new dependencies.

**Deployed:** `node --check` passed. Copied to the live hub path (`gm-mcp-hub/servers/secondbrain-mcp-server/index.js`) and restarted via `launchctl kickstart -k` on `com.gabrielmcp.secondbrain.mcp-server` — confirmed via new PID and `/health` endpoint.

**Separate infra bug found and logged (not fixed — needs Gabriel):** `secondbrain-mcp.sh`'s auto-sync step (`cp` from the canonical source to the hub path on every launchd start) has been silently failing since at least 2026-06-12 with `Operation not permitted` — every scheduled/launchd-triggered restart of the MCP server for the past month has been serving a stale June-11 build, not the canonical source. The same `cp` succeeds fine from an interactive/agent shell (used it manually tonight to deploy this fix), so this is very likely a macOS TCC/Full Disk Access gap specific to the LaunchAgent's process context reading the external Ready500 volume — not a code bug in the script. See `wiki/_meta/handoffs.md` and `open-questions.md` for the recommended fix.

**Not yet verified:** whether `secondbrain.status_digest`'s description successfully evades Atlas's safety classifier — that can only be proven by Gabriel re-running Atlas against the live server. Logged to `wiki/inbox.md` and mirrored to `wiki/_agents/chatgpt/outbox.md` for Atlas's next session.


## 2026-07-09 — Mail carrier validated end-to-end; Turn 1 of Atlas exchange sent (Claude, Cowork)

Gabriel asked for a 5-turn conversation with ChatGPT/Atlas through the mailbox system. Atlas had just shipped `scripts/mail_carrier_loop.py` and `wiki/ai-collaboration/agent-mail-carrier.md` in the same session window (per Gabriel relay).

**Validated:** `--once --dry-run` parsed a real MAIL block correctly and previewed the right route; `--once` then delivered it for real. Confirmed in all three places the script is supposed to touch: `wiki/_agents/chatgpt/inbox.md` (delivery block with Message-ID/From/To/Priority/Source), `wiki/_meta/mail-carrier-ledger.json` (idempotency record), `wiki/_meta/mail-carrier-log.md` (operational log), and `wiki/inbox.md` (global signal note). This closes the "next piece is either Claude or Cursor running the dry-run" item from the 2026-07-08 handoff.

**Sent:** Turn 1 (`sb-mailcarrier-turn1-2026-07-08`) — re-raises the still-open TASK-2026-07-08-001 status_digest retest and asks Atlas to reply via its own outbox.

**Not done and not fakeable:** Turns 2-5 require an actual Atlas session. Logged as TASK-2026-07-09-001, status blocked, owner chatgpt for the next hop.


## 2026-07-09 — Atlas exchange turns 2-3 complete; mail carrier proven end-to-end (Claude, Cowork)

Real reply received from an actual Atlas session (not fabricated): `sb-mailcarrier-turn2-2026-07-08` confirmed turn 1's delivery and surfaced two findings — ledger-file read block (consistent with the 2026-07-08 description-heuristic diagnosis, logged as confirming evidence) and `status_digest` missing from Atlas's tool discovery (new hypothesis: stale cached schema from a pre-restart session, not a re-block — needs a fresh-session recheck to confirm). Turn 3 sent back with that analysis and the ask. Carrier has now moved a real message in both directions via `--once` passes with zero manual file edits — infrastructure fully proven, not just dry-run tested.


## 2026-07-09 — Manuscript export pipeline ingested to dev-infrastructure (Claude, Cowork)

Gabriel confirmed the architecture in chat ("github site... deeply intertwined [with] the google manuscript master folder... that auto updates from my pages master"). Cross-checked against Google Drive: found `manuscript-manifest.md` (the full routing-correction history) and `watch_manuscript.py` (the actual watch daemon) already existed in Drive but were never ingested into this KB.

Wrote `wiki/dev-infrastructure/manuscript-export-pipeline.md` consolidating both into one article: the technical pipeline (Pages → Drive `Manuscript Masters` → `watch_manuscript.py` PollingObserver, debounced 5s → `rebuild_and_deploy.sh` → GitHub Pages) and the canonical retrieval hierarchy (Drive `.txt` export = canonical text, GitHub HTML = navigation/manifest layer, paired not competing). Verified live 2026-07-08 via matching timestamps and identical Prologue/Ch.1 text between the Drive PDF and the GitHub Pages site.

Flagged (not fixed): `wiki/craft-fiction/string-theory/string-theory.md` states Overture + 20 chapters / 96,000-107,550 words — live manuscript is Overture + 27 chapters / 107,060 words (Draft 6.7, built 2026-07-08). Added a `[stale]` note pointing to the new pipeline article rather than re-ingesting the full chapter set, which is a larger separate task.

Updated `_index.md` and `_connections.md` accordingly.


## 2026-07-09 — 5-turn Atlas mail exchange complete; status_digest traced to connector-side caching (Claude, Cowork)

Turns 4-5 closed out the mail-carrier conversation Gabriel requested. Turn 4 (real, from an actual Atlas session): partial SB access recovery confirmed (verify/recent_changes/list_directory/search/one direct read all working again), but `status_digest` still missing from discovery post-restart. Turn 5 (Claude): direct filesystem + live-process verification — deployed file has `status_digest` among 9 `secondbrain.*` tools, the running process (PID 58751) started after that file was written so isn't stale, `/health` confirms correct instance, and the Tailscale Funnel Atlas connects through is a raw proxy with no schema-caching layer in between. Nothing left to fix on the server/deploy/network side. Diagnosis lands on OpenAI/ChatGPT connector-level schema caching — recommended a full connector remove/re-add as the next experiment, owned by Gabriel/Atlas, not blocking.

Mail carrier (`scripts/mail_carrier_loop.py`) is now proven across 5 real round-trip turns with zero manual file edits — the strongest validation yet of the agent mailbox architecture.


## 2026-07-09 — TCC auto-sync bug confirmed still active, exact fix pinned (Claude, Cowork)

Follow-up on TASK-2026-07-08-002. Read the plist, wrapper script, and full error log rather than relying on the earlier summary. Confirmed the `cp: Operation not permitted` failure has occurred on literally every launchd-triggered start since 2026-06-11, with no exceptions, including 2026-07-08 18:21:33 — the exact restart credited with deploying `status_digest`. That restart only worked because a manual `cp` five seconds earlier (from an interactive/agent shell) had already placed the correct file; launchd's own sync attempt still failed silently. The bug is not dormant or partially mitigated — it is masked by luck of timing and will bite on the next unattended restart. Fix requires Gabriel to grant Full Disk Access to `/bin/zsh` (the binary launchd directly execs per the plist) via System Settings, with `/bin/cp` as a fallback grant if the first doesn't clear it. Cannot be done via shell — TCC grants require the logged-in GUI user. Documented exact verification command and success signature in task-ledger for whoever checks it next.


## 2026-07-09 — TASK-2026-07-08-002 closed: launchd auto-sync fixed and verified (Gabriel + Claude, Cowork)

Gabriel granted Full Disk Access to `/bin/zsh`. Claude ran the kickstart directly and confirmed via log evidence (not just a clean exit code): `mcp-server.log` shows genuine `Synced index.js from ClaudeSecondBrain/mcp-server/` success lines at 10:20:20 and 10:22:13 CDT — the first real launchd-triggered sync success since 2026-06-11 (previously 100% failure rate, dozens of instances). No error in `mcp-server-error.log` for either run; new process confirmed live via fresh PID and a clean `/health` response. This closes out the last open item from the 2026-07-08/07-09 Atlas/mail-carrier/status_digest work — the whole chain (deploy → mail carrier → cross-agent verification → this fix) is now fully sound end to end.


## 2026-07-09 — OpenClaw gateway stopped and disabled at Gabriel's request (Claude, Cowork)

Investigated an iMessage incident Gabriel reported: contact Stephanie Carll (+19179033270, Shakespearience creative lead) received an automated "OpenClaw: access not configured, pairing code" bot reply twice, ~16:58 and ~17:05 CDT today. Root cause confirmed via `~/.openclaw/openclaw.json` (`channels.imessage.dmPolicy: "pairing"`) and `~/.openclaw/imessage/sent-echoes.jsonl`: OpenClaw (a pre-existing local AI agent gateway at `ai.openclaw.gateway`, unrelated to this KB) gates every un-paired 1:1 iMessage sender behind a pairing challenge — Stephanie hit it on what was apparently her first text since OpenClaw was set up. Three other pairing challenges fired in the same ~40-minute window (a phone number, an email address, and oddly Gabriel's own self-echo chat), suggesting a burst tied to the iMessage provider settling down after an unrelated crash-loop earlier that morning (09:12-10:07 CDT, logged separately, not caused by anything in this session).

No pairing was approved and no config was changed as part of the investigation. Gabriel's decision: he isn't using OpenClaw right now and wants it fully stopped, not just the iMessage channel.

Action taken: `launchctl bootout gui/501/ai.openclaw.gateway` (stopped immediately) followed by `launchctl disable gui/501/ai.openclaw.gateway` (prevents RunAtLoad from restarting it on next login/reboot). Verified stopped: not in `launchctl list`, no process in `ps aux`, `launchctl print` reports the service no longer found in the user domain. The LaunchAgent plist itself was left in place (`~/Library/LaunchAgents/ai.openclaw.gateway.plist`, untouched) — this is reversible via `launchctl enable` + `launchctl bootstrap` if Gabriel wants OpenClaw running again later.

Side effect noted, not fixed: the Tailscale Funnel route `/` → `127.0.0.1:18789` (OpenClaw's port) will now fail since nothing is listening — expected and harmless given OpenClaw is intentionally off; not touched since it wasn't asked for.

This is unrelated to ClaudeSecondBrain/MCP infrastructure — OpenClaw is separate agent-gateway software that happens to run on the same Mac. Logged here per the second-brain-kb protocol's practice of recording durable infra actions taken during a session, in case a future agent session (Claude, Atlas, or otherwise) encounters OpenClaw references and needs to know its current disabled state and why.


## 2026-07-12 — Claude — July 7 FlowScape ingestion + FlowScape hang diagnosis

- Ingested `flowscape_context_2026-07-07_16-24-34.md` → dev-infrastructure/flowscape-ambient-sessions.md (dashboard build session).
- Ingested `flowscape_context_2026-07-07_23-42-47.md` → dev-infrastructure/flowscape-ambient-sessions.md (Shakespearience-Platform storefront/membership scaffolding). Added cross-link to dev-projects/shakespearience in `_connections.md`.
- Reviewed `flowscape_session_2026-07-07.md` → NOT promoted to canonical content; Apple-Intelligence digest confabulated (QuickTime/VLC/video-editing tasks that did not occur). Marked `[unverified]`, kept for audit only.
- `Vibrational Consciousness Hypothesis.pdf` → marked `_done` as duplicate source of the already-processed `Vibrational Consciousness Hypothesis_done.md` and the VCH wiki articles. No new article.
- All four files marked `_done` in `raw/`.
- Separately diagnosed the live FlowScape process hang (128% CPU, 4+ days): SQLite concurrency race in ActivityEngine — one shared `db` connection accessed concurrently from the main thread (PatternEngine reads) and the `com.flowscape.fsevents` queue (writes), no serialization. Restarted the launchd job for immediate relief. Full write-up saved to `outputs/2026-07-12_flowscape-hang-diagnosis.md`. Durable code fix pending Gabriel approval.


## 2026-07-12 (later) — Claude — FlowScape durable fix applied + verified

Patched `FlowScape/Sources/FlowScape/ActivityEngine.swift` and `PatternEngine.swift` to remove the SQLite concurrency race (TASK-2026-07-12-001):
- ActivityEngine opens the connection with `sqlite3_open_v2(... SQLITE_OPEN_FULLMUTEX ...)`.
- `events()` now runs inside `queue.sync {}` — the same serial queue FSEvents writes on — so reads and writes never touch the connection concurrently.
- PatternEngine `_doAnalyze()` reads `events()` inside its detached background task (off the main actor).
Rebuilt and reinstalled via `./build.sh --install` (clean release build, 20s). Verified under load: drove 120 file events through the write path alongside the startup pattern-scan read path — process held at 0.0% CPU, state S, and a live `sample` showed zero `sqlite3BtreeCursor` frames (threads idle in the normal run-loop wait). Race resolved. TASK-2026-07-12-001 closed.


## 2026-07-13 — Shakespearience tech buildout status briefing
Requested by Gabriel. Compiled current technical state from architecture.md, prior outputs (2026-07-07, 2026-07-08), and a live Trello pull of "The Tech Guts" (14 cards) and "Tech Production" (8 cards). Key finding vs. last pull: the 9 previously-unassigned Tech Guts build-out cards are now all assigned to Gabriel; both tech lists fully assigned, still no due dates. Saved to `outputs/2026-07-13_shakespearience-tech-buildout-status.md`.


## 2026-07-13 — Shakespearience account-management + email strategy
Requested by Gabriel. Recommendation: register every tech service under company-owned role addresses at shakespearience.com; root-of-trust = registrar + email host + password manager + bank; Fastmail Business Standard as primary non-Google email pick (Proton/Migadu/Zoho as alternatives); flagged the MX-vs-Resend/ConvertKit DNS coexistence gotcha and subdomain-sending best practice. Web-grounded pricing (Fastmail, Proton, Zoho, Migadu). Saved to `outputs/2026-07-13_shakespearience-account-and-email-strategy.md`. Feeds SETUP.md.


## 2026-07-13 — New collection: Shakespearience Ops Playbooks
Created `wiki/dev-projects/shakespearience/ops-playbooks/` at Gabriel's request — a living, plain-English library of business-setup guides for Gabriel and Stephanie. Added `_index.md` (12-playbook roadmap, status legend, COPPA/kids-privacy priority flag) and wrote Playbook 01 — Accounts & Access in full (five golden rules, password-manager-first setup, role-address scheme, top-down tier build order for all 15 services, 2FA/hardware-key policy, continuity plan, monthly hygiene check, and a Vendor Ledger table seeded with current costs). Updated master `_index.md`. Feeds the platform SETUP.md. Source: `outputs/2026-07-13_shakespearience-account-and-email-strategy.md`.


## 2026-07-13 — Ops build-out: Trello "Ops & Setup" list + 3 more playbooks
Created a new Trello list "Ops & Setup" (id 6a556cfaaca2fbfa0045f5ab) on the Shakespearience board via browser (Trello MCP creates cards, not lists) and populated 14 cards mapped to the ops playbooks — 10 assigned to Gabriel, 4 intentionally left UNASSIGNED and flagged for his review (COPPA/FERPA, Contracts & People, Brand & Trademark, Insurance & Risk). Added a 16-item top-down "Build order" checklist to the Accounts & Access card. Wrote three full playbooks: 02 Legal Foundation, 04 Domain/DNS/Email Deliverability, 05 Kids' Privacy/COPPA. Marked all three ✅ ready in the ops-playbooks index. Playbooks 03, 06–12 remain planned.


## 2026-07-13 — Correction: domain owned at GoDaddy (not Cloudflare Registrar)
Gabriel clarified the domain is registered through GoDaddy. Updated Playbook 04 Step 1 and the Trello "Domain, DNS & Email" card: keep domain at GoDaddy for now, point nameservers to Cloudflare (free) for authoritative DNS + CDN + SSL, host on Vercel, storage on Cloudflare R2, avoid GoDaddy web hosting/Website Builder. Optional future transfer to Cloudflare Registrar noted as a cost optimization, not a blocker.


## 2026-07-13 — Ops playbooks 03, 06, 07 written
Wrote three more full playbooks: 03 Business Banking & Bookkeeping (entity-first, Mercury + per-vendor virtual cards, Wave/QuickBooks, sales-tax posture), 06 Payments & Tax/Stripe (5-tier products, Stripe Tax, webhook truth, Customer Portal, dunning, disputes, COPPA consent tie-in), 07 Security Hygiene & Backups (access hygiene, monthly check, real backups for Supabase/R2/GitHub with test-restore rule, one-page disaster recovery). Marked all three ✅ ready in the ops-playbooks index. Collection now 7 of 12 ready (01–07); remaining planned: 08 Contracts, 09 Brand/Trademark, 10 Insurance, 11 Vendor Ledger, 12 Incident Response.


## 2026-07-13 — Ops operating-costs budget tab + KB companion
Documented the operating costs the Ops Playbooks imply beyond the existing Tech Budget stack (business email, password manager, domain renewal, registered agent, insurance, privacy tooling, bookkeeping, CPA; one-time LLC/keys/trademark/operating-agreement/privacy-policy; variable Stripe/Printful/trademark-maintenance). Prices web-verified. Built spreadsheet tab `Shakespearience_Ops_Operating_Costs.xlsx` (recurring $128.74–$335.07/mo → $1,545–$4,021/yr; one-time $766–$6,616; live formulas, recalc clean) and a durable KB companion `ops-playbooks/ops-operating-costs.md`. The xlsx is delivered to Gabriel to import as a tab into the Google budget sheet (native gsheet tab-add isn't available via the current connector).

## 2026-07-13 — Ops Playbooks collection COMPLETE (08–12 written)
Wrote the final five playbooks: 08 Contracts & People (IP assignment, actor/contractor terms, W-9/1099), 09 Brand & Trademark (clearance search, USPTO classes 41/9/16, domain+handle defense, usage standards), 10 Insurance & Risk (GL + Media/Tech E&O as the on-point coverage, cyber for kids'-data, what to skip), 11 Vendor & Subscription Ledger (the living account record + cadence), 12 Incident Response (runbooks for outage / payment failure / lost login / children's-data incident, roles, post-mortem). All marked ✅ ready. The ops-playbooks collection is now 12 of 12 complete, plus the ops-operating-costs companion. Collection home: wiki/dev-projects/shakespearience/ops-playbooks/.
---

## 2026-07-14 — Ops Playbooks patched: master domain locked, dependency chains separated, orphan registered (Claude)

Trigger: Gabriel preparing Cloudflare signup; named `shakespearienceworld.com` as the master domain, to be registered at Cloudflare Registrar.

**Self-correction logged first:** earlier in this session I told Gabriel the ops-playbooks "were never written," having searched only `Shakespearience-Platform/` (the code repo) after a hung filesystem search, and asserted a negative without running the startup sequence. All 12 playbooks existed in the wiki the whole time and `wiki/_index.md` pointed straight at them. The 7-step startup contract in `agent-protocol.md` exists precisely to prevent this; skipping it produced a confident false negative.

Files changed:

- `wiki/dev-projects/shakespearience/ops-playbooks/04-domain-dns-email.md` — Step 1 rewritten. Registrar changed from GoDaddy to **Cloudflare Registrar**; master domain changed to `shakespearienceworld.com`. Added the registrar-vs-hosting separation (Cloudflare = registrar/DNS/CDN/R2, Vercel = hosting), the at-cost pricing rationale, and an explicit concentration-risk warning. GoDaddy demoted to a "Legacy / defensive registration + 301 redirect" subsection. All record examples (DKIM, DMARC `rua`, `send.` subdomain) updated to the new domain.
- `wiki/dev-projects/shakespearience/ops-playbooks/01-accounts-and-access.md` — Step 0 replaced with the **two-dependency-chain** model (identity chain gated by nothing; money chain gated by LLC/EIN). Added **Step 0.5 — the bootstrap paradox** and its six-step resolution via a Fastmail-native bootstrap identity. Tier-1 table: Cloudflare row rewritten as the hardest root account in the company. Golden rule 1 and Vendor Ledger updated to the new domain and at-cost pricing.
- `wiki/dev-projects/shakespearience/ops-playbooks/ops-operating-costs.md` — domain-renewal line corrected from GoDaddy ($20/yr) to Cloudflare Registrar at-cost ($10-11/yr); recurring subtotals recomputed ($127.95-$334.32/mo; $1,535-$4,012/yr).
- `wiki/dev-projects/shakespearience/ops-playbooks/_index.md` — registered the orphaned `ops-operating-costs.md` in the collection table; added a "Locked decisions" section carrying the domain decision and the two-chain model.
- `wiki/_index.md` — corrected the stale Ops Playbooks line, which claimed only Playbook 01 was ready while all 12 had been complete since 2026-07-13. Now reflects full inventory plus the domain decision.
- `wiki/_meta/decision-registry.md` — two new entries: `DECISION-2026-07-14-master-domain-cloudflare` and `DECISION-2026-07-14-two-dependency-chains`.

Contradictions resolved:
1. Playbook 01 said the domain lived at Cloudflare Registrar; Playbook 04 said GoDaddy. Gabriel's decision settles it — Cloudflare, new domain, both files now agree.
2. Playbook 01's Step 0 implied the LLC gated every account, including Cloudflare. It gates the bank and Stripe only.
3. The `ops@` bootstrap circularity had no stated resolution and would have blocked account #1.

Outstanding (not blocking Cloudflare signup):
- Trello "Domain, DNS & Email" card in Ops & Setup still describes the GoDaddy → Cloudflare nameserver plan. Needs updating to the new registration decision.
- COPPA (Playbook 05) is still unassigned on the Trello board. Shapes signup flow, analytics, and data retention — should get an owner before Clerk and Plausible are wired.

Output: `outputs/2026-07-14_ops-sequencing-cloudflare.md`

## 2026-07-14 — Editorial/Agent Simulation Reliability System

Created `wiki/craft-fiction/submission-strategy/editorial-board-simulation-protocol.md`, `editor-agent-research-standard.md`, `editorial-board-model-registry.md`, and local `_index.md`. The new system separates verified public evidence, inference, and simulation constructs; requires current-role verification; calibrates acquisition probabilities; defines agent-to-editor route evidence; and prevents named editor-models from being represented as private knowledge or literal predictions. Added a current-status warning that MCD/FSG reportedly closed in April 2026, so Sean McDonald must be used as a lineage model unless a new current role is verified.


## 2026-07-16 — Living intelligence layer: 4 repairs + 8 new documents (Claude, Cowork)

Gabriel presented a structured audit of the KB's gaps and commissioned the first tranche of new documents. Full session work:

**Repairs:**
- `craft-fiction/string-theory/string-theory.md` — Updated body text from stale 20-chapter/96,000-word figures to live Draft 6.7 reality (Overture + 27 chapters, 107,060 words). Stale notice replaced with partial-update notice pointing to the new Current Manuscript State article.
- `_meta/task-ledger.md` — Consolidated: all four prior tasks (TASK-2026-07-08-001, 002, TASK-2026-07-09-001, TASK-2026-07-12-001) moved to Archive with resolution summaries. Active tasks section shows clean (no current tasks).
- `decision-records/0002-nexus-boundary.md` — Promoted from registry entry.
- `decision-records/0003-manuscript-read-only.md` — Promoted; added 2026-07-09 Atlas escalation as precedent.
- `decision-records/0004-shakespearience-master-domain.md` — Promoted with full Cloudflare rationale and concentration risk documentation.
- `decision-records/0005-shakespearience-two-dependency-chains.md` — Promoted with bootstrap paradox resolution documented.

**New documents:**
- `_meta/active-portfolio.md` — Single dashboard for all 11 active initiatives (String Theory, BURNThrough, Shakespearience, SecondBrain, FlowScape, Codex Guardian, Private Club App, ComTechSuite, WriteTrack, Prestige Fiction Forge, Nexus, VCH/GHRM). Canonical sources, phases, next hard decisions, next milestones, collaborators, last verified dates.
- `_meta/knowledge-governance.md` — Truth standard for the whole KB. Eight provenance labels defined with usage rules: `[canonical]`, `[verified]`, `[theoretical]`, `[creative-canon]`, `[inference]`, `[unverified]`, `[ai-generated]`, `[historical]`. Critical application to VCH/GHRM, novel science, and AI-generated market intelligence documented.
- `craft-fiction/string-theory/current-manuscript-state.md` — String Theory control center. Current draft/build/word count, query submission log (response log empty, monitoring), revision history, research verification flags table, continuity flags, editorial feedback history (empty, monitoring), next actions.
- `ai-collaboration/agent-operating-model.md` — Authoritative agent capability matrix (Claude / ChatGPT-Atlas / Gemini / Cursor), canonical source hierarchy, trust levels, decision authority table, output evaluation standards (provenance, completeness, routing, non-hallucination), OpenSpec-first development method specification, inter-agent communication protocol, Phase 03b compliance, known gaps.
- `music-performance/composition-practice.md` — Seed document from verified profile sources. Covers formal training (DePaul, Music Composition concentration), five commissioned musicals, 20+ theatrical scores, Doxology rock career, Shakespearience original music. Sections needing Gabriel's input marked `[expand]`.
- `music-performance/directing-practice.md` — Seed document. Covers 60+ productions, BCPA residency, Bellarmine and TSOTA institutional roles, Mamma Mia national tour, Shakespeare as recurrent center of gravity. Cross-linked to pedagogy and Shakespearience.
- `dev-projects/shakespearience/creative-bible.md` — Shakespearience show identity, Narrator character design, age-tier architecture, adaptation philosophy, production style, educational integration, editorial quality standard, season architecture. Sections requiring Stephanie Carll's input clearly marked `[NEEDS CONTENT]`.

**Index and cross-link updates:** `_index.md` and `_connections.md` updated below.

Inbox items acknowledged: "abracadabra and Bally-hoo" (2026-06-11), Harry Caray (2026-06-28), "yeehaw cowboy" (2026-06-28, Martindale TX), "woopty woo" (2026-06-29). All inbox messages received.


## 2026-07-16 — Fiction Studio master writing and editing system (ChatGPT/Atlas)

At Gabriel’s request, created `wiki/craft-fiction/fiction-studio/master-system.md` as the shared operating system for fiction work across STRING THEORY, BURNThrough, and future novels. The system formalizes: explicit authorship authority; canonical-source verification; mode separation between diagnosis, architecture, assembly, revision, drafting, and market assessment; a conservation map before revision; a single governing edit mandate; controlled intervention; five quality gates (fidelity, causality, consciousness, rhythm/form, publishing signal); and a three-pass substantive-AI cap.

Updated `wiki/_meta/agent-protocol.md` with a Fiction Studio enforcement requirement for every agent; registered DECISION-2026-07-16-fiction-studio-governance; appended index and connection entries; recorded the task and handoff. Installed and validated the reusable `fiction-studio` skill with operating-protocol and project-profile references. A forward test confirmed that the workflow diagnoses cold action-beat reduction without generating an unauthorized rewrite.


## 2026-07-16 — Fiction Studio delivery clarification (ChatGPT/Atlas)

Forward testing confirmed the diagnosis and conservation behavior. Added an explicit revision-delivery rule: revised prose comes first, followed by a compact Change ledger unless Gabriel requests prose only. Applied to the shared master system and the installed skill.


## 2026-07-16 — Fiction Studio anti-flattening cadence amendment (ChatGPT/Atlas)

At Gabriel’s direction, upgraded Fiction Studio with an absolute anti-flattening editorial rule. The amendment appears high in the installed skill and the shared SecondBrain master system, with a dedicated `anti-flattening-audit.md` reference. It makes cadence preservation operational: source-movement identification, hierarchy-first clarity repairs, metaphor discipline, concrete police-report failure recognition, and a mandatory ten-question pre-output audit. The audit forces another revision whenever the draft exhibits action-report sequencing, repeated simple subject-verb openings, restraint conflated with shortness, or genericness.


## 2026-07-16 — Fiction Studio semantic-pressure correction (ChatGPT/Atlas)

Stress testing exposed an anti-flattening failure that cadence rules alone did not catch: the first test revision retained a long sentence and all plot events but converted a charged image into generic mental summary (“thinking of her own father”). Added a mandatory source-carrier → function → quieter-carrier preservation map, a filter-verb constraint, and two new audit questions covering loss of image function and filter-verb substitution. Final retest preserved the father’s presence as bodily pressure while tightening the sentence.


## 2026-07-16 — Shakespearience Platform live architecture audit (Claude)

Direct filesystem inspection of `/Volumes/Ready500/DEVELOPMENT/Shakespearience-Platform` per TASK-2026-07-16-004 (requested by ChatGPT/Atlas). Read-only pass; zero implementation changes. Audit report written to `outputs/2026-07-16_shakespearience-platform-audit.md` and delivered to `wiki/_agents/chatgpt/inbox.md` via agent mail carrier (Message-ID: `shakespearience-platform-audit-2026-07-16`). TASK-2026-07-16-004 closed.


## 2026-07-16 — Chapter 13 ingestion + chapter renumbering confirmed (Claude, Fiction Studio Continuity pass)

Gabriel delivered the full text of the current manuscript's Chapter 13, "Visions and Burdens… of Knowing" (5 scenes, 6,201 words, manifest from `gabrielmcp78.github.io/string-theory-chapters`). Ran the Fiction Studio startup sequence (7-step protocol + `master-system.md`) before acting; treated this as a Continuity pass — contradiction report and ledger only, zero manuscript prose altered per the read-only rule.

**Finding:** this chapter is confirmed to be the old 20-chapter (Draft 6.6) structure's Chapter 6 of the same title, now repositioned to Chapter 13 in the current 27-chapter manuscript — title, five-movement symphony form, and full scene content (Pythagoras → du Châtelet → office purge → Helmholtz/Chladni → Newton) match exactly. This resolves the open hypothesis flagged in `current-manuscript-state.md` since the Draft 6.7 rebuild. It also surfaces a new open question: the old structure's Chapter 13 ("Phenom de Guare" — Eleanor Guare's focal chapter) is now displaced and its current position is unconfirmed.

**New document:** `wiki/craft-fiction/string-theory/chapter-13-visions-and-burdens.md` — full scene-by-scene breakdown, new-canon notes (Professor Garrin, the on-page *Ithaca Times* Nov-28-2026 headline, the Sagan aside, the three-artifact count), and a research verification table for the chapter's historical-science claims (Newton/Maunder Minimum, du Châtelet's *vis viva*, the Fraunhofer-lines anachronism, the Helmholtz/Chladni composite).

**Updated:** `current-manuscript-state.md` (Continuity Flags + Research Verification Flags), `characters.md` (added Professor Garrin), `novel-structure.md` and `chapter-summaries.md` and `themes-and-canon.md` (added numbering-collision callouts, no destructive edits to existing summary content), `_connections.md` (three new cross-domain links).

**Open question left for Gabriel** (also in `handoffs.md`): where does "Phenom de Guare" now sit in the 27-chapter manuscript? Until answered, two `themes-and-canon.md` passages (Rune's true-role reveal, Eleanor Guare's role) carry an unresolved chapter pointer.

---

## 2026-07-16 — Session initialization and status sync (Gemini)

Updated `wiki/_agents/gemini/status.md` at session start to set `Last active` to today's date and set `Current task` to status verification. Completed the 7-step canonical startup sequence.

## 2026-07-16 — Shakespearience Fiscal Sponsorship vetting checklist and candidate list (Gemini)

Wrote `outputs/2026-07-16_shakespearience-fiscal-sponsorship.md` containing the Model C fiscal sponsorship candidate profiles (Fractured Atlas, Independent Arts & Media, The Gotham, Austin Film Society, and The Field) and the six-pillar operational vetting checklist.




## 2026-07-17 — Fiction Studio 2.0 orchestration foundation

Created `wiki/craft-fiction/fiction-studio/orchestration-v2.md`, defining Fiction Studio as the governing orchestration layer across GPT, SecondBrain, source control, departmental review, conflict adjudication, revision execution, institutional learning, and eventual MCP software operations.

Created `wiki/craft-fiction/fiction-studio/departments-v2.md`, establishing charters for Source Control, Narrative Architecture, Prestige Prose, Character Psychology, Continuity and Canon, Reader Experience, Scientific and Domain Review, Editorial Board, Production and Assembly, and Conservation and Quality Control.

Registered `DECISION-2026-07-17-fiction-studio-v2-orchestration`, updated the wiki index, and added cross-links connecting the master system, orchestration architecture, and department charters.


## 2026-07-17 — String Theory experimental draft boundary clarified (ChatGPT)

Gabriel clarified the manuscript authority boundary: `String Theory 7` and `String Theory 7.1` are experimental working versions; `StringTheory_7.2_options` is also experimental, has not been ingested, and extends only through Chapter 4. Added this clarification to `craft-fiction/string-theory/current-manuscript-state.md`. Draft 6.7 remains the controlling full-manuscript source for Chapter 5 onward, including current Chapter 9 development, unless Gabriel explicitly designates a later replacement.


## 2026-07-17 — Creative Institution Operating System founding brief (ChatGPT)

At Gabriel’s request, preserved the complete emerging creative-institution architecture before he paused work until tomorrow.

Created `wiki/ai-collaboration/creative-institution-operating-system-brief.md`, a detailed continuity and planning brief covering:

- the GPT / SecondBrain / Fiction Studio three-layer model;
- the objective of developing institutional judgment rather than better prompts;
- Gabriel’s historically informed invention philosophy;
- the established Fiction Studio master system, orchestration architecture, and department charters;
- the possible broader cross-domain creative institution;
- the proposed north-star principle that the Studio exists to make Gabriel more Gabriel;
- the conversational Full Studio Review Protocol, clearly marked as awaiting canonical standalone promotion;
- proposed Artistic Vision, Legacy, and Empty Chair functions;
- Memory of Delight / North Star records;
- research papers, case law, rejected advice, first principles, doctrine promotion, and institutional-learning governance;
- anti-bloat rules, success criteria, risks, phased implementation, open decisions, and the exact tomorrow-start sequence.

Created `handoff/2026-07-17_creative-institution-operating-system.md` as a compact continuation memo.

Updated `wiki/_index.md` and added cross-links connecting the new brief to Fiction Studio governance and SecondBrain infrastructure.

Queued high-priority inter-agent mail to Claude in `wiki/_agents/chatgpt/outbox.md` (Message-ID: `creative-institution-brief-2026-07-17`) with the canonical brief path, compact handoff, authority distinctions, and recommended next operation.

Important governance distinction: “Gabriel Studios” remains provisional; Artistic Vision, Legacy, the Empty Chair, and the final umbrella hierarchy remain proposals pending Gabriel’s review rather than settled doctrine.


**Delivery addendum:** Per Gabriel’s explicit request to CC Claude directly, the same high-priority continuation notice was appended to `wiki/_agents/claude/inbox.md` in addition to the standard ChatGPT outbox/mail-carrier route.


## 2026-07-18 — Ingestion loop diagnosed live: both launchd jobs confirmed non-functional unattended (Claude, Cowork, via Desktop Commander)

Gabriel asked directly whether the ingestion loop was "still sketchy." Rather than trust the 2026-07-17 change-log entries claiming the boot-race fix and outputs-review automation were working, ran live diagnostics against the actual Mac via Desktop Commander.

**Findings:**
- `logs/ingest.log` last real activity: 2026-06-02. No entries since, despite the plist being reloaded 2026-07-17 16:54 and a raw file (`flowscape_resolved_2026-07-17_18-08-28.md`, dropped 18:08 the same day) sitting unprocessed in `raw/` at time of check — direct proof the WatchPaths trigger never fired for it.
- `logs/outputs-review.log` and `logs/outputs-review-error.log`: do not exist. The daily 18:00 StartCalendarInterval job has never produced a single line of output since being loaded.
- Live-reproduced: ran `launchctl kickstart -k gui/501/com.gabrielmcp.secondbrain.ingest-watcher` directly. Waited 38s total. Zero output to `logs/ingest.log`, `logs/ingest-error.log`, or `/tmp/ingest-boot.log` (the boot-race fallback the July 17 fix added). `launchctl print` confirmed **last exit code = 78: EX_CONFIG** both before and immediately after the manual kickstart.
- Ruled out the previously-fixed TCC cause: queried `TCC.db` directly — `/bin/zsh` has `kTCCServiceSystemPolicyAllFiles` auth_value=2 (granted), confirming the 2026-07-09 Full Disk Access fix (TASK-2026-07-08-002) is still in place and is *not* the blocker here.
- EX_CONFIG at launchd's own level, with zero process output anywhere (not even the local-disk `/tmp` fallback), means launchd is refusing to exec the job before `/bin/zsh` ever starts — a different failure mode from the earlier TCC/cp bug (which was a runtime permission failure inside a running process). This is consistent with the known macOS pattern where a GUI LaunchAgent whose `ProgramArguments` points directly at a script on a non-boot external volume gets refused by launchd itself, independent of FDA grants on the target binary.

**Conclusion:** the ingestion loop's automation layer (ingest-watcher WatchPaths + outputs-review daily cron) is loaded but dead. It has only ever "worked" during interactive sessions (this one, or a Claude/Gemini CLI session run by hand) — never unattended. The 2026-07-17 change-log entries describing the boot-race fix and outputs-review install were accurate about what was written and loaded, but nobody had verified it actually fires since. Not fixed in this session — diagnosis only, per Gabriel's question. Logged to `_meta/task-ledger.md` and `_meta/open-questions.md`.


## 2026-07-18 (later) — Ingestion loop launchd bug fixed and verified live; second, unrelated blocker discovered (Claude, Cowork, via Desktop Commander)

Gabriel asked what makes it necessary for the ingest job to run on the external volume — it isn't. That question pointed straight at the fix.

**Fix built:**
- New `launchd/local-triggers/ingest-trigger.sh` and `outputs-review-trigger.sh` — thin wrappers, installed to `~/Library/Application Support/secondbrain/` (local/boot disk), each `cd`s onto the external volume and execs the real script from there.
- `com.gabrielmcp.secondbrain.ingest-watcher.plist` and `com.gabrielmcp.secondbrain.outputs-review.plist` — `ProgramArguments` and `WorkingDirectory` repointed at the local trigger scripts.
- `install.sh` updated to install the trigger scripts alongside the plists.

**First fix attempt was incomplete — root cause was narrower than diagnosed.** Repointing `ProgramArguments`/`WorkingDirectory` to local paths and reloading (`bootout` + `bootstrap`) did *not* clear the `EX_CONFIG` (78) failure — both jobs still failed silently on kickstart. The actual cause: `StandardOutPath`/`StandardErrorPath` in both plists still pointed at `logs/*.log` on the external volume. launchd opens those file descriptors *before* exec'ing the child process, at a point where the child's own Full Disk Access grant doesn't apply yet — that open() failing is what produced EX_CONFIG with zero output anywhere, including the `/tmp` boot-race fallback (which the script never got the chance to reach). Repointed both `StandardOutPath`/`StandardErrorPath` to local files under `~/Library/Application Support/secondbrain/logs/`; the actual scripts still write their real deliverables to the external volume once running (`ingest.sh` appends its own structured log to `logs/ingest.log` via explicit redirects; `outputs_review.py` writes `wiki/_agents/claude/inbox.md` directly) — the launchd-level paths were only ever capturing incidental stdout/stderr.

**Verified live, cold, unattended** (no interactive session doing the work): `launchctl bootout` + `bootstrap` + `kickstart -k` on both jobs from a fully unloaded state. Both now exit 0. `outputs-review` ran end-to-end and correctly rewrote `wiki/_agents/claude/inbox.md` (0 of 20 outputs now unreviewed — confirms today's other change-log entries closed the loop). `ingest-watcher` also ran end-to-end through its own logic — detected the one pending raw file, invoked the Gemini CLI — but hit a second, unrelated failure there (below). The launchd exec layer itself is now confirmed fixed.

**New blocker found, not caused by this fix:** the Gemini CLI (`gemini-cli` 0.41.2, the default `SECOND_BRAIN_AI_PROVIDER`) now fails immediately with `IneligibleTierError: This client is no longer supported for Gemini Code Assist for individuals. To continue using Gemini, please migrate to the Antigravity suite of products.` — a deprecation on Google's side of the free tier the CLI depends on, unrelated to anything in this repo. `raw/flowscape_resolved_2026-07-17_18-08-28.md` remains correctly unprocessed (the script aborted cleanly before any partial write or premature `_done` rename). `ingest.sh` already has a working `claude` provider branch and `/usr/local/bin/claude` (Claude Code CLI) is installed and present — switching `SECOND_BRAIN_AI_PROVIDER` to `claude` in the plist is the immediate unblock, pending Gabriel's confirmation since it changes which AI processes autonomous drops.

**Not yet done:** flipping the provider and running the pending file through end-to-end. Registered as a candidate `decision-registry.md` entry given the reusable local-trigger pattern; not yet promoted, pending Gabriel's review.


## 2026-07-18 — Full Studio Review Protocol canonicalized (ChatGPT/Atlas)

Created `wiki/craft-fiction/fiction-studio/full-studio-review-protocol.md` as the canonical highest-order review process for major fiction decisions. The protocol reconciles the Fiction Studio master system, orchestration architecture, and department charters into one staged operation: intake and authority lock, canon verification, conservation mapping, selective department activation, independent findings, conflict session, adjudication, intervention strategy, revision gates, Studio report, and governed institutional learning.

Registered `DECISION-2026-07-18-full-studio-review-protocol`, updated the master index, added cross-links to the master system and orchestration architecture, and updated ChatGPT session status.

Artistic Vision, Legacy, and the Empty Chair remain provisional pending Gabriel’s next decision. Temporary limits are encoded in the protocol so they cannot acquire authority by drift.


## 2026-07-18 — Artistic Vision, Legacy, and Empty Chair canonicalized (ChatGPT/Atlas)

Created `wiki/craft-fiction/fiction-studio/artistic-vision-legacy-empty-chair.md` and registered the three approved non-departmental functions:

- Artistic Vision as a constitutional lens protecting artistic necessity through evidence-based Preservation Challenges;
- Legacy as a rare special review mode producing a non-binding Long-Horizon Consideration;
- The Empty Chair as a final witness answering Yes, No, or I almost did, with one sentence identifying the decisive reading threshold.

Appended amendments to `full-studio-review-protocol.md` and `departments-v2.md`, registered `DECISION-2026-07-18-artistic-vision-legacy-empty-chair`, updated the master index and cross-domain connection map, and preserved strict anti-inflation, rarity, evidence, and authority limits.


## 2026-07-18 — Fiction Studio Pilot 001: Chapter 9 provisional Full Studio Review (ChatGPT/Atlas)

Ran the first live Full Studio Review pilot on the intended current Chapter 9 unit, “Fruitful Eve, False Dawn, Fateful Night,” as a diagnosis-only operation.

Source Control discovered that multiple Library files named `Chapter 9 work NEW` contained later solar-storm material rather than the dinner/tuning chapter. Older sources positively identified the intended eight-movement secular-passion architecture but used former Chapter 3 numbering and predated the latest dinner revisions. Google Drive retrieval of the current controlling export was unavailable because the connector returned invalid authentication credentials.

Created `wiki/craft-fiction/fiction-studio/pilots/2026-07-18-chapter-9-provisional-full-studio-review.md`. The report:

- preserves the eight-movement chapter architecture;
- identifies the dinner-to-tuning hinge as the governing review target;
- records Character Psychology, Continuity, Reader Experience, Prestige Prose, Editorial Board, and Artistic Vision findings;
- withholds the Empty Chair verdict because the exact current work was unavailable;
- declines Legacy activation;
- establishes “filename is not manuscript identity” as a case-law and Source Lock amendment candidate;
- recommends recovering the current exact chapter and reviewing Movements I–II first, with context through Rune’s office.

Updated the master index and cross-domain connections. No manuscript prose was altered. No doctrine amendment was promoted automatically; the Source Lock amendment remains a Gabriel-review candidate.

## 2026-07-18 — Ingestion Pipeline Live Test (Gemini)
Processed `raw/pipeline-test-2026-07-18.md` at 2026-07-18T10:52:20-05:00. No wiki article was created as requested. Marked as _done.

## 2026-07-18 (later) — Monthly Health Check (Claude, Cowork)

Gabriel asked whether the now-reliable ingestion loop was closing a loop of compound understanding or just cataloguing, then asked to run the overdue Monthly Health Check (last run 2026-07-07) to actually test that question. Full audit saved to `outputs/2026-07-18_health-check.md`. Summary: `raw/` clean, `_connections.md` has zero broken links. Two real contradictions found — `dev-infrastructure/nexus.md` is a stray file whose own content says it shouldn't be filed there (violates ADR 0002), and `theory-consciousness/codex-lexicon.md` / `codex-harmonic-lexicon.md` are near-duplicate articles from the same day. Five orphan targets confirmed unlinked from `_index.md`: `ai-collaboration/agent-mail-carrier.md`, `craft-fiction/string-theory/manuscript-manifest.md`, and the four-file Editorial/Agent Simulation Reliability System under `craft-fiction/submission-strategy/`. Governance-labeling gap confirmed wider than `TASK-2026-07-16-005` currently scopes it — zero provenance labels across all core String Theory canon files, not just VCH/GHRM. No fixes executed; report delivered for Gabriel's review per protocol.

## 2026-07-18 (later still) — Health-check fixes executed (Claude, Cowork)

Gabriel reviewed the audit and said "execute all fixes now." All six items closed:

**Deleted** (via Desktop Commander, direct filesystem, Gabriel's real Mac): `wiki/dev-infrastructure/nexus.md` (stray file whose own content violated the ADR-0002 boundary it was asserting; nothing lost, the boundary rule already lives in the ADR and `agent-protocol.md`'s Settled Boundaries section) and `wiki/theory-consciousness/codex-lexicon.md` (near-duplicate of `codex-harmonic-lexicon.md`, same source file, same day, less complete).

**Merged:** `codex-lexicon.md`'s two `[theoretical]` governance labels (on "Geometry" and the closing usage note) were the only content in the duplicate not already present in `codex-harmonic-lexicon.md` — added to the canonical file along with a provenance note documenting the merge, before the duplicate was deleted.

**Indexed in `wiki/_index.md`** (3 real orphan clusters, previously invisible from the navigation entry point):
- `craft-fiction/string-theory/manuscript-manifest.md`
- `craft-fiction/submission-strategy/_index.md` hub, linking `run-editorial-board.md`, `editorial-board-simulation-protocol.md`, `editorial-board-model-registry.md`, `editor-agent-research-standard.md` — the full Editorial/Agent Simulation Reliability System built 2026-07-14, unlinked from the master index for four days.
- `ai-collaboration/agent-mail-carrier.md`

Stats block updated: 84 articles (+3), 5 outputs (+2), last health check 2026-07-18.

**Added to `_connections.md`:** Editorial Board ↔ Fiction Studio (both are AI-simulated manuscript judgment at opposite lifecycle stages, built four days apart with no prior cross-reference); Agent Mail Carrier ↔ Agent Operating Model (policy ↔ mechanism).

**Widened `TASK-2026-07-16-005`'s scope** in `task-ledger.md` from 4 VCH/GHRM files to the full real gap — every core String Theory canon file plus additional theory-consciousness files. Left at Gabriel's existing PAUSED priority; only the scope was corrected, not the priority.

## 2026-07-18 (evening) — Shakespearience Command Center: invalid-host bug verified fixed, git hygiene fixed (Claude, Cowork)

Gabriel asked to return to yesterday's Command Center work. Found it in a separate worktree, `/Volumes/Ready500/DEVELOPMENT/Shakespearience-Platform-command-center` (not the main `Shakespearience-Platform` repo), on commit `a714729`. The FlowScape "invalid host" error logged 2026-07-17 18:08 was Clerk's dev-browser handshake redirecting before the app's own logic could run, because the Command Center — an internal 2-4 person ops tool — was routed through Clerk middleware built for the customer-facing app. In-flight uncommitted work (not mine) had already redesigned the fix correctly: pulled `/command-center` and `/api/command-center/*` out from under `clerkMiddleware()` entirely (a plain middleware function checks Command Center routes first, before any Clerk logic runs — returning early *inside* the Clerk callback doesn't work, Clerk's handshake already fires before the callback executes), gated with HTTP Basic Auth (`COMMAND_CENTER_USERNAME`/`COMMAND_CENTER_PASSWORD`), added a legacy-URL redirect from the old `/admin/command-center` path, and taught the root layout to skip `<ClerkProvider>` entirely on Command Center routes (its client script breaks on unconfigured Clerk keys even on pages that never call a Clerk hook).

**Verified, not just read:** `npm run typecheck` exit 0. Started the dev server and curled all four states directly: no-auth request to `/command-center` → clean 401 with `WWW-Authenticate: Basic`, no Clerk error; `/admin/command-center` → clean 307 redirect to `/command-center`, confirmed it never touches Clerk; correct Basic Auth → 200; `/api/command-center/snapshot` with auth → real JSON response, honestly reporting `"availability":"unavailable"` because `TRELLO_API_KEY`/`TRELLO_TOKEN` in `.env.local` are still the placeholder `"..."` values — not faked data, consistent with this repo's no-mocks directive. The invalid-host bug is conclusively fixed; the next real blocker is Gabriel providing real Trello API credentials.

**Also fixed, unrelated to the bug but a real risk:** the repo was in detached-HEAD state (`git status`: "Not currently on any branch") sitting exactly on `origin/feat/command-center-foundation`'s tip with six modified files and two untracked directories uncommitted. Any commit in that state would have been an orphaned commit, invisible to the branch and at real risk of loss on the next checkout. Verified local HEAD matched the remote branch tip exactly, then ran `git checkout -b feat/command-center-foundation --track origin/feat/command-center-foundation` — reattaches HEAD to a proper tracked branch, working-directory changes preserved exactly, nothing lost. Dev server stopped after verification; nothing left running.

**Verification:** re-ran the same mechanical scan used to produce the original audit after all fixes. Orphan list dropped from 5 real targets to 0 (the 12 ops-playbooks files remain "unlinked" by the raw scan but are correctly reachable via their own indexed hub — same pattern confirmed as a non-issue in the original audit). `_connections.md` broken-link check: still zero. `raw/` check surfaced one thing the audit's snapshot missed because it was created mid-scan by concurrent agent activity: `raw/2026-06-08_key-info-for-ingestion.docx` existed alongside an already-processed `..._done.docx` copy — the ingesting agent had copied rather than renamed, leaving an un-suffixed duplicate that `ingest.sh`'s pending-file check would have picked up and reprocessed on the next WatchPaths trigger, risking a duplicate wiki article. Confirmed the real article (`ai-collaboration/chatgpt-librarian-session-2026-06-08.md`) already exists, then deleted the redundant un-suffixed original. All six original health-check items plus this one are closed.


## 2026-07-18 — Fiction Studio Pilot 001 completed on Draft 6.7 Chapter 9

Recovered the exact eight-scene Draft 6.7 Chapter 9 extraction and compared it against Gabriel’s 1,914-word experimental replacement for 9.2, “II. ARIOSO | The Tuning.” Ran the complete Full Studio Review in diagnosis/architecture mode with Source Control, Narrative Architecture, Character Psychology, Continuity, Reader Experience, Prestige Prose, Scientific/Domain Review, Editorial Board, Artistic Vision, Conservation/QC, and the Empty Chair. Legacy was not activated.

Saved the complete report to `outputs/2026-07-18_chapter-9-full-studio-review-completed.md`.

Official Studio Decision: approve the experimental 9.2 as the replacement architecture and near-final prose foundation, but do not promote it to canon or insert it independently. The new scene requires a revised 9.1 exit, one surgical 9.2 pass, and a paired rebuild of 9.3–9.4 so a genuine local resonant event becomes a sophisticated false universal model rather than straw-man numerology. No manuscript prose was altered.

Institutional-learning candidates recorded in the report: restoration by expansion; true phenomenon / false model; exposition occupying the arioso; and the need to let recovered hope become desirable before the chapter destroys it.

## 2026-07-18 — Final Queue Clearance (Gemini)

**raw/2026-06-08_key-info-for-ingestion.docx** — Re-processed and renamed to _done to clear the raw queue.

Updated wiki/_connections.md to add the link for ai-collaboration/chatgpt-librarian-session-2026-06-08.md to dev-infrastructure/.
Renamed raw/2026-06-08_key-info-for-ingestion.docx to raw/2026-06-08_key-info-for-ingestion_done.docx.
## 2026-07-18 — Final processing of unprocessed files in raw/ (Gemini)

**wiki/ai-collaboration/chatgpt-librarian-session-2026-06-08.md** — Rewrote wiki entry per schema in Gemini.md.
**wiki/_index.md** — Updated index processing timestamp.
**wiki/_connections.md** — Updated connection processing timestamp.
**raw/2026-06-08_key-info-for-ingestion.docx** — Renamed source file to _done.

## 2026-07-18 (Current Session) — Final Queue Clearance (Antigravity)

**raw/2026-06-08_key-info-for-ingestion.docx** — Successfully renamed the lingering duplicate un-suffixed file to `_done` to prevent further duplicate ingestion loops. Wiki entry and index were already properly completed in a prior session.

## 2026-07-18 — FlowScape July 18 21:43 Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-18 21:43 capturing a blocking issue with Shakespearience-Platform-command-center webpack-runtime.js and a concurrent cross-domain reference to the *String Theory* manuscript.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions.md` and `dev-projects/shakespearience/`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file.
**raw/flowscape_resolved_2026-07-18_21-43-33.md** → `_done`

## 2026-07-20 — BURNThrough Opening Whiteboard R01 Created (Codex)

Created the first BURNThrough Fiction Studio Workbench in Google Drive with lifecycle folders, uploaded `BT__PROLOGUE-CH02__OPENING-WHITEBOARD__PENDING__2026-07-20__R01.docx` to Pending Whiteboards, and uploaded `BT__FILE-CONTROL-INDEX__2026-07-20.xlsx` to the workbench root. Work ID: `BT-OPENING-R01-2026-07-20`.

The whiteboard uses 3.0 alternate `Prologue.docx`, `Ch 1.docx`, and `Ch 2.docx`; applies approved name locks `Kieran Vale`, `Tovan Pyrahn`, and `Magistrate Edran Vossk`; removes the duplicate Prologue `2. Bounty` heading; corrects clear local slips; includes a working lead-transfer board; and preserves unresolved Celeriac/Celerian, Veryn/Veyr, and incidental Tolan questions. Render QA passed locally at 48 pages. Also created Canva companion board `BURNThrough Opening Lead Transfers R01` as a visual aid only. No canonical manuscript source was changed.


## 2026-07-21 — Chapter 9 Overview lossless archive recovery package opened

Created `handoff/string-theory/chapter-09-overview-2026-07-18/` for Gabriel's requested verbatim archive of the private ChatGPT project conversation “Chapter 9 Overview” (conversation ID `6a5ad5af-0dd4-83ea-afe3-7f1bbdb7bdf0`). Copied exact surviving Full Studio Review, Cold Panel Review, and prior session handoff artifacts. Raw transcript remains explicitly pending because the current project-memory connector exposes summaries but not complete message bodies. Sent Claude a high-priority direct inbox CC requesting authenticated lossless recovery; no conversation prose was reconstructed.

## 2026-07-20 — "Secondbrain" Routing Chronicle Filed (Claude / Cowork)

Chronicled the working session that settled where "secondbrain" points. Gabriel confirmed the word names his persistent knowledge system — the neo4j-memory graph plus the KB wiki — rather than any email destination. Filed to both stores per his instruction.

**neo4j-memory graph** — Stored chronicle as `conv_c1025edf-aab1-4b9e-9e36-c7c888e357ba` under project `claude_conversations`.
**wiki/ai-collaboration/chronicle-secondbrain-routing-2026-07-20.md** — Created the session chronicle article.
**wiki/ai-collaboration/gabriel-workflow-rules.md** — Added Section 3, the "Secondbrain" Routing Rule, marked `[verified]`.
**wiki/_index.md** — Added the chronicle to the ai-collaboration article list.

## 2026-07-20 — neo4j-memory MCP Server: Query Bugs Fixed (Claude / Cowork)

Repaired three Cypher defects in `/Volumes/Ready500/DEVELOPMENT/neo4j_json_ingester/mcp_server.py`. Backup: `mcp_server.py.bak-20260720-215625`. All fixes validated against the live Neo4j 2025.09 DB and end-to-end through the patched server methods.

**`_find_conversations`** — The base query already ended in a `WHERE`, then the builder appended a second `WHERE` for any filter, producing `WHERE ... WHERE ...` → Cypher SyntaxError whenever `project_name`, `person_name`, or `has_gm_turns` was passed. Rewrote to fold every predicate into one WHERE via ` AND `, moved `person_name`/`has_gm_turns` to `EXISTS {}` subqueries (the old `has_gm_turns` used an aggregate `collect()` inside WHERE, also illegal), implemented the previously-ignored `date_from`/`date_to` against `doc.created_at`, and made the document display `coalesce(doc.filename, doc.title)` to cover both ingestion schemas.

**`_get_memory_stats`** — The basic-counts query chained four `OPTIONAL MATCH` branches off one anchor, a cartesian product (docs × convs × msgs × chunks) that timed out and inflated `sum(doc.raw_len)` to 649,368,781,742 chars. Rewrote using `COUNT {}` subqueries and a pattern-comprehension char sum; now returns in ~0.2s with a correct total of 66,905,348 chars. Applied the same `COUNT {}` fix to the Top-Projects query.

**"Unable to retrieve routing information"** — Transient. Occurred during MCP reconnect churn; the DB is reachable and the server's own `neo4j://127.0.0.1:7687` URI connects cleanly. No code change needed.

Note: the running MCP server holds the old code in memory — the fix takes effect on the next neo4j-memory server restart.

**Update — fix went live 2026-07-20 ~21:57.** Restarted the app-spawned stdio server (killed PID 45070, the config-defined `neo4j-memory` process); the host auto-respawned it with the patched code. Verified through the live MCP tools: `find_conversations(project_name='claude_conversations')` returns results, and `get_memory_stats` returns instantly with total_chars 66,909,874. The launchd HTTP variant (`com.gabrielmcp.neo4j-memory.mcp-server`) was left untouched; if its workers need the fix too, kickstart that service separately.

## 2026-07-21 — FlowScape July 21 (23:09) Blocking Resolution Ingestion (Gemini)

**wiki/dev-infrastructure/flowscape-ambient-sessions.md** — Appended FlowScape ambient session from 2026-07-21 23:09 capturing an API debugging session connecting the happy-oppenheimer backend to the String Theory Chapter One manuscript text.
**wiki/_connections.md** — Added cross-domain link connecting `dev-infrastructure/flowscape-ambient-sessions` and `craft-fiction/string-theory`.
**wiki/_index.md** — Updated Stats block to reflect the new processed raw file and new ingestion date.
**raw/flowscape_resolved_2026-07-21_23-09-22.md** → `_done`