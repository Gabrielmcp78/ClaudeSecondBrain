# Raw Inbox Ingestion Audit — 2026-07-24

Requested by Gabriel following the 2026-07-23 `_connections.md` data-loss incident: verify that every file in `raw/` marked `_done` was actually ingested into the wiki, not just tagged and dropped.

## Method

163 files in `raw/`, all currently suffixed `_done`. For each, checked (1) `wiki/_meta/change-log.md` for a per-file ingestion entry, (2) every `wiki/**/*.md` file for a filename match or `(source: ...)` citation, (3) content spot-checks via `pdftotext`/`md5sum` for files that showed no match, to rule out renamed citations or byte-identical duplicates before calling something lost.

- Filename/citation match found somewhere in `wiki/`: 104 of 163
- No change-log entry at all: 116 of 163 (expected — per-file change-log discipline only started partway through the project; early bootstrap ingestion on 2026-06-02 and the ~44 FlowScape ambient dumps were never logged individually by design)
- No trace anywhere in `wiki/`, requiring manual investigation: 59 of 163, narrowed down below

## Confirmed gaps — content never made it into the wiki

Five files are genuinely marked `_done` with no corresponding wiki content anywhere. This violates the agent-protocol.md rule "do not mark a raw file `_done` until the wiki article is actually written."

1. **`monologues_done.pdf`** (244KB, playwriting monologue prompts/exercises) — not cited in `music-performance/acting-and-performance-pedagogy.md`, which cites the *Acting 3 Syllabus*, *Analyze This! U2.L1/L2*, and *Monologue Rubric v1* but not this file. Distinct teaching resource, currently invisible to the KB.
2. **`Yup cuz then the lock takes a unified greater mega...._done.pdf`** (135KB) — a fully-formed concept doc: "The Vision: An AI-Orchestrated, Dynamically Interoperable Web Development Ecosystem." Belongs in `dev-infrastructure/` or `ai-collaboration/`. No trace in the wiki at all.
3. **`claude and gabe cconvo on LOTS_done.pdf`** (194KB) — a Claude conversation transcript building a career-transition roadmap ("you don't need to become a coding expert to enter tech/AI"). Belongs in `ai-collaboration/` or a personal-strategy article. No trace in the wiki.
4. **`Gabriel McPherson_Resume_done.pdf`** (93KB, dated 2025-05, hospitality/arts-education framing) — a materially different resume from the one actually cited in `reference-external/gabriel-mcpherson-profile.md` (`GabrielMcPherson - Resume.pdf`). Verified by content diff, not a duplicate.
5. **`Gm resume Colect_done.pdf`** (20KB, OCR-style extracted resume text) — also uncited, though it overlaps in content with the resume version that *is* cited. Lower priority than #4.

## Self-flagged partial ingestion (already known, resurfacing it)

`wiki/craft-fiction/submission-strategy/agent-profiles.md` openly states agents 16–20 (from `Top 20 Agent Profiles.json`) and agents 34–40 (from `Top 21-40 agents for string theory.json`) were "not extracted into this article during the 2026-06-02 ingestion." The source JSON is correctly retained and cited, but ten agent profiles' worth of content is still sitting unextracted. Not new, but worth closing out while touching this area.

## Investigated and cleared — not actual losses

- **~44 `flowscape_context_*` / `flowscape_session_*` files (2026-06-06 through 2026-07-12)** — `wiki/dev-infrastructure/flowscape-ambient-sessions.md` states its own policy explicitly: these are ambient telemetry dumps, "most are marked `_done` immediately after review — they're working memory, not archival content." Only sessions that surfaced a notable pattern get written up. This is by-design triage, not loss.
- **`Top 20 Agent Profiles (1)_done.json`, `Top 21-40 agents for string theory (1)_done.json`** — confirmed byte-identical (`md5sum` match) to the versions already cited in `agent-profiles.md`. Duplicate uploads, correctly redundant.
- **`string-theory-chapter-index_done.md`** — its chapter/word-count table (20-chapter, Draft ~6.6 era) is fully superseded by `wiki/craft-fiction/string-theory/novel-structure.md`, which carries the current 27-chapter Draft 6.7 structure pulled live from the manuscript manifest. Correctly superseded, not lost.
- **Acting 3 Syllabus, Analyze This! U2.L1/L2, Monologue Rubric v1, all physics/VCH papers (GHRM, PHYSICS_*, compactification), Burnthrough_Draft_2.2, Nexus_collector1, the harmonic_unified_full*/interactive_unified HTML set, the master_* Nexus files, Harmonic_Resonance_SDK_PRD, the two "Letter to Humanity" files, both TED talk files** — all verified present via direct citation or content match in their expected wiki articles.

## Not related to this audit, but adjacent context

The 2026-07-23 change-log entry documents a separate, already-resolved incident: a launchd synthesis job was overwriting `wiki/_connections.md` wholesale every morning, destroying manually-curated cross-domain links back to bootstrap state. Root cause fixed, 13 connections reconstructed from change-log evidence, one batch (2026-07-16 Chapter 13 links) unrecoverable and flagged. That was a connections-map loss, not a raw-ingestion loss — but it's likely what prompted "since we lost things." This audit found no evidence that incident touched raw-file ingestion state; the `_done` markers and their gaps predate and postdate it independently.

## Recommended next steps (awaiting approval before executing)

1. Ingest `monologues_done.pdf` into `music-performance/acting-and-performance-pedagogy.md`.
2. Route `Yup cuz then the lock takes a unified greater mega....pdf` — new article in `dev-infrastructure/` (AI-orchestrated component ecosystem concept).
3. Route `claude and gabe cconvo on LOTS_done.pdf` — new article or section in `ai-collaboration/`.
4. Extend `reference-external/gabriel-mcpherson-profile.md` with the 2025 hospitality/arts-education resume framing from `Gabriel McPherson_Resume_done.pdf`; decide whether `Gm resume Colect_done.pdf` adds anything beyond what's already cited or can be noted as redundant.
5. Extract the missing agent profiles (16–20, 34–40) into `agent-profiles.md` from the already-cited JSON sources.

None of these have been executed. Say the word and I'll work through them in order.
