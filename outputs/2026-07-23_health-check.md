# ClaudeSecondBrain — Monthly Health Check
Date: 2026-07-23
Run by: Claude (per Gabriel's request via `/anthropic-skills:second-brain-kb`)
Scope note: full raw/ queue confirmed clean; wiki orphan/contradiction sweep is based on `_index.md`, `_connections.md`, `_meta/change-log.md`, `_meta/task-ledger.md`, `_meta/open-questions.md`, `_meta/decision-registry.md`, and direct listing of `dev-projects/`, `craft-fiction/aegis-cycle/`, and `synthesis/` — not a line-by-line read of all 143 wiki articles. Flagged below wherever confidence is anything less than full.

---

## Auto-loop verification (the question you actually asked)

**Status: healthy, and independently confirmed via a genuine autonomous firing — not just a manual kickstart.**

- `logs/ingest.log` shows a severe malfunction period on 2026-07-18: the watcher re-triggered every 10-20 minutes against one stuck file, `gemini-cli` (the free-tier provider) was returning dead-service errors, and `agy` (the replacement provider) was timing out on search. This is fully diagnosed and closed — see `task-ledger.md` → `TASK-2026-07-18-001`, marked CLOSED. Root cause: `StandardOutPath`/`StandardErrorPath` in the launchd plist pointed at an external volume not yet accessible to the child process at fd-open time (`EX_CONFIG`, exit 78), compounded by rclone's Inbox→raw one-way sync never marking Drive-side sources done. Fix: log paths moved to local disk under `~/Library/Application Support/secondbrain/`, and `reconcile_done_files()` was added to `sync.sh`.
- `open-questions.md` had left this fix flagged at 95% confidence pending one condition: re-verification "after it fires on its own via a genuine new raw/ drop rather than a manual kickstart."
- The Jul 21-22 tail of `ingest.log` satisfies that condition directly: clean, correctly-spaced runs, two legitimate "No pending files — skipping" no-ops (proof the watcher isn't just brute-force re-processing), and a final clean completion at "Wed Jul 22 22:03:17 CDT 2026: Ingestion complete."

**Conclusion: the loop is not just fixed, it's proven itself in production since the fix.** Two things I can't verify from inside this session and would ask you to spot-check locally:
1. Whether `ingest-watcher` and `outputs-review` are still actually *loaded* in `launchctl` right now (I only have repo-file evidence, not live process state). A quick `launchctl list | grep secondbrain` or `./launchd/install.sh --status` would close this out.
2. The repo has `logs/ingest.log` but no `sync.log` or `outputs-review.log`, and `launchd/` only version-controls two plists (`ingest-watcher`, `outputs-review`) — no `sync` or `dashboard` plist, despite both being described in `change-log.md`. Most likely explanation: those logs now live under the local-disk path from the Jul 18 fix and simply aren't synced into this mounted copy of the repo, which would be benign. Worth a 10-second confirmation next time you're at the machine.

---

## Unprocessed raw files

**None.** `raw/*` and `raw/*_done*` return the identical count (155) and the identical file list in every subset checked. Every file in the queue carries the `_done` suffix. Nothing is waiting on ingestion.

---

## Stale articles

Two flagged inside `_index.md` itself, both still unresolved as of this sweep:

- `novel-structure.md` and `chapter-summaries.md` — marked `[historical: 2026-05 — re-ingest pending]`, describing a structure that predates the current 27-chapter String Theory structure. These are actively misleading if queried without the flag being seen first.
- `geminichat/architecture.md` — marked `[historical: 2026-06-05 — re-verify before any work]`.

None of the three have been re-ingested since being flagged. Recommend prioritizing `novel-structure.md`/`chapter-summaries.md` given String Theory is your most active creative project.

---

## Orphaned articles

Not conclusively resolved this pass — the earlier full `wiki/**/*.md` glob truncates at 100 of 143 files no matter how it's called, and a genuine orphan check requires diffing every file against every link in `_index.md`. Directory-by-directory listing (this session) confirms `dev-projects/` and `craft-fiction/aegis-cycle/` are both fully linked and current, so if orphans exist they're most likely in the domains I didn't re-list individually (`theory-consciousness/`, `music-performance/`, `reference-external/`, `ai-collaboration/`). Flagging as incomplete rather than clean — recommend a follow-up pass scoped just to those four folders if you want this fully closed out.

---

## Unverified / misattributed claims

No new instances surfaced this pass. Nothing in `decision-registry.md` shows a decision resting on an unsourced claim that's since been sourced (or vice versa) — all entries there remain internally consistent with their stated rationale and reopening conditions.

---

## Contradictions found

None identified between the documents reviewed this pass. Worth naming one adjacent risk rather than a contradiction: the Aegis Cycle / BURNThrough folder now holds seven working documents from a single day (2026-07-20 — ch1/ch2 department review, jalen/soren insertion map, ch3-ch6 transfer board, opening name ledger, opening pass R01, ch7-ch13 continuity bridge) plus `burnthrough-current-state.md`. Your own `status.md` (pre-sweep) shows the opening pass was still awaiting your review as of Jul 20 and explicitly not to be canonicalized without instruction — so as long as `burnthrough-current-state.md` hasn't silently absorbed any of the six pending documents as settled, there's no actual contradiction. Worth a glance next time you're in that folder to confirm `current-state.md` still reflects only what you've approved.

---

## Missing connections

`_connections.md` (regenerated 2026-07-22 via `sbcc bridges`, cosine ≥ 0.74 over 103,331 chunks) is current and looks healthy — Strong/Medium/Ambient tiers all populated, including the good catch on `FlowScape Ambient Session Log ↔ Fiction Studio`. Nothing missing that I can see against today's work specifically: this session's own DKIM/Drive/2FA/Trello updates are Shakespearience-domain, and Shakespearience is already well-connected in the map (`Shakespearience ↔ claude_conversations`, `ChatGPT Archive (Top) ↔ Shakespearience`). No new cross-domain bridge needed from today's infrastructure work.

---

## Suggested new articles or cross-links

1. Promote the five stuck `outputs_review.py` candidates sitting in your inbox since 2026-07-17 with no promotion action taken in 5+ days: the four String Theory Chapter 1 experimental passes (scores 45-52/100) and the Chapter 9 cold-panel review (45/100). These are just sitting there generating the same daily report over and over. Either promote the highest-scoring one (`...experimental-7-2-full-studio-review.md`, 52/100) into `craft-fiction/`, or explicitly mark them not-for-promotion so the daily report stops flagging them.
2. A short `dev-projects/shakespearience/ops-playbooks/` addendum capturing today's three completed infra items (DKIM live, Shared Drive structure built + handed to Gemini for folder completion, 2FA deferred with a 2-week reminder) would close the loop between what Trello now shows and what the wiki knows — right now this is only in Trello, not yet in the wiki's durable record.

---

## Bottom line

The thing you actually asked about — is the auto-loop really running — checks out with real evidence, not just a clean bill of health from the same system that broke five days earlier. The raw queue is fully drained. The main open items are administrative: two stale articles that have been flagged but not re-ingested, one incomplete orphan sweep (four domain folders not individually verified this pass), and five outputs sitting unpromoted for almost a week. Nothing here requires or justifies a fix without your go-ahead — per protocol, I'm holding here for your review before touching any wiki content.
