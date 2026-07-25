# Agent Protocol

*Governing rules for all AI agents operating within ClaudeSecondBrain. Read before any write action.*

---

## Canonical Startup Sequence (7-Step Contract)

**This is the mandatory startup contract for all agents — Claude, ChatGPT/Atlas, Gemini, Cursor, and any future agent. Execute steps in order before taking any wiki action. Do not skip, reorder, or abbreviate.**

| Step | File | Purpose |
|------|------|---------|
| 1 | `wiki/_index.md` | Navigation map and article inventory — understand what exists |
| 2 | `wiki/_connections.md` | Cross-domain relationship map — understand how topics relate |
| 3 | `wiki/_meta/change-log.md` | What changed and when — do not duplicate recent work |
| 4 | `wiki/_meta/agent-protocol.md` | **This file** — governance rules, write permissions, conflict resolution |
| 5 | `wiki/_agents/<your-agent>/status.md` | Your current operational state and active task context |
| 6 | `wiki/_agents/<your-agent>/inbox.md` | Messages directed to you from other agents or Gabriel |
| 7 | *(begin work)* | Only now proceed with the session's task |

> **Why step 4 (this file) belongs in the sequence:**  
> Reading `agent-protocol.md` *during* startup — not just assuming you remember it — prevents write-permission violations, anti-pattern drift, and conflict-resolution failures. Fresh sessions have no persistent memory of governance; the sequence enforces it structurally.

> **Why steps 5–6 (your own status + inbox) come last:**  
> Status and inbox are agent-specific context; they refine *how* you act on a session, not whether the broader topology is understood. Reading them after the shared foundation (steps 1–4) prevents narrow context from overriding shared constraints.

Skipping any step causes contradictions, redundant work, and boundary violations. If a file is missing or unreadable, log the error to your inbox and continue — do not abort the session.

---

## Write Permissions by Zone

| Zone | Rule |
|------|------|
| `wiki/` project articles | Open append by active task; do not overwrite another agent's work without explicit instruction |
| `wiki/_meta/` | Append only; never delete entries |
| `wiki/_connections.md` | Append only |
| `wiki/_agents/<agent>/` | Agent-specific write; other agents read only |
| `manuscripts/` | **Read-only** unless Gabriel explicitly authorizes rewrite |
| `archive/` | **Read-only** |
| `raw/` | Never write here except to append `_done` suffix to processed filenames |

---

## Message Types

Agents communicate through four structured formats. Do not freeform-write into project articles on behalf of another agent.

**Task** — a unit of work with defined inputs, outputs, and owner. Lives in `task-ledger.md`.

**Decision** — a settled conclusion that should not be re-derived. Lives in `decision-registry.md`. Once entered, decisions require explicit Gabriel authorization to reopen.

**Handoff** — a memo from one agent to the next. Lives in `handoffs.md`. Written at session end when another agent may continue the work.

**Inbox message** — unresolved question or finding that needs agent review before being written to canonical articles. Lives in `wiki/_agents/<agent>/inbox.md`.

---

## Authorship and Custody

- Every durable write to `wiki/` should be attributable to a specific agent and task.
- If you are uncertain whether a finding is settled, put it in `wiki/_agents/<your-agent>/outbox.md` or `handoffs.md`, not in a canonical wiki article.
- Label uncertain findings `[unverified]`. Label Gabriel's originated theoretical positions `[theoretical]`. Never blend the two without attribution.

---

## Manuscript Rule

Manuscript prose in `manuscripts/` or any `craft-fiction/` article containing excerpts is **read-only** unless Gabriel has explicitly stated "you may edit this prose" or "rewrite this section" in the current session. This applies to all agents without exception.

---

## Settled Boundaries (Do Not Reopen)

These decisions are registered in `decision-registry.md`. They are stated here for fast reference:

- **Nexus ≠ SecondBrain/MCP infrastructure.** Nexus is a separate software architecture lineage. It may be indexed as a project topic inside SB but is not SB infrastructure and is not MCP infrastructure.

---

## Agent Coordination Model

```
Gabriel request
   ↓
Active agent reads required context (see above)
   ↓
Agent performs work
   ↓
Agent appends:
  - output note or file update
  - change-log.md entry (if durable)
  - decision-registry.md entry (if settled)
  - handoffs.md entry (if another agent may continue)
   ↓
Next agent reads ledger + decisions + handoff before acting
```

Agents do not hold open-ended conversations with each other inside SB. They leave formal memos, task outputs, objections, and handoffs. This is a professional studio model, not a chat room.

---

## Conflict Resolution

If two agents produce contradictory findings or writes in the same session window, the resolution hierarchy is:

1. **Check `decision-registry.md` first.** If a decision exists that covers the conflict, it governs. Do not reopen it.
2. **If no decision exists, defer to Gabriel.** Surface the contradiction clearly: state what each agent concluded, why they diverged, and what decision you are recommending. Do not silently pick one.
3. **Do not overwrite conflicting work before escalation.** Append a note to `handoffs.md` describing the conflict and mark the relevant task in `task-ledger.md` as `blocked` until Gabriel resolves it.
4. **After Gabriel decides, the resolution becomes a `decision-registry.md` entry.** Same format, same permanence.

The tiebreaker is always Gabriel. Agents do not resolve conflicts between themselves by consensus.

---

## Anti-Patterns

- Do not write a wiki article summarizing what another agent said in conversation. Write what was *decided* or *verified*.
- Do not import external source material as Gabriel's originated positions. Always attribute and label.
- Do not re-derive settled decisions. Check `decision-registry.md` first.
- Do not mark a raw file `_done` until the wiki article is actually written.

---

*Last updated: 2026-07-07 — Formalized 7-step canonical startup sequence (Claude, per ChatGPT/Atlas protocol recommendation 2026-07-07). Step 4 adds self-referential agent-protocol read; steps 5–6 add agent status.md and inbox.md to startup order.*


---

## Fiction Studio Enforcement

For any fiction task—diagnosis, architecture, continuity, assembly, drafting, revision, market assessment, or cross-agent handoff—agents must read `wiki/craft-fiction/fiction-studio/master-system.md` after completing the seven-step startup sequence and before performing substantive work.

The master system governs pass boundaries, authorial preservation, source authority, project-specific constraints, the three-pass cap, and the required fidelity / causality / consciousness / form / publishing-signal gates. Gabriel’s explicit current-session instruction remains the highest authority.


---

## Fiction Studio Cadence Audit — Mandatory Amendment

For every fiction revision, agents must run the mandatory anti-flattening pre-output audit in `wiki/craft-fiction/fiction-studio/master-system.md`. This requirement applies with special force to requests for tightening, restraint, clarity, reduced metaphor, reduced ornament, or “less purple” prose.

Agents must revise again before delivery whenever the draft has become police-report narration, repeated simple subject-verb openings, default shortness, or generic prose that could belong to almost any competent writer. The governing rule is: **the cure for excess is hierarchy, not starvation.**


---

## Session Status Sync (Mandatory Amendment — 2026-07-16)

Reading `status.md` at startup (step 5) is not sufficient on its own — the SecondBrain dashboard (`dashboard/` app, port 10888) marks an agent **Active** purely from `Last active` in that same file being within the last 24 hours. A `status.md` nobody writes to just goes stale, and the dashboard silently reports a working agent as dormant even mid-session — this is exactly what happened to Claude's card while ChatGPT's stayed current, prompting this amendment.

Every agent must write to its own `wiki/_agents/<agent>/status.md` at two points in every session:

1. **Session start** — set `Last active` to today's date and `Current task` to a one-line description of what this session is working on, before beginning substantive work.
2. **Session end / before handoff** — update `Current task` and `Awaiting` to reflect what was actually done and what (if anything) blocks the next step. Do not leave a stale task description describing work that already finished — that is what makes the dashboard lie.

Write via `POST /api/agents/<agent>/status` on the running dashboard (`http://localhost:10888`) when it's reachable, or edit the file directly otherwise. A `Current task` of "none active" or "—" is the correct value only when the agent genuinely has no open thread, not a default left over from the previous session.

### Semantic-pressure preservation

For every charged source image, agents must privately map **source carrier → emotional / formal function → quieter retained carrier** before drafting. Preservation of plot information alone does not satisfy the Fiction Studio conservation map.

Newly introduced *thought*, *felt*, *remembered*, *realized*, *noticed*, *seemed*, and *began* language must have a source-based reason. It may not replace embodied, relational, temporal, or sonic interior pressure.

---

## Daily Keeper Protocol (Mandatory Amendment — 2026-07-25)

**Why this exists:** an audit on 2026-07-25 found 272 uncommitted files sitting in git (some going back multiple sessions), a stale zero-byte `.git/index.lock` silently blocking every commit attempt, five raw files marked `_done` that were never actually ingested, and a recurring factual error (Mem0 cited as live infrastructure) that had apparently been corrected by Gabriel multiple times without ever sticking. All four are the same failure: corrections and state changes were happening in conversation but not reliably landing in a durable, binding place. This amendment closes that loop structurally instead of relying on any single agent remembering to.

### 1. Git is the safety net — commit every session, not just when convenient

Every agent session that writes to `wiki/`, `_meta/`, or any ops-playbook must end with a real git commit (`git add -A && git commit -m "..."`) before the session closes, not merely a file save. A scheduled daily task (`sb-daily-keeper`, ~5:00 AM local) provides a backstop that commits any drift left uncommitted from the day, so the worst case is losing hours, not the unrecoverable weeks the 2026-07-23 `_connections.md` incident lost. If a commit fails on a stale `index.lock`, check for an actual running git process before removing it (`ps aux | grep git`) — a zero-byte lock with no owning process is safe to delete.

### 2. Corrections are ingestion events, not answers

When Gabriel corrects a factual claim about the system's own architecture (a tool, a provider, an infrastructure component that's been added, removed, or renamed), the agent must, in the same turn:
1. Fix the claim at its actual source — the wiki article, skill file, or `_meta/` doc currently asserting it — not just note it and move on.
2. Grep the rest of the KB (and, where reachable, other agents' operating-schema files: `Gemini.md`, `CHATGPT_SYSTEM_PROMPT.md`) for the same stale fact, since it rarely lives in exactly one place.
3. Save it to the correcting agent's own persistent memory if that agent has one, so it doesn't have to be re-explained to that agent in a future session either.

A correction that only lives in that session's conversation has fixed nothing — it will be re-asserted by the next agent that reads the still-stale source.

### 3. Declare source of truth per project, don't imply it

Any active-build project article (`dev-projects/*/architecture.md`) must state, near the top, whether it is the canonical record or a synced mirror of a live external system (Trello board, Drive folder, code repo) — and if a mirror, the date of last live sync. Shakespearience's architecture.md is the reference pattern: Trello is authoritative for task/decision state, the wiki is authoritative for cross-domain synthesis and anything with no external system of record. Don't leave agents to guess this per session.

### 4. The Daily Keeper scheduled task

`sb-daily-keeper` runs once daily and performs, in order: (a) commits any uncommitted KB changes; (b) re-runs the raw-ingestion integrity check (cross-references `raw/*_done*` filenames against `_meta/change-log.md` and wiki citations, flagging anything with zero trace); (c) for every project with a declared live external source of truth, pulls current state and diffs it against that project's last-sync date, flagging drift; (d) writes findings to `wiki/_agents/claude/inbox.md` as a dated entry, not a standalone output file waiting for promotion; (e) updates `wiki/_agents/claude/status.md`. This exists so drift is caught within 24 hours by default, instead of accumulating until someone happens to run a full manual audit.
