# ADR 0003 — Manuscript Prose Is Read-Only for All Agents

**Date:** 2026-06-10
**Status:** Accepted
**Decided by:** Claude (per agent protocol design session)
**Session context:** Establishing write-permission zones for multi-agent operation.

---

## Decision

Manuscript prose — in `manuscripts/` and any craft-fiction article containing narrative excerpts — is read-only for all agents unless Gabriel explicitly authorizes edits in the current session. This applies without exception to Claude, ChatGPT, Gemini, Cursor, and any future agent.

Authorization form: Gabriel says "you may edit this prose" or "rewrite this section" explicitly in the active session. No prior authorization carries over to a new session.

---

## Context

Manuscript prose represents Gabriel's creative voice. Unauthorized edits — even well-intentioned — could corrupt draft integrity, alter canon, or introduce voice inconsistency. The risk is asymmetric: no meaningful upside to accidental edits, severe downside (corrupted creative work, canon drift, voice contamination).

**Applies to:**
- String Theory manuscript files
- Aegis Cycle / BURNThrough manuscript files
- Any file containing narrative prose Gabriel has authored
- All agents: Claude, ChatGPT, Gemini, Cursor, and any future agent

---

## Precedent

2026-07-09: Atlas/ChatGPT began drafting Chapter 1 / Section 1 replacement prose in-chat (not writing to any SB file). Claude flagged this against this decision before confirming whether Atlas had in-session authorization. Gabriel confirmed Atlas had been given explicit in-session authorization and the work was in-chat only — no protocol breach. This demonstrates the correct escalation path when authorization is ambiguous.

---

## Consequences

Agents reading manuscript content for analysis, summary, or cross-referencing may do so freely. Only generation of new prose, editing of existing prose, or writing to files containing prose requires explicit in-session authorization.

**Reopening condition:** Gabriel establishes a formal editorial workflow with a named agent for specific manuscript work, changing the risk calculus.
