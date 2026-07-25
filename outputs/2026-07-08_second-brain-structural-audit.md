# Second Brain — Structural Audit (What It Does vs. What It Says)

*Requested by Gabriel, 2026-07-08. Sources: CLAUDE.md, wiki/_index.md, wiki/_connections.md,
wiki/_meta/*, wiki/_agents/*, raw/ directory listing, outputs/ directory listing,
/Volumes/Ready500/DEVELOPMENT/FlowScape/Sources/FlowScape source tree.*

---

## Verified working (not aspirational)

- Raw→wiki pipeline: traceable, dated, source-to-article provenance in change-log.md.
- Multi-agent mailbox: ChatGPT→Claude protocol handoff on 2026-07-07, actually acted on same day.
- Decision registry loop: Nexus/SecondBrain conflation caught, resolved, permanently registered,
  now cited as settled boundary — the compounding loop's clearest working example.
- 2026-07-08 Shakespearience dashboard fix: real IPC handler, real component, verified via
  node --check and vite build. Meets the KB's own zero-placeholder directive.

## Failure 1 — FlowScape documented from its own logs, not its source

`wiki/dev-projects/flowscape/architecture.md` states its file list is "inferred from logs and
file names." Real source tree (18 files) includes KeychainVault.swift, ToolForge.swift,
SecondBrainBridge.swift, PatternEngine.swift, FlowRailEngine.swift — none documented anywhere
in the KB. The component with the broadest ambient access (filesystem, clipboard, browser) has
the thinnest actual oversight.

## Failure 2 — "Continuous ambient logging" is false as stated

Session file dates: Jun 6, 8, 10-11, one snapshot Jun 16, dead gap to Jun 30, gap to Jul 7.
Intermittent, not continuous. Correlates with repeated low-memory warnings (38% free) in
FlowScape's own synthesis output around the same dates it goes silent.

## Failure 3 — Auto-ingestion has a known, logged, unfixed boot-race failure

`com.gabrielmcp.secondbrain.ingest` exits 78 at boot — external volume not mounted when launchd
starts it. Six other launchd services in the same broken state (mem0-services, manuscriptwatcher,
memoryserver, two rebuild-watch services, mem0-apple-intelligence). Logged in change-log,
never actioned. Tailscale tunnel needed manual repair twice in one week despite being documented
"permanent, survives reboots."

## Failure 4 — Master index is stale on its own numbers

`_index.md` claims "Outputs generated: 3." Actual outputs/ directory has 13 files. 4x miss,
undetected by the 2026-07-07 health check.

## Minor — dead scaffolding and inbox conflation

All four agent status.md files are empty templates, never populated, despite being mandatory
step 5 of the 7-step startup contract every session. claude/inbox.md mixes governance-critical
protocol messages with personal test pings at equal weight, append-only, forever.

## Live item, not historical

TASK-MRCIJDA6 (created 2026-07-08, high priority): Gabriel is not the Shakespearience narrator
— he is CTO/creative consultant/co-founder. Still pending in
dev-projects/shakespearience/architecture.md as of this audit.

## Recommendations, in priority order

1. Read FlowScape's actual source (18 files) and rewrite architecture.md from it, not from logs.
   Specifically account for KeychainVault.swift and ToolForge.swift — what credentials, what
   tool-generation/execution capability, if any.
2. Fix the boot-order race on com.gabrielmcp.secondbrain.ingest (wait-for-volume already exists
   in the wrapper per secondbrain-mcp-infrastructure.md — the ingest launchd entry apparently
   doesn't use the same wrapper pattern).
3. Health check should diff _index.md stats against real directory counts programmatically,
   not by eyeballing.
4. Split wiki/inbox.md and agent inboxes: governance channel vs. personal-note channel.
5. Close TASK-MRCIJDA6 — Shakespearience role correction.
