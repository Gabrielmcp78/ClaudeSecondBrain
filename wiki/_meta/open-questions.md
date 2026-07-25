# Active Tensions

*Not problems. Not TODOs. Unresolved intellectual tensions — the generative edge of the system.*
*The highest-value ideas usually emerge from here, not from solved questions.*

---

## Format

Each tension gets: the question, the competing positions, what would resolve it, and confidence in current working answer (0–100).

---

## Theory of Consciousness / VCH

**Is 68.48 Hz a carrier frequency or a manifestation frequency?**
Carrier theory: the frequency transmits information encoded elsewhere.
Manifestation theory: the frequency IS the phenomenon — consciousness at that resonance simply is the 68.48 Hz state.
Resolving evidence: biological keying experiments, multigenerational transmission data.
Current lean: manifestation. Confidence: 55.

**Does VCH require quantum effects, or is classical resonance sufficient?**
Quantum position: coherence mechanisms at the neural level require quantum processes (Penrose-Hameroff territory).
Classical position: macroscale electromagnetic resonance is sufficient; quantum effects are incidental.
Resolving evidence: decoherence timescales in warm biological tissue vs. observed coherence windows.
Current lean: classical sufficient, quantum not required but not excluded. Confidence: 60.

**What is the strongest steelman criticism of GHRM?**
The λ5D coupling constant is derived from simulation, not experiment. The LHC methodology assumes the model it tests. This is circular if the harmonic susceptibility parameter is tuned to produce the result.
Resolving evidence: independent derivation of λ5D from first principles without assuming harmonic dominance.
Current lean: the circularity concern is legitimate and needs addressing before external publication. Confidence in the concern: 80.

---

## Fiction / String Theory

**Is the Solar Maximus hypothesis in Chapter 7 a metaphor or a falsifiable claim?**
If metaphor: it's a thematic device and internal consistency is the only standard.
If falsifiable: the historical dataset needs to hold up to external scrutiny, or the chapter becomes a liability in literary submission.
Resolving evidence: independent check of the dataset. Historical birth records vs. solar cycle data.
Current lean: treat as falsifiable, verify before querying agents. Confidence: 70.

**Does the 68.48/86.84 Hz pair require a third frequency to form a complete system?**
The φ-scaled ladder implies a third resonance above 86.84 Hz. The novel has not addressed this.
If yes: what is it, and does it appear in the narrative or only in the white paper?
Current lean: yes, there is a third. Not yet named. Confidence: 65.

---

## Infrastructure / launchd

**7 launchd agents failing at system boot — what is the remediation path?**
*(source: outputs/2026-07-07_system-work-shakespearience-update.md, captured 2026-07-07)*
The following agents are broken. Status as of July 7; re-verify before assuming current.

- `com.gabriel.mem0-services` — exit 127 (binary missing)
- `com.gabriel.manuscriptwatcher` — exit 78 (volume not mounted at boot)
- `com.gabrielmcp.memoryserver` — exit 78 (volume not mounted at boot)
- `com.gabrielmcp.secondbrain.ingest` — exit 78 (volume not mounted at boot) *[superceded by ingest-watcher with boot-race fix, 2026-07-17]*
- `com.gabriel.burnthrough-rebuild-watch` — exit 1
- `com.gabriel.manuscript-rebuild-watch` — exit 1
- `com.gabriel.mem0-apple-intelligence` — exit 1

Exit 78 agents share the boot-race root cause fixed in `ingest.sh` on 2026-07-17; that pattern can be applied to the others. Exit 127 (mem0-services) requires locating or reinstalling the missing binary. Exit 1 agents need log inspection.
Competing positions: apply boot-race pattern across all exit-78 agents in a single maintenance pass (fast) vs. assess each individually (safer, slower).
Resolving evidence: `launchctl list` to verify current state; log inspection for exit-1 agents.
Current lean: batch fix exit-78 agents first, investigate exit-1 agents separately. Confidence: 80.

**UPDATE 2026-07-18 — the "fixed" ingest-watcher is still exit 78, and it's not the boot-race bug this time.**
Live-diagnosed via Desktop Commander (see change-log 2026-07-18). `com.gabrielmcp.secondbrain.ingest-watcher` (the supposedly-fixed successor job) shows `last exit code = 78: EX_CONFIG` even immediately after a manual `launchctl kickstart -k`, with zero output to `ingest.log`, `ingest-error.log`, or the `/tmp` boot-race fallback the fix added — meaning launchd refuses to exec the job before `/bin/zsh` (which has confirmed Full Disk Access) ever starts. This is launchd itself rejecting a LaunchAgent whose `ProgramArguments` points straight at a script on an external volume, not the volume-not-mounted-at-boot race the July 17 fix addressed. `outputs-review` (daily cron) is in the same state — loaded, exit 78, zero log output ever. Original confidence-80 lean above (batch-apply the boot-race pattern) does not hold for these two jobs; the boot-race pattern is not the active failure. Candidate fix, not yet tried: point the LaunchAgent at a thin trigger script stored on local/boot disk (e.g. `~/Library/Application Support/secondbrain/` or `/usr/local/bin/`) that `cd`s to the external volume and execs the real `ingest.sh`, rather than referencing the external-volume path directly in `ProgramArguments`. Needs testing before trusting it.

**RESOLVED 2026-07-18 (same day, later).** Root cause was narrower than the local-trigger theory above: `StandardOutPath`/`StandardErrorPath` pointing at the external volume, not `ProgramArguments`. launchd opens those fds before exec, before the child's FDA grant applies — that open() failing is what produced EX_CONFIG. Fixed by moving both to local paths under `~/Library/Application Support/secondbrain/logs/`; the real scripts still write their canonical output to the external volume once running. Verified live, cold, unattended: `bootout` + `bootstrap` + `kickstart -k` on both jobs, both exited 0, `outputs-review` correctly rewrote `wiki/_agents/claude/inbox.md`, `ingest-watcher` fully processed the one pending raw file end-to-end (read `Gemini.md`, wrote a wiki entry, updated `_connections.md`/`_index.md`/`change-log.md`, renamed to `_done`) via the new `agy` (Antigravity CLI) provider — see below. Also separately discovered and fixed: the default provider (`gemini`) was dead (Google deprecated the gemini-cli free tier 2026-07-18), switched to `agy` (free, no API billing); first live run under `agy` hit its 5-minute default `--print-timeout` mid-task with no partial damage, raised to 20 minutes in `ingest.sh`; second run completed cleanly in ~14 minutes wall-clock. The loop is confirmed live and unattended as of 2026-07-18. Confidence 95 — one real-world run proves the mechanism works; worth re-verifying after it fires on its own via a genuine new `raw/` drop rather than a manual kickstart.

---

## Development / Nexus

**Is Nexus fundamentally a protocol problem or an ontology problem?**
Protocol position: the challenge is standardizing message formats across heterogeneous systems. Solved with sufficient schema design.
Ontology position: the challenge is that systems have incompatible models of what entities and relationships mean. Protocol alone cannot fix this — shared ontology must precede protocol.
Resolving evidence: whether semantic tag conflicts in the test corpus are resolvable by better tagging or require ontology alignment.
Current lean: ontology first, protocol second. Confidence: 70.

---

## AI Collaboration

**Can AI systems maintain genuine continuity across sessions, or is session-start initialization always required?**
Continuity position: persistent memory (Mem0, Neo4j, shared filesystem) constitutes genuine continuity.
Reset position: without reloading context, each session starts cold regardless of stored data — the stored data is inert until read.
Resolving evidence: whether AIs acting on stored context without re-reading it produce consistent results.
Current lean: initialization is always required; continuity is a quality of the stored data, not the AI. Confidence: 75.

**At what point does an AI's contribution to a creative work constitute co-authorship vs. tool use?**
Not resolved. No current lean. Watching for emerging legal/artistic precedent.
