# Monthly Health Check — 2026-07-18

*Requested by Gabriel following the ingestion-loop repair session. Last health check: 2026-07-07 (11 days prior). Audit only — no fixes executed. Per `CLAUDE.md`'s Monthly Health Check Procedure, awaiting Gabriel's approval before touching anything below.*

---

## Contradictions found

**`dev-infrastructure/nexus.md` violates the boundary it asserts.** This 1,155-byte file exists solely to state ADR 0002 — "Nexus is a separate software architecture lineage... should not be treated as part of ClaudeSecondBrain, SecondBrain, MCP, or the AI memory/retrieval infrastructure." It is filed inside `dev-infrastructure/`, the exact domain the file's own text says Nexus must not be merged into. It is also unlinked from `_index.md` — nobody would find it by browsing. The real, current Nexus article (`dev-projects/nexus/architecture.md`, 10KB, last touched 2026-07-08) is correctly placed and correctly indexed. Recommend: delete `dev-infrastructure/nexus.md` outright — its one useful sentence (the boundary rule) is already captured verbatim in ADR 0002 and `agent-protocol.md`'s Settled Boundaries section, so nothing is lost.

**`theory-consciousness/codex-lexicon.md` and `theory-consciousness/codex-harmonic-lexicon.md` are near-duplicate articles on the same topic**, created hours apart on 2026-07-07 (04:59 and 12:23), sourced from different raw files, with overlapping but non-identical content and different cross-link sets. Only `codex-harmonic-lexicon.md` is indexed; `codex-lexicon.md` is an orphan. This is exactly the fragmentation `CLAUDE.md` rule 5 ("one file per major topic, no micro-stubs") exists to prevent. Recommend: diff the two in full, merge into `codex-harmonic-lexicon.md`, delete `codex-lexicon.md`.

## Unverified / misattributed claims

**Governance labeling is far less complete than the task ledger currently reflects.** `TASK-2026-07-16-005` scopes the labeling gap to four VCH/GHRM files and is marked paused/low-priority. The actual gap is wider: every core String Theory canon file — `chapter-summaries.md`, `characters.md`, `literary-manuscript-david-lang.md`, `manuscript-manifest.md`, `novel-structure.md`, `project-argo.md`, `resonance-model.md`, `string-theory.md`, `themes-and-canon.md` — carries **zero** `[verified]`/`[theoretical]`/`[creative-canon]`/`[inference]` labels, as do several theory-consciousness files (`codex-harmonic-lexicon.md`, `codex-harmonic-system-prompt.md`, `compactification-visualizations.md`, `ghrm-lhc-validation.md`, `ghrm-toy-model.md`, `hrif-protocol.md`). This matters specifically because these are the files most likely to mix Gabriel's originated fiction/theory with real historical or scientific fact (Newton, du Châtelet, Helmholtz/Chladni in `chapter-13-visions-and-burdens.md`'s research-verification table exist; the unlabeled files around them do not consistently make the same distinction visible at a glance). Recommend: widen `TASK-2026-07-16-005`'s scope rather than treating VCH/GHRM as the whole problem.

## Stale articles

- `dev-projects/geminichat/architecture.md` — self-flagged `[historical: 2026-06-05]`, "re-verify before any work." Still true; nothing has touched it since. Not urgent unless GeminiChatter work resumes.
- No other article failed the mtime-based staleness check (nothing in `wiki/` is older than 60 days untouched) — this KB's staleness problem is content drift, not neglect, which is a healthier failure mode than it could be.
- `novel-structure.md`'s `[historical: 2026-05, unconfirmed]` flag on musical-form designations (fugue/passion/suite/symphony/passacaglia attributions) was checked directly — it is still accurate and still unresolved even after the 2026-07-16 rebuild to the 27-chapter structure. Not a stale flag; a correctly-standing one.

## Orphaned articles

Confirmed unlinked from `_index.md` (16 real content files, after excluding the 12 ops-playbooks — those are reachable via `dev-projects/shakespearience/ops-playbooks/_index.md`, which *is* indexed, so that's a two-click nav pattern, not a genuine orphan):

- `ai-collaboration/agent-mail-carrier.md` — documents the mail-carrier script proven across 5 real Atlas↔Claude exchanges (see change-log 2026-07-09). Real, working infrastructure, completely undiscoverable from the index.
- `craft-fiction/string-theory/manuscript-manifest.md` — the canonical-source routing history, referenced by name in multiple change-log entries, never indexed.
- `craft-fiction/submission-strategy/{editor-agent-research-standard.md, editorial-board-model-registry.md, editorial-board-simulation-protocol.md, run-editorial-board.md}` — the entire "Editorial/Agent Simulation Reliability System" built 2026-07-14 (see change-log). A whole subsystem, invisible from `_index.md`.
- `theory-consciousness/codex-lexicon.md` — see Contradictions above; likely resolved by merge/delete rather than by indexing.
- `dev-infrastructure/nexus.md` — see Contradictions above; likely resolved by deletion rather than by indexing.

## Unprocessed raw files

None. `raw/` is clean as of this check — confirms today's ingestion-loop fix is holding.

## Missing connections

`_connections.md` itself has zero broken links (every referenced file exists) — that layer is in good shape. But the orphaned clusters above are also, by definition, absent from `_connections.md`: the Editorial Board system has no documented relationship to `craft-fiction/fiction-studio/` despite both governing manuscript-facing AI judgment (Fiction Studio for prose, Editorial Board for market/agent simulation) — that's a real missing cross-link once the orphan is resolved, not just a missing index entry.

## Suggested new articles or cross-links

1. Once `ai-collaboration/agent-mail-carrier.md` is indexed, cross-link it to `ai-collaboration/agent-operating-model.md` (the inter-agent communication protocol section references mail carrier by name already, but the link doesn't run the other direction).
2. Once the Editorial Board cluster is indexed, add a `_connections.md` entry: Editorial Board (agent/acquisition simulation) ↔ Fiction Studio (prose craft) — both are manuscript-judgment systems built independently in the same week (2026-07-14 and 2026-07-16) and likely share more infrastructure than currently documented.

---

## What this does and doesn't mean

Everything above is real and checkable — every claim in this report was verified against the actual files, not inferred from memory of past change-log entries. None of it is severe: no factual contradictions in canon, no fabricated sources, no manuscript prose was touched to produce this audit. It's mostly filing-cabinet drift — real work that got done but never got hooked into the index, plus a labeling discipline that's been declared but not finished. That's the ordinary cost of a system that's been shipping fast across multiple agents; it's exactly what monthly health checks exist to catch before it compounds into something worse (an orphaned article nobody finds is one step from becoming a duplicated article nobody notices is a duplicate).

No fixes have been made. Per protocol, this report is the audit; execution needs your go-ahead.
