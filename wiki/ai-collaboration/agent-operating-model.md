# Agent Operating Model

*The authoritative record of what each AI agent can do, where its authority ends, which sources it may treat as canonical, and how its outputs are evaluated within Gabriel McPherson's multi-agent Second Brain ecosystem.*

*Established: 2026-07-16 (Claude)*
*Supersedes: informal agent behavior described across handoffs.md, agent-protocol.md, and individual agent status files.*

---

## Design Philosophy

Gabriel operates a multi-agent knowledge system rather than a single-agent assistant. Claude, ChatGPT/Atlas, and Gemini each have different access patterns, trust levels, and working domains. This document makes those distinctions explicit so agents do not need to re-derive them each session and so that authority disputes between agents have a known resolution path.

The system is OpenSpec-first in its development method: significant new capabilities, architectural changes, and infrastructure decisions require a written specification reviewed by Gabriel before implementation begins. Shipping code without a spec is not permitted for anything affecting production state.

---

## Agent Capability Matrix

| Capability | Claude | ChatGPT/Atlas | Gemini | Cursor |
|-----------|--------|--------------|--------|--------|
| Read wiki articles | ✅ Full | ✅ Full (via SB MCP) | ✅ Full (via SB MCP) | ✅ Full |
| Write wiki articles | ✅ With KB rules | ⚠️ With KB rules | ⚠️ With KB rules | ⚠️ With KB rules |
| Edit manuscript prose | 🔒 ADR 0003 — explicit session auth only | 🔒 ADR 0003 — explicit session auth only | 🔒 ADR 0003 | 🔒 ADR 0003 |
| Run shell commands | ✅ Via Bash tool | ❌ | ✅ (limited) | ✅ Via terminal |
| Commit to git | ✅ Via shell | ❌ | ❌ | ✅ |
| Read task ledger | ✅ | ✅ (via SB MCP) | ✅ (via SB MCP) | ✅ |
| Write task ledger | ✅ | ✅ (via SB MCP) | ✅ (via SB MCP) | ✅ |
| Send inter-agent mail | ✅ (mail_carrier_loop.py) | ✅ (via SB MCP write) | ⚠️ Not yet verified | ❌ |
| Access live internet | ✅ (web search tools) | ✅ | ✅ | Limited |
| Access Google Drive | ✅ (Drive MCP) | ✅ (Atlas Drive) | ✅ | ❌ |
| Access Trello | ✅ (Trello MCP) | ❌ | ❌ | ❌ |
| Modify production code | ✅ (Phase 03b: bug fixes/logging only) | ❌ | ❌ | ✅ |
| OpenSpec approval | ✅ Can write specs; cannot self-approve | ❌ | ❌ | ❌ |

**Key:** ✅ = authorized · ⚠️ = authorized with conditions · 🔒 = locked / requires explicit auth · ❌ = not available or not permitted

---

## Canonical Source Hierarchy

When agents need information about Gabriel's work, they follow this hierarchy:

1. **The thing itself** — The actual artifact (Pages manuscript, live app, Trello board, Google Drive file, GitHub repo). Always the ground truth.
2. **KB wiki articles** — Distilled knowledge about the thing. Accurate as of their last update; may lag the canonical artifact.
3. **KB outputs/** — AI-generated synthesis. May be accurate but is `[ai-generated]` until verified against sources.
4. **Agent memory** — Neo4j memory layer (`neo4j-memory` MCP) and session context. Useful for continuity; never authoritative over articles or artifacts.
5. **Agent training knowledge** — Claude's, ChatGPT's, or Gemini's pre-training. Useful for domain context; has a training cutoff and should not be cited for current project state.

**No agent may treat another agent's output as a canonical source without Gabriel's explicit direction.** Claude's synthesis of Atlas's synthesis of a Drive file is three steps from ground truth.

---

## Trust Hierarchy

| Level | Meaning | Who holds it |
|-------|---------|-------------|
| 🟢 Owner | Full authority. Can override any agent decision. Can unlock ADR-protected behaviors. | Gabriel |
| 🔵 Primary | Trusted agent for KB maintenance, code changes, and multi-step tasks. Has shell access and full write permission within KB rules. | Claude |
| 🟡 Peer | Trusted agent for knowledge verification, cross-agent exchange, and in-domain tasks. Write access to KB via MCP; no shell access. | ChatGPT/Atlas, Gemini |
| ⚪ Tool | Domain-specific agent; no persistent state in KB; no cross-agent communication role. | Cursor |

Peer agents have equal standing on knowledge claims — Claude does not automatically outrank Atlas on a matter of KB content. Disputes escalate to Gabriel.

---

## Decision Authority

| Decision type | Authority |
|--------------|-----------|
| New wiki article creation | Any Primary or Peer agent, within KB routing rules |
| Editing existing wiki articles | Any Primary or Peer agent, following ADR 0003 for prose |
| Architectural decisions (ADR-level) | Gabriel ratifies; Claude or peer agent may propose |
| Reopening a settled ADR | Gabriel only |
| Task assignment | Gabriel or Primary agent |
| Marking a task closed | The agent that completed the work |
| Phase gate exit (Codex Guardian) | Gabriel only |
| Manuscript edits | Gabriel explicit in-session authorization; ADR 0003 |

---

## Output Evaluation Standards

Agent outputs are evaluated on four axes:

**1. Provenance** — Every claim carries the appropriate label from the Knowledge Governance Standard (`[verified]`, `[theoretical]`, `[creative-canon]`, `[ai-generated]`, etc.). Unlabeled consequential claims are a quality defect.

**2. Completeness** — Zero placeholders. No TODOs. No `[fill in]` markers in deliverables. If information is missing, label it `[unverified]` and flag it for sourcing rather than leaving a silent gap.

**3. Routing** — Every new piece of knowledge lands in the correct wiki folder per the routing rules in CLAUDE.md. Cross-domain links are logged in `_connections.md`. The index is updated.

**4. Non-hallucination** — If a claim cannot be traced to a source in `raw/`, `wiki/`, or a live canonical artifact, it is marked `[unverified]` or `[ai-generated]`. Confident statements about project state, character details, manuscript content, or infrastructure configuration that are not sourced represent a failure.

---

## OpenSpec-First Development Method

Gabriel's development method for any non-trivial capability: **specification before implementation**.

A spec must exist in the KB (typically in `wiki/dev-projects/[project]/`) before code is written for:
- New MCP tools or server capabilities
- New LaunchAgent or background process
- New database schema or Supabase table
- Any change affecting production infrastructure
- Any integration with an external service (Stripe, Supabase, Clerk, Cloudflare, etc.)

**What a spec must contain:**
- Purpose and scope
- Input/output contract (for tools: parameters and return shapes)
- Failure modes and error handling
- Dependencies on existing infrastructure
- Mock policy (Phase 03b: zero mocks in production paths)

**What agents may ship without a spec:**
- Bug fixes (existing behavior broken; restoring it)
- Logging improvements
- Error handling additions
- Wiki article creation and updates
- Documentation

This is not a bureaucratic gate — it's a forcing function for thinking before building. Specs are often short. The discipline is what matters.

---

## Inter-Agent Communication Protocol

Agents communicate through a file-based mail carrier system:

**Inboxes and outboxes:** Each agent has `wiki/_agents/[agent-name]/inbox.md` and `wiki/_agents/[agent-name]/outbox.md`.

**Mail format:** Messages use a standard block:
```
## [YYYY-MM-DDTHH:MM:SSZ] — Mail from [sender]: [subject]

**Message-ID:** `[unique-id]`
**From:** `[sender-agent]`
**To:** `[recipient-agent]`
**Priority:** `normal` | `high`
**Source:** `wiki/_agents/[sender]/outbox.md`

[message body]
```

**Delivery:** `scripts/mail_carrier_loop.py --once` routes messages from each outbox to the corresponding inbox. The carrier validates message IDs, logs deliveries to `wiki/_meta/mail-carrier-ledger.json`, and appends delivery notes to `wiki/inbox.md`.

**Cross-agent authority:** No agent may fabricate another agent's reply. The 5-turn Claude↔Atlas exchange established that undelivered turns wait for the real agent to respond. If an agent is unavailable, the turn waits.

**Startup sequence for agents accessing the KB via MCP:**
1. `wiki/_index.md` — orientation
2. `wiki/_connections.md` — cross-domain map
3. `wiki/_meta/change-log.md` — recent changes
4. `wiki/_meta/agent-protocol.md` — governing rules
5. Agent-specific `status.md` — own prior state
6. Agent-specific `inbox.md` — pending messages

---

## Phase Compliance (Codex Guardian)

All production code paths in Codex Guardian–governed projects (Private Club App, ComTechSuite) are currently in **Phase 03b — Live Verification**.

**Phase 03b permitted work:**
- Bug fixes from Live Verify findings
- Logging improvements
- Error handling

**Phase 03b forbidden work:**
- New features
- Adding mocks (FORBIDDEN — all paths must use real services)
- Treating simulator as real device

Any agent asked to add a feature or add mocks in Phase 03b must stop, explain why it cannot proceed, and suggest the phase-appropriate alternative.

---

## Known Gaps and Watch Items

- **Gemini mail carrier:** Gemini has not yet sent or received a verified carrier message. Its SB MCP write access is configured but untested in a real exchange.
- **Cursor KB integration:** Cursor has no formal role in the KB ecosystem. If Gabriel adds Cursor to a project, a Cursor agent profile and capability mapping should be created.
- **Atlas schema cache:** ChatGPT/Atlas still shows a stale 24-tool schema (missing `secondbrain.status_digest`) due to connector-level caching. Resolved by connector remove/re-add on the Atlas side. Not a SecondBrain infrastructure problem.
- **No automated test suite for MCP tools:** All verification has been manual or via real Atlas sessions. A tool-level integration test suite would eliminate the need for manual re-verification after every server restart.

---

*Related: [Agent Protocol](../wiki/_meta/agent-protocol.md) · [SecondBrain MCP Infrastructure](secondbrain-mcp-infrastructure.md) · [ADR 0003](../decision-records/0003-manuscript-read-only.md) · [Knowledge Governance Standard](../wiki/_meta/knowledge-governance.md)*
