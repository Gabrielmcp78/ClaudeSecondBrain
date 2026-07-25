# Decision Registry

*Settled conclusions. Do not re-derive without explicit Gabriel authorization. Append only — never delete entries.*

---

## Format

```md
## DECISION-[YYYY-MM-DD]-[slug]

Date: YYYY-MM-DD
Decided by: [agent or Gabriel]
Session context: [brief description of what prompted the decision]

Decision:
[The settled conclusion, stated precisely.]

Applies to:
- [where this decision governs agent behavior]

Rationale:
[Why this was decided this way. The evidence or reasoning that makes it stable.]

Reopening condition:
[What new evidence or explicit instruction would warrant revisiting this.]
```

---

## DECISION-2026-06-10-nexus-boundary

Date: 2026-06-10
Decided by: ChatGPT (confirmed by Claude)
Session context: Neo4j semantic search was conflating Nexus with SecondBrain/MCP infrastructure in retrieval summaries and executive overviews.

Decision:
Nexus is a separate software architecture lineage. It is not ClaudeSecondBrain infrastructure and not MCP infrastructure. It may be indexed inside SecondBrain as a project/topic, but that indexing relationship does not make it part of the SB or MCP stack.

Applies to:
- All wiki summaries referencing Nexus
- Project map articles and architecture overviews
- Executive overviews and agent briefings
- Retrieval summaries from Neo4j or any memory layer
- Agent handoffs and task context

Rationale:
Nexus lineage traces: shaft concept → inner airlock → toxic-by-design execution environment → masked components → universal protocol / universal connectivity nodes → Nexus implementation. This is an entirely distinct architectural lineage from the SB ingestion/MCP/Neo4j stack. The conflation originated from proximity in the knowledge graph, not from an actual architectural relationship.

Reopening condition:
Gabriel explicitly creates a document establishing an architectural bridge between Nexus and SecondBrain/MCP infrastructure.

---

## DECISION-2026-06-10-manuscript-read-only

Date: 2026-06-10
Decided by: Claude (per agent protocol design session)
Session context: Establishing write-permission zones for multi-agent operation.

Decision:
Manuscript prose (in `manuscripts/` and any craft-fiction article containing narrative excerpts) is read-only for all agents unless Gabriel explicitly authorizes edits in the current session. This applies without exception to Claude, ChatGPT, Gemini, Cursor, and any future agent.

Applies to:
- All agents operating in SecondBrain
- String Theory manuscript files
- Aegis Cycle manuscript files
- Any file containing narrative prose Gabriel has authored

Rationale:
Manuscript prose represents Gabriel's creative voice. Unauthorized edits — even well-intentioned — could corrupt draft integrity, alter canon, or introduce voice inconsistency. The risk is asymmetric: no upside to accidental edits, severe downside.

Reopening condition:
Gabriel says "you may edit this prose" or "rewrite this section" explicitly in the active session.

---

*Last updated: 2026-06-10 — Initial creation (Claude)*

---

## DECISION-2026-07-14-master-domain-cloudflare

Date: 2026-07-14
Decided by: Gabriel
Session context: Gabriel preparing to create the Cloudflare account; asked for the ops sequencing and named the master domain.

Decision:
The master domain for Shakespearience is **`shakespearienceworld.com`**, registered directly at **Cloudflare Registrar**. Registrar, DNS, CDN, WAF, and R2 file storage all consolidate on a single Cloudflare account. Hosting stays on Vercel — registrar and hosting are deliberately separate jobs. `shakespearience.com` (GoDaddy) is demoted to a defensive registration with a 301 redirect; it carries no mail, no DNS authority, and no email authentication.

Applies to:
- Ops Playbooks 01 (Accounts & Access) and 04 (Domain, DNS & Email)
- All SPF / DKIM / DMARC records and role addresses (`ops@`, `billing@`, `support@`, `security@`, `dns@`, `admin@`)
- Vendor Ledger and Ops Operating Costs
- Shakespearience Trello: "Domain, DNS & Email" card in Ops & Setup
- Any future article referencing the project's domain

Rationale:
Cloudflare Registrar sells at wholesale with no markup at renewal (~$10-11/yr for a .com) and includes WHOIS privacy free. It requires the zone to live on Cloudflare, which is where DNS belongs anyway given Cloudflare already provides CDN, WAF, SSL, and R2. Registering fresh avoids the 60-day transfer lock, auth-code, and unlock choreography entirely.

Accepted tradeoff: concentration. One Cloudflare account now holds domain, DNS, CDN, WAF, and R2. A compromise loses all five at once, and DNS control means an attacker can re-point MX and intercept every password-reset email the company owns. Mitigation is mandatory, not advisory — Cloudflare is the hardest root account: both YubiKeys registered, recovery codes printed and stored physically, registrar lock and auto-renew ON from signup.

Reopening condition:
Gabriel selects a different master domain, or a security/availability event argues for splitting registrar away from DNS.

---

## DECISION-2026-07-14-two-dependency-chains

Date: 2026-07-14
Decided by: Claude (analysis), ratified by Gabriel (patch approved)
Session context: Playbook 01's Step 0 implied the legal entity gated all account creation, which would have stalled the entire infrastructure build behind LLC paperwork.

Decision:
Shakespearience setup runs on **two parallel dependency chains**, not one sequence.

- **Identity chain (gated by nothing — starts immediately):** password manager → email host → Cloudflare (registrar + DNS) → mail records → all Tier 3-5 services.
- **Money chain (gated by paperwork):** legal entity + EIN → business bank → Stripe.

The LLC and EIN gate the bank and Stripe only. They do not gate Cloudflare, Fastmail, the password manager, Vercel, Supabase, or Clerk.

A corollary bootstrap rule is registered with it: the `ops@` mailbox cannot exist before DNS, and the Cloudflare account cannot exist without an owner address. The chain is broken with a **Fastmail-native bootstrap identity** — buy Fastmail first, create 1Password and Cloudflare under its `@fastmail.com` address, stand up DNS, attach the custom domain, then rotate all three account-owner emails to role addresses. Only the first three accounts ever touch the bootstrap identity, and none keep it.

Applies to:
- Ops Playbook 01, Steps 0 and 0.5
- Any future sequencing advice given to Gabriel on Shakespearience setup

Rationale:
Conflating the chains costs weeks of dead time waiting on entity formation for work that formation does not block. The bootstrap paradox is a genuine circular dependency in the original playbook that had no stated resolution and would have surfaced as a blocker at account #1.

Reopening condition:
Shakespearience is folded into Present Company as a division rather than formed as its own entity, changing what the money chain depends on.

---


## DECISION-2026-07-16-fiction-studio-governance

Date: 2026-07-16
Decided by: Gabriel (system requested) / ChatGPT-Atlas (initial implementation)
Session context: Repeated fiction-editing failures had shown that separate craft advice, source-control rules, and prestige-prose guidance were not functioning as one enforced workflow. Revisions were at risk of becoming smoother, safer, colder, or less recognizably Gabriel’s work.

Decision:
All agent-assisted fiction work uses the Fiction Studio master system at `wiki/craft-fiction/fiction-studio/master-system.md`. The system requires an explicit mode, source and authorization lock, conservation map, single governing edit mandate, controlled intervention, five quality gates, and a three-pass substantive-AI cap.

Applies to:
- STRING THEORY
- BURNThrough / The Aegis Cycle
- Any future Gabriel fiction project
- ChatGPT/Atlas, Claude, Gemini, Cursor, and future agents
- Diagnosis, architecture, assembly, revision, drafting, submission assessment, and handoffs

Rationale:
The system protects the author’s singular voice and artistic risk while preserving professional rigor. It prevents the recurring failures of unauthorized alteration, canon drift, over-explanation, cold action sequencing, paragraph fragmentation, false literary effect, and safety-driven rewriting. It also keeps manuscript identity and market signal active without allowing an agent’s generalized idea of “publishability” to turn the work into a different book.

Reopening condition:
Gabriel explicitly changes the governing editorial doctrine or directs a material revision to the Fiction Studio master system.


## DECISION-2026-07-16-fiction-studio-cadence-amendment

Date: 2026-07-16
Decided by: Gabriel
Session context: Gabriel identified a persistent model failure in which requests for tightening, restraint, clarification, or reduced excess triggered an automatic collapse into short declarative sentences, mechanical action chronology, and generic “clean” prose.

Decision:
The Fiction Studio system now carries an absolute anti-flattening rule. Every authorized literary revision must preserve the source passage’s living cadence, sentence-shape variety, interior movement, atmosphere, syntactic character, and meaningful implication while repairing excess through hierarchy. Every revision must pass the mandatory pre-output cadence audit before delivery.

Applies to:
- All fiction revisions for STRING THEORY and BURNThrough
- Any future Gabriel fiction project
- Every agent operating under Fiction Studio
- Requests for tightening, restraint, clarity, reduced metaphor, reduced ornament, or general improvement

Rationale:
Model defaults systematically confuse restraint with minimalism and clarity with syntactic simplification. Repeated subject-verb openings, one-action-per-sentence chronology, stripped paragraph movement, and generic prose can survive ordinary quality review because they appear clean. The audit makes those failure modes visible and requires a repair before output.

Reopening condition:
Gabriel explicitly replaces the anti-flattening doctrine or narrows its application for a named project or passage.


## DECISION-2026-07-16-fiction-studio-semantic-pressure-amendment

Date: 2026-07-16
Decided by: Gabriel (governing doctrine) / ChatGPT-Atlas (stress-tested implementation)
Session context: The first cadence stress test avoided staccato but retained only the factual content of a charged image, replacing embodied grief with a generic cognitive summary.

Decision:
Fiction Studio conservation requires preservation of a charged image’s emotional and formal function, not merely its plot information. Before drafting, agents map source carrier → function → quieter retained carrier. Newly introduced filter verbs may not replace embodied interior pressure without a source-based reason.

Applies to:
- All authorized literary revisions under Fiction Studio
- The anti-flattening pre-output audit
- STRING THEORY, BURNThrough, and future fiction projects

Rationale:
Sentence-length variation alone cannot prevent genericness. An edit can remain syntactically fluent while losing the writer’s distinctive interior pressure. This amendment closes that failure mode at the level of semantic function.

Reopening condition:
Gabriel explicitly changes the conservation standard for a named passage, project, or workflow.


## DECISION-2026-07-17-fiction-studio-v2-orchestration
Date: 2026-07-17
Decided by: Gabriel / ChatGPT

Decision:
Fiction Studio will evolve into the orchestration layer for a departmental editorial institution. Departments are constrained analytical lenses, not autonomous authors or theatrical personas. GPT performs the active reasoning and any authorized writing; SecondBrain preserves institutional memory; Fiction Studio classifies tasks, routes departmental review, adjudicates conflicts, and applies quality gates.

Binding implementation principles:
- One canonical source and one primary pass per operation.
- Departments may not expand scope, alter canon, or rewrite without explicit assignment under an authorized revision or drafting pass.
- Departmental disagreement is resolved by an authority hierarchy rather than voting.
- Voice, cadence, consciousness, emotional charge, canon, and project identity outrank local elegance and market simplification.
- Learning enters institutional doctrine only through Gabriel’s approval or a dated decision record.
- The system begins as an in-session SecondBrain protocol; code automation follows only after real manuscript use stabilizes the workflow.

Governing documents:
- `wiki/craft-fiction/fiction-studio/orchestration-v2.md`
- `wiki/craft-fiction/fiction-studio/departments-v2.md`

Reopening condition:
Evidence from repeated live manuscript use shows that a department boundary, veto rule, routing pattern, or adjudication hierarchy produces systematic error.


## DECISION-2026-07-18-full-studio-review-protocol

Date: 2026-07-18
Decided by: Gabriel / ChatGPT-Atlas
Session context: Gabriel returned to resume development of the creative institution and authorized the planned first step: canonicalizing the Full Studio Review Protocol from the founding brief.

Decision:
The canonical Full Studio Review Protocol is established at `wiki/craft-fiction/fiction-studio/full-studio-review-protocol.md`. It is the highest-order Fiction Studio review process for chapters, sequences, parts, manuscripts, and other high-stakes multi-jurisdiction decisions.

The protocol requires one canonical source, one primary pass, explicit authority, a conservation map before criticism, selective department activation, independent findings, non-voting conflict adjudication, a ranked authority hierarchy, explicit revision permission, full quality gates, one Studio report, and governed institutional learning.

Artistic Vision, Legacy, and the Empty Chair remain provisional until separately decided by Gabriel. The protocol may use them only under the temporary limits stated in the article.

Applies to:
- STRING THEORY
- BURNThrough / The Aegis Cycle
- Future fiction projects governed by Fiction Studio
- ChatGPT/Atlas, Claude, Gemini, Cursor, and future agents
- Any invocation of “Run a Full Studio Review”

Rationale:
The orchestration architecture and department charters required one operational protocol that reconciled source control, conservation, departmental independence, conflict handling, pass boundaries, revision gates, reporting, and institutional learning. Without a single canonical protocol, the Studio risked parallel formulations and inconsistent review behavior.

Reopening condition:
Evidence from live manuscript pilots shows that the protocol creates systematic duplication, jurisdiction failure, false consensus, conservation loss, or unusable review overhead; or Gabriel directly amends it.


## DECISION-2026-07-18-artistic-vision-legacy-empty-chair

Date: 2026-07-18
Decided by: Gabriel / ChatGPT-Atlas
Session context: After canonicalizing the Full Studio Review Protocol, Gabriel approved the recommended institutional classifications for Artistic Vision, Legacy, and the Empty Chair.

Decision:
Fiction Studio adopts three distinct non-departmental functions:

1. **Artistic Vision** is a constitutional lens protecting artistic necessity and singular identity when departmental recommendations create plausible artistic-diminishment risk. It may issue a Preservation Challenge but has no automatic veto over Gabriel, canon, source truth, mandatory factual correction, the authorship boundary, or established character truth.
2. **Legacy** is a rare special review mode testing long-horizon significance. It produces a Long-Horizon Consideration, has no veto, and must not be used casually or as a prediction of fame, canonicity, or cultural influence.
3. **The Empty Chair** is the final witness after adjudication. It answers Yes, No, or I almost did, followed by one sentence identifying the decisive reading threshold. It cannot diagnose, prescribe, vote, or override the Studio decision.

The canonical charter is `wiki/craft-fiction/fiction-studio/artistic-vision-legacy-empty-chair.md`.

Applies to:
- Full Studio Reviews
- STRING THEORY
- BURNThrough / The Aegis Cycle
- Future fiction projects governed by Fiction Studio
- All agents operating through Fiction Studio

Rationale:
The three functions protect different forms of judgment that should not be collapsed into ordinary editorial departments. Artistic Vision protects what makes the work necessary; Legacy widens the time horizon without controlling the present decision; the Empty Chair preserves the irreducible reader encounter after analysis is complete. Keeping them outside the department roster prevents jurisdictional bloat and theatrical pseudo-consensus.

Reopening condition:
Evidence from the first three live Full Studio Review pilots shows duplication, inflation, weak evidence, unhelpful authority, or failure to improve adjudication; or Gabriel directly changes the classification.
