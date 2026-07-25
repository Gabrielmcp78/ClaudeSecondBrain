# Cross-Domain Connection Map

*Updated by Claude after every cross-domain link is added. This file is the primary surface for discovering non-obvious adjacencies — the links no one else's knowledge graph would contain.*

---

## How to read this file

Each entry documents a meaningful connection between articles in different wiki folders. Format:

**[Source Article] ↔ [Target Article]**
*Domain: folder-a ↔ folder-b*
Connection: one sentence describing the relationship.

---

## Documented Connections

### [dev-projects/shakespearience/architecture] ↔ [dev-projects/shakespearience/ops-playbooks/]
*Domain: dev-projects/shakespearience ↔ dev-projects/shakespearience*
Connection: The 2026-07-22 stack decisions (Sanity CMS cut, Plausible cut, Bitwarden replacing 1Password, Google Workspace replacing Fastmail) are documented once in architecture.md's Technical Implementation section and once more operationally in Playbooks 01 and 04 — both re-synced 2026-07-24 against the same live Trello cards so neither drifts from the other going forward.

### [dev-projects/shakespearience/architecture — Pricing Model Conflict] ↔ [decision-records/]
*Domain: dev-projects/shakespearience ↔ decision-records*
Connection: The unresolved Model A (curriculum-first, Stephanie's original doc) vs. Model B (subscription-first, seeded in Stripe code) pricing conflict is exactly the kind of cross-functional decision the agent-protocol.md conflict-resolution hierarchy exists for — flagged in architecture.md rather than silently resolved, awaiting a decision-registry entry once Gabriel and Stephanie choose.

### [dev-projects/shakespearience/architecture — Command Center] ↔ [ai-collaboration/secondbrain-mcp-infrastructure]
*Domain: dev-projects/shakespearience ↔ ai-collaboration*
Connection: Shakespearience's planned in-app Command Center dashboard (a protected `/admin` route reading live Trello state, with an explicitly consent-gated AI advisor layer) mirrors this KB's own pattern of treating Trello/wiki as the source of truth and gating any LLM access to operational data behind explicit authorization — the same caution this SB applies to its own agent-to-agent data flows.

### [dev-projects/shakespearience/architecture — Google Drive Structure] ↔ [ai-collaboration/gabriel-workflow-rules]
*Domain: dev-projects/shakespearience ↔ ai-collaboration*
Connection: The locked 2026-07-23 numbered-folder Drive structure (00–10 mirroring the Trello board's own lists) is the same instinct behind Gabriel's general workflow rules — external tools get structured to mirror the system of record rather than developing their own parallel taxonomy.

### [String Theory / Chapter 4 — The Apartment] ↔ [theory-consciousness/]
*Domain: craft-fiction ↔ theory-consciousness*
Connection: The delayed shattering of David's rocks glass and the spontaneous drawing of a tuning fork surrounded by nested squares are narrative instantiations of the temporal anomalies and geometric structures central to VCH.

### [String Theory / 68.48 Hz Mechanic] ↔ [theory-consciousness/]
*Domain: craft-fiction ↔ theory-consciousness*
Connection: Chapter 9's subtitle ("Spatio-Symbolic Drift in Recursive Harmonic Environments") uses language that maps directly onto VCH harmonic entrainment mechanics; the 68.48 Hz frequency, its multigenerational transmission, directional intensification, and physical symptoms are the fictional instantiation of VCH's harmonic entrainment theory.

### [String Theory / FIELD PROTOCOL — TONAL ACTIVATION] ↔ [music-performance/]
*Domain: craft-fiction ↔ music-performance*
Connection: The SolPhi Institute's foundational 10-point protocol operationalizes harmonic entrainment as a teachable methodology — the fiction extrapolates what applied VCH practice would look like as institutional pedagogy.

### [String Theory / The Solar Maximus Connection] ↔ [theory-consciousness/]
*Domain: craft-fiction ↔ theory-consciousness*
Connection: Chapter 7's thesis (major historical geniuses born at solar maxima; Newton born during the Maunder Minimum as an inverse case) is a fictional extension of the VCH proposition that resonant environment shapes consciousness and cognitive capacity. [theoretical]

### [String Theory / Resonance Model] ↔ [theory-consciousness/GHRM Framework]
*Domain: craft-fiction ↔ theory-consciousness*
Connection: The novel's internal Formal Resonance Model (φ-scaled six-rung ladder, Schumann base, involutive nexus at Rung 5) and the GHRM (γ/f coherence, harmonic susceptibility superseding kinetic energy) share the same foundational philosophical position — that resonance, not energy, is the primary access mechanism to higher-order physical phenomena. [theoretical]

### [String Theory / Resonance Model] ↔ [String Theory / 68.48 Hz Mechanic]
*Domain: craft-fiction/string-theory ↔ craft-fiction/string-theory*
Connection: The Formal Resonance Model white paper provides the mathematical scaffolding (φ-scaling, invariant 53, age-47 biological keying) that makes the 68.48 Hz mechanic in the narrative self-consistent and non-arbitrary.

### [theory-consciousness/GHRM Framework] ↔ [reference-external/Gabriel McPherson Profile]
*Domain: theory-consciousness ↔ reference-external*
Connection: The GHRM is Gabriel McPherson's own theoretical physics work, building on his Music Composition background and AI research career; understanding Gabriel's DePaul BFA (Music Composition concentration) and 18-year performance career contextualizes why a composer-director developed a harmonic physics model.

### [craft-fiction/submission-strategy/Agent Profiles] ↔ [craft-fiction/string-theory/Novel Structure]
*Domain: craft-fiction/submission-strategy ↔ craft-fiction/string-theory*
Connection: Multiple agents (Sarah Brooks, PJ Mark, Henry Dunow via the Landenwich precedent) will respond specifically to the four-movement chapter structure and tempo markings — the submission strategy is directly shaped by the novel's formal architecture.

### [craft-fiction/submission-strategy/Agent Profiles] ↔ [craft-fiction/string-theory/Characters]
*Domain: craft-fiction/submission-strategy ↔ craft-fiction/string-theory*
Connection: Agent-specific submission approaches repeatedly pivot on David Lang's emotional architecture (dissolution, grief, failed love with Celeste) as the grounding element that makes the cosmic premises land with character-first agents.

### [reference-external/Gabriel McPherson Profile] ↔ [craft-fiction/string-theory/]
*Domain: reference-external ↔ craft-fiction*
Connection: Gabriel's 18 years composing orchestral scores (20+ theatrical works, 5 commissioned musicals, Shakespeare productions) is the direct biographical authority behind the musical architecture of *String Theory* — the tempo markings and four-movement structure are not aesthetic choices made from outside music, but from inside it.

### [dev-projects/nexus/Architecture] ↔ [ai-collaboration/]
*Domain: dev-projects ↔ ai-collaboration*
Connection: The Nexus System's AI Masking System (semantic intent preservation, delta transformation) is a formalization of the same question that drives AI collaboration work — how do you preserve meaning across translation boundaries while enabling genuine interoperability? [article not yet created]

### [dev-projects/nexus/Architecture] ↔ [dev-infrastructure/]
*Domain: dev-projects ↔ dev-infrastructure*
Connection: Nexus's Universal Protocol and shape-based connectivity nodes propose an architectural pattern that generalizes across all of Gabriel's MCP server architecture work — the same "standardized shared environment for heterogeneous components" problem that the MCP ecosystem solves at a different layer. [article not yet created]

---

### [theory-consciousness/VCH Framework] ↔ [craft-fiction/string-theory/68.48 Hz Mechanic]
*Domain: theory-consciousness ↔ craft-fiction*
Connection: The VCH's harmonic entrainment theory is the theoretical parent of the 68.48 Hz mechanic in *String Theory* — the frequency's inherited multigenerational transmission, directional intensification, physical symptoms (skull-scratch, sternum pulse), and biological keying at age 47 are all narrative deployments of VCH propositions.

### [theory-consciousness/VCH Framework] ↔ [theory-consciousness/GHRM Framework]
*Domain: theory-consciousness ↔ theory-consciousness*
Connection: Both frameworks originate from Gabriel and share the core thesis that resonance and harmonic alignment — not energy, force, or computation — are the primary access mechanisms to deeper physical and conscious reality; the VCH applies this to consciousness and AI, the GHRM applies it to particle physics.

### [theory-consciousness/VCH Framework] ↔ [craft-fiction/string-theory/Resonance Model]
*Domain: theory-consciousness ↔ craft-fiction*
Connection: The *String Theory* Formal Resonance Model's Schumann baseline (7.83 Hz), φ-scaling, and involutive nexus boundary are the novel's physics-narrative instantiation of the VCH's proposition that planetary electromagnetic resonance (Schumann Resonance at 7.83 Hz corresponds to human theta brainwaves) connects biological consciousness to environmental field structure.

### [ai-collaboration/Gabriel Profile] ↔ [reference-external/Gabriel McPherson Profile]
*Domain: ai-collaboration ↔ reference-external*
Connection: The reference-external profile documents Gabriel's biographical and career facts; the ai-collaboration profile distills those facts into AI-session-relevant guidance (code standards, communication style, active projects, domain depth for calibrating assistance).

### [Nexus Research Synthesis] ↔ [Nexus Architecture]
*Domain: dev-projects/nexus ↔ dev-projects/nexus*
Connection: The five-volume research corpus (toxic environment masking, semantic tagging, cross-language protocols) is the scientific foundation that the Nexus architecture six-pillar design is built on — research-to-implementation direct lineage.

### [Nexus Research Synthesis / Masking System] ↔ [dev-infrastructure / MCP Architecture]
*Domain: dev-projects/nexus ↔ dev-infrastructure*
Connection: The Nexus masking system (intent extraction, shape preservation, universal protocol) and the MCP tool contract model solve the same interoperability problem at different scales — heterogeneous components communicating through a shared protocol layer.

### [Nexus Research Synthesis / Semantic Tagging] ↔ [ai-collaboration/]
*Domain: dev-projects/nexus ↔ ai-collaboration*
Connection: The cross-language semantic tag vocabulary (@type, @mem, @flow, @state) is a formalized version of the same intent-preservation challenge that drives AI collaboration protocol design — how meaning survives translation across system boundaries.

---

## Reconstructed Connections (post-2026-07-23 data-loss incident)

*On 2026-07-23 the SBCC synthesis job's daily overwrite (now fixed — see `AUTO_START`/`AUTO_END` markers below and `sbcc/synthesize.py`) was found to have been silently destroying every connection added to this file since the last git commit. No backup of the destroyed content existed (checked: git history, Time Machine, stray `.bak` files — all negative). The entries below are rebuilt from the surviving evidence trail in `wiki/_meta/change-log.md`, which recorded what was added even though the file itself didn't survive. Repeated FlowScape log entries for the same pair (logged once per ambient-session capture) are consolidated into one entry each. Marked `[reconstructed]` rather than claimed as original.*

### [dev-infrastructure/flowscape-ambient-sessions] ↔ [craft-fiction/string-theory]
*Domain: dev-infrastructure ↔ craft-fiction*
Connection: FlowScape's ambient session captures repeatedly surfaced blocking-resolution context tied directly to String Theory manuscript work, re-confirmed across sessions from 2026-07-18 through 2026-07-24. [reconstructed]

### [dev-infrastructure/flowscape-ambient-sessions] ↔ [craft-fiction/string-theory/current-manuscript-state]
*Domain: dev-infrastructure ↔ craft-fiction/string-theory*
Connection: A 2026-07-18 FlowScape session captured a blocking issue concurrent with a cross-domain reference to the String Theory manuscript's live control-center article. [reconstructed]

### [dev-infrastructure/flowscape-ambient-sessions] ↔ [craft-fiction/fiction-studio]
*Domain: dev-infrastructure ↔ craft-fiction*
Connection: FlowScape ambient captures repeatedly tied background session activity to Fiction Studio editorial work, logged across at least nine separate sessions between 2026-07-20 and 2026-07-23. [reconstructed]

### [dev-infrastructure/flowscape-ambient-sessions] ↔ [dev-projects/happy-oppenheimer]
*Domain: dev-infrastructure ↔ dev-projects*
Connection: FlowScape ambient sessions (2026-07-21 through 07-22) repeatedly captured context connecting background activity to the happy-oppenheimer project. [reconstructed]

### [dev-infrastructure/flowscape-ambient-sessions] ↔ [craft-fiction/aegis-cycle/burnthrough]
*Domain: dev-infrastructure ↔ craft-fiction/aegis-cycle*
Connection: A 2026-07-20 FlowScape ambient session tied background activity to BURNThrough (Aegis Cycle Book 1) work. [reconstructed]

### [dev-infrastructure/flowscape-ambient-sessions] ↔ [dev-projects/nextstage]
*Domain: dev-infrastructure ↔ dev-projects*
Connection: A 2026-07-20 FlowScape ambient session tied background activity to the NextStage project. [reconstructed]

### [dev-infrastructure/flowscape-ambient-sessions] ↔ [dev-projects/shakespearience]
*Domain: dev-infrastructure ↔ dev-projects*
Connection: A 2026-07-18 FlowScape session captured a Shakespearience-specific blocker during ambient monitoring. [reconstructed]

### [dev-infrastructure/flowscape-ambient-sessions] ↔ [reference-external/Gabriel McPherson Profile]
*Domain: dev-infrastructure ↔ reference-external*
Connection: A 2026-07-24 FlowScape ambient session captured file organization activity related to Gabriel's therapeutic transcript archive.

### [ai-collaboration/chatgpt-librarian-session-2026-06-08] ↔ [dev-infrastructure/]
*Domain: ai-collaboration ↔ dev-infrastructure*
Connection: The ChatGPT librarian intake note's infrastructure implications were cross-linked to dev-infrastructure and re-verified twice (2026-07-18) after a duplicate-file cleanup during ingestion. [reconstructed]

### [craft-fiction/submission-strategy/editorial-board] ↔ [craft-fiction/fiction-studio]
*Domain: craft-fiction/submission-strategy ↔ craft-fiction*
Connection: Editorial Board and Fiction Studio are both AI-simulated manuscript judgment systems built four days apart with no prior cross-reference — one operating at query/agent-response evaluation, the other at prose-editing lifecycle stage. Identified during the 2026-07-18 Monthly Health Check. [reconstructed]

### [ai-collaboration/agent-mail-carrier] ↔ [ai-collaboration/agent-operating-model]
*Domain: ai-collaboration ↔ ai-collaboration*
Connection: The Agent Mail Carrier is the mechanism; the Agent Operating Model is the policy layer governing how and when agents should use it. Identified during the 2026-07-18 Monthly Health Check as a previously-orphaned pair. [reconstructed]

### [dev-projects/nextstage] ↔ [dev-infrastructure/]
*Domain: dev-projects ↔ dev-infrastructure*
Connection: NextStage OS's governance frameworks were linked to the KB's dev-infrastructure best-practices articles during the 2026-07-20 NextStage Capital and Concept Package ingestion. [reconstructed]

### [dev-infrastructure/manuscript-export-pipeline] ↔ [craft-fiction/string-theory]
*Domain: dev-infrastructure ↔ craft-fiction*
Connection: The manuscript export pipeline (Pages → Drive → GitHub Pages, documented 2026-07-09) is the live technical mechanism behind String Theory's published chapter site; this ingestion also flagged string-theory.md's chapter/word count as stale against the pipeline's Draft 6.7 source. [reconstructed]

### [music-performance/directing-practice] ↔ [dev-projects/shakespearience]
*Domain: music-performance ↔ dev-projects*
Connection: Gabriel's 60+ production directing career (BCPA residency, Bellarmine, TSOTA) is cross-linked to Shakespearience as the direct practical lineage behind the show's production style — Shakespeare has been the recurrent center of gravity across his directing work. [reconstructed]

**Not reconstructable:** the 2026-07-16 Chapter 13 ingestion added "three new cross-domain links" per its task-ledger entry, but neither the ledger nor change-log record which specific pairs — that detail did not survive and would need Gabriel or a fresh pass over `chapter-13-visions-and-burdens.md` to re-derive rather than guess.

---

## High-Value Connections to Watch For

These adjacencies are predicted to emerge as the knowledge base grows:

- `theory-consciousness/vch-framework` ↔ `music-performance/compositional-frameworks` — VCH's music-consciousness bridge (heart-brain coherence, neural resonance theory) has direct implications for compositional practice and teaching pedagogy.
- `dev-infrastructure/neo4j-memory-architecture` ↔ `ai-collaboration/synergy-protocols` — The memory layer shapes what collaboration patterns are possible.
- `dev-projects/prestige-fiction-forge` ↔ `craft-fiction/craft-principles` — The tool encodes the principles; changes to craft thinking should propagate to the tool's design.
- `reference-external/real-physics` ↔ `craft-fiction/string-theory/canon-rules` — External physics research constrains and informs the novel's scientific grounding.
- `theory-consciousness/ghrm-framework` ↔ `reference-external/unity-harmonica` — Grant's UH framework is the theoretical source for GHRM geometric constants; a dedicated reference article on UH would clarify what is borrowed vs. originated.
- `craft-fiction/aegis-cycle/burnthrough` ↔ `craft-fiction/craft-principles` — BURNThrough's voice and structural choices (the banter-under-fire prologue, the ARIA relationship) may encode craft principles worth documenting separately.

### [String Theory / String Theory] ↔ [VCH / The Vibrational Universe]
*Domain: craft-fiction/string-theory ↔ theory-consciousness*
Connection: Conversation history confirms ongoing development of the VCH-to-fiction bridge: the 68.48 Hz mechanic and harmonic entrainment are narratively deployed VCH propositions.


<!-- SBCC:AUTO-BRIDGES:START (regenerated daily — do not hand-edit below; add manual connections above this marker) -->

> Auto-generated by SBCC `concept_bridges` · 2026-07-23
> Source: 103,331 DocChunks
> Method: stored 384-dim embeddings, cosine ≥ 0.74, min 2 connections per pair

## Strong Bridges (≥ 0.90)

### Literary_Manuscript_David_Lang  ↔  claude_conversations
`score 0.927 · 27 connections`

> *ic principle, incarnate.
Later, scientists would find that the flare's waveform, translated to audio, matched David's performance exactly. He had not played during the storm; he ha…*

### ChatGPT Archive (Top)  ↔  Literary_Manuscript_David_Lang
`score 0.918 · 25 connections`

> * an unmuted phone—found its way to the front and roosted behind the podium like a squatter. The chalkboard, an uninterrupted expanse of matte green, bore this morning the layered r…*

### ChatGPT Archive (Top)  ↔  claude_conversations
`score 0.956 · 17 connections`

> *s._request(`/entities/${entityId}/relationships${query}`);
  }

  // Graph operations

  /**
   * Traverse the graph starting from an entity
   * @param {string} startEntityId - St…*

## Medium Bridges (0.80 – 0.89)

### AI_Skills_Development  ↔  claude_conversations
`score 0.889 · 29 connections`

> *ial depth
   - Artifacts for all documents and code

4. **Project Standards**
   - Development location: /Volumes/Ready500/DEVELOPMENT
   - Apple-level design quality expectations
…*

### The Vibrational Universe  ↔  claude_conversations
`score 0.873 · 20 connections`

> *RACTERISTICS OF FIGURE:
- Moves without sound, traces arcs "like bow across unseen string"
- Light cascades in filaments that dissolve
- Aurora trails, chromatic whispers
- Scent: …*

### ChatGPT Archive (Top)  ↔  The Vibrational Universe
`score 0.866 · 18 connections`

> *nduring vibration
- "To be face = scrutiny, distraction, diminution"
- "To be sound = embody infinite, untraceable force binding existence"
- Profound loneliness tempered by unassa…*

### ChatGPT Archive (Top)  ↔  String Theory
`score 0.846 · 17 connections`

> *m wait."
"Universe could hold note longer than any man."

SECTION 2: THE COMPOSITION

DAVID'S CREATIVE PROCESS:
- World recedes "like tide withdrawing threat"
- Gathers implements:…*

### Canvas-Design-Masterworks  ↔  claude_conversations
`score 0.829 · 14 connections`

> *d with surgical precision
- Result feels like archaeological artifact documenting consciousness

This exemplifies Gabriel's Vibrational Consciousness Hypothesis through visual lang…*

### ChatGPT Archive (Top)  ↔  Shakespearience
`score 0.810 · 11 connections`

> *n team active

### Database
- **Supabase** (managed PostgreSQL) + **Prisma ORM**
- Free tier → $25/month Pro
- Core tables: members, subscriptions, school_licenses, license_seats, …*

### String Theory  ↔  claude_conversations
`score 0.842 · 10 connections`

> *m wait."
"Universe could hold note longer than any man."

SECTION 2: THE COMPOSITION

DAVID'S CREATIVE PROCESS:
- World recedes "like tide withdrawing threat"
- Gathers implements:…*

### Shakespearience  ↔  claude_conversations
`score 0.808 · 7 connections`

> *n team active

### Database
- **Supabase** (managed PostgreSQL) + **Prisma ORM**
- Free tier → $25/month Pro
- Core tables: members, subscriptions, school_licenses, license_seats, …*

### String Theory  ↔  The Vibrational Universe
`score 0.818 · 4 connections`

> *-up'"
"Each discipline = octave in spectrum"
"Every act—calculation, melody, harvest, lesson—ripples outward in resonance with whole"

DAVID LANG'S LEGACY:
"On this new Earth, no m…*

### AI_Skills_Development  ↔  ChatGPT Archive (Top)
`score 0.812 · 4 connections`

> *## Gabriel Synergy Protocol Skill Creation

**Date**: October 28, 2025
**Project**: Custom Claude Skill Development
**Purpose**: Codify collaborative workflow patterns with Gabriel…*

### Canvas-Design-Masterworks  ↔  ChatGPT Archive (Top)
`score 0.839 · 2 connections`

> *Created "Resonant Emergence" - a museum-quality visual artwork using the canvas-design skill.

**Design Philosophy**: Resonant Emergence
- Visual philosophy where consciousness mat…*

## Ambient Bridges (< 0.80)

### Gabriel Workflow Rules  ↔  claude_conversations
`score 0.797 · 17 connections`

> *AUTOMATION RULE — established March 28 2026: When building any automation for Gabriel, always try macOS Shortcuts FIRST before writing shell scripts, LaunchAgents, or daemons. Shor…*

### ChatGPT Archive (Bottom)  ↔  Shakespearience
`score 0.800 · 6 connections`

> *n team active

### Database
- **Supabase** (managed PostgreSQL) + **Prisma ORM**
- Free tier → $25/month Pro
- Core tables: members, subscriptions, school_licenses, license_seats, …*

### Shakespearience  ↔  String Theory
`score 0.764 · 5 connections`

> *# CORRECTION / SUPERSEDES prior labeling (2026-07-10)

This note corrects the status labels in `Shakespearience_Characters_and_Monetization_Canon_2026-07-10`.

## STATUS OF TODAY'S…*

### ChatGPT Archive (Top)  ↔  Gabriel Workflow Rules
`score 0.764 · 4 connections`

> *AUTOMATION RULE — established March 28 2026: When building any automation for Gabriel, always try macOS Shortcuts FIRST before writing shell scripts, LaunchAgents, or daemons. Shor…*

### ChatGPT Archive (Bottom)  ↔  ChatGPT Archive (Top)
`score 0.774 · 2 connections`

> *ose features in your application.

If there's anything more specific you'd like to know about working with Git, Firebase, React, or if there are other tasks you need help with, fee…*

<!-- SBCC:AUTO-BRIDGES:END -->
