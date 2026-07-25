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
