# Knowledge Governance Standard

*The truth standard for every claim in this knowledge base. Every consequential assertion carries a provenance label. This prevents three failure modes: treating Gabriel's theoretical work as established science, treating fictional mechanisms as literal physical facts, and treating AI-generated synthesis as primary source material.*

*Established: 2026-07-16 (Claude)*

---

## Provenance Labels

Every article in this knowledge base uses these labels for any claim that isn't plainly observable fact (dates, file paths, word counts from verified builds, etc.).

### `[canonical]`
A claim Gabriel has explicitly settled as definitively true within his creative, theoretical, or operational work. Not subject to revision by agents without explicit Gabriel instruction. Examples: the buried bench stays buried; the positive-declaration rule is absolute; `shakespearienceworld.com` is the master domain.

*Where it appears:* Decision records, canon-rules articles, settled plot/character facts in craft-fiction.

---

### `[verified]`
A claim supported by a specific named external source (paper, dataset, official documentation, measured result). The source is cited inline using `(source: filename)` for material in `raw/`, or linked by URL for external resources. Agents may rely on verified claims in synthesis.

*Where it appears:* Reference-external articles; the VCH/GHRM papers when citing real physics (Orch OR, Wellesley 2024, Schumann resonance measurements, CEMI field theory, heart-brain coherence studies).

---

### `[theoretical]`
A claim representing Gabriel's originated theoretical position — the VCH, the GHRM, the HRIF Protocol, the harmonic entrainment model — that has not yet been externally validated. Theoretical claims are stated seriously and precisely, not hedged into meaninglessness. They are clearly Gabriel's own framework rather than established science.

*Where it appears:* `theory-consciousness/` articles; `craft-fiction/` articles where the novel's science reflects VCH propositions. Cross-domain claims bridging VCH to fiction always carry this label on the theoretical side.

The distinction from `[verified]`: "Schumann resonance is 7.83 Hz `[verified]`" versus "The Schumann resonance base maps onto human theta brainwaves as a planetary-biological coupling mechanism `[theoretical]`."

---

### `[creative-canon]`
A claim true within Gabriel's fictional universe — not meant to describe physical reality, but binding within the creative work. Creative canon claims are stated as present-tense standing facts: "David Lang is a physicist at Cornell." "The buried object stays in the ground permanently." "Kenji Tsukino disappears in 1971."

*Where it appears:* `craft-fiction/` articles; anywhere the novel's internal reality is described. Creative-canon claims should never be labeled `[theoretical]` — they are not theoretical positions about reality; they are settled facts about a fiction.

---

### `[inference]`
A claim that follows reasonably from verified or theoretical material but is not explicitly stated in any source. Useful for synthesis across multiple articles. Agents generating inferences should mark them and note the sources they draw from.

*Where it appears:* Output files; synthesis sections of wiki articles; `_connections.md` entries predicting connections not yet documented. The claims-and-evidence ledger tracks inferences that may be promotable to `[theoretical]` as the theory matures.

---

### `[unverified]`
A claim present in the knowledge base without a locatable source. An `[unverified]` claim is a flag for future sourcing work, not a reason to remove the claim. Agents should never silently promote an unverified claim to verified status.

*Where it appears:* Anywhere a claim is made that the processing agent could not source at the time of writing. Regular health checks surface `[unverified]` claims for sourcing or removal.

---

### `[ai-generated]`
A claim, summary, or synthesis produced by an AI agent (Claude, ChatGPT, Gemini, or any other) without independent sourcing. AI-generated content may be accurate and useful, but it has not been confirmed against primary sources and should not be cited as though it were. This label applies to AI synthesis in output files before those outputs are verified and promoted to wiki articles.

*Where it appears:* `outputs/` files during their draft state; wiki articles sections explicitly synthesized by an AI agent from disparate sources. When an AI-generated synthesis is verified against primary sources and promoted to wiki, the label is replaced with the appropriate provenance label above.

---

### `[historical]`
A claim that was accurate at a documented point in time but may no longer reflect current state. Used primarily for project states, market intelligence, agent profiles, and infrastructure configurations. Historical claims preserve the record without misleading agents about current reality.

*Where it appears:* Market intelligence articles (audience expectations, Big Five acquisition posture); agent profiles (agents retire, move houses, change tastes); infrastructure notes for superseded designs.

---

### `[superseded]`
A claim explicitly replaced by a later settled decision or verified update. The superseded claim stays in the record for context and decision archaeology; it is marked so agents know not to rely on it. Different from `[stale]` (which is a flag to update) — superseded claims will not be updated; they are intentionally preserved as historical record.

*Where it appears:* Articles containing prior design decisions that have been formally overruled. Decision records list the superseded position alongside the current one.

---

## Application Priority — VCH and the Novel's Science

The most important place this standard operates is at the intersection of theory and fiction.

The VCH's harmonic entrainment theory is `[theoretical]` — Gabriel's originated framework, not established neuroscience. The 68.48 Hz mechanic in *String Theory* is `[creative-canon]` — not theoretical, not verified, not unverified. It is a settled internal fact of the novel's physics. The Schumann resonance base frequency (7.83 Hz) is `[verified]`. The claim that 7.83 Hz maps biologically onto theta brainwave coupling is `[theoretical]`.

These distinctions matter for public-facing work (talks, papers, query letters) and for agents that will generate synthesis across the theory and fiction domains. An agent that conflates `[theoretical]` with `[verified]` misrepresents Gabriel's positions. An agent that conflates `[creative-canon]` with `[theoretical]` misrepresents the novel's fictional status.

---

## Application to AI-Generated Market Intelligence

Query letter companion documents (agent profiles, market intelligence) synthesize public information about current market conditions and agent preferences. This content ages rapidly and is generated largely by AI synthesis. All market intelligence articles carry `[ai-generated]` on their synthesis sections and `[historical]` when a snapshot date is more than 90 days old.

Agent preferences, acquisition patterns, and MSWL signals are specifically marked `[historical: YYYY-MM]` because they drift meaningfully over months.

---

## Health Check Integration

During monthly health checks, look specifically for:
- `[theoretical]` claims that have since been externally validated → may be promotable to `[verified]`
- `[unverified]` claims that have source material in `raw/` → source and relabel
- `[ai-generated]` claims in wiki articles (not outputs) that were never verified → flag for sourcing or removal
- `[creative-canon]` claims that conflict with current manuscript state → flag as contradictions, not errors (canon may have evolved intentionally)
- `[historical]` market intelligence older than 90 days → mark for refresh

---

*This document governs every article in `wiki/`. When in doubt about a claim's label, err toward `[unverified]` rather than silent assertion.*
