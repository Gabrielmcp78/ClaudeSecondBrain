# Orchestrated Narrative Engine Assessment

Date: 2026-07-18
Status: architecture candidate, not yet doctrine

## Executive judgment

The supplied LangGraph + Plan-Then-Execute + modified Graphify proposal is directionally useful for durable orchestration, continuity, and long-range state management. It does not by itself solve Fiction Studio's current prose failure: language becoming clinically correct, overplanned, overexplained, and emotionally dead. If implemented without stronger artistic and authorship controls, it could scale that failure.

## Verified current tool facts

- LangGraph is explicitly designed for long-running, stateful workflows and supports durable execution and human-in-the-loop control.
- Graphify is currently a codebase knowledge-graph system. It parses code deterministically through Tree-sitter grammars and represents code entities and relationships. Adapting it for narrative would require replacing or supplementing its code-centric extraction and schema substantially.

## Constitutional correction

The canonical manuscript remains the source of truth.

A narrative knowledge graph is a derived, versioned index with provenance and confidence. It must never silently supersede exact manuscript text. Extractor errors, interpretive guesses, unresolved ambiguities, and provisional inferences cannot become canon merely because they have been entered into a graph.

All graph mutations follow this sequence:

1. Extract proposed delta from exact prose.
2. Attach source citation and confidence.
3. Classify as verified fact, character belief, inference, ambiguity, or open question.
4. Run contradiction and authority checks.
5. Require human or explicit canon approval for consequential changes.
6. Append versioned state rather than overwriting history.

## Required state layers

### 1. Hard canon state

Chronology, geography, names, ages, bodies, objects, injuries, institutional facts, established world rules, and explicit events.

### 2. Epistemic state

What each character knows, believes, suspects, misremembers, refuses to know, or falsely concludes at each point.

### 3. Relational state

Attachments, debts, power, intimacy, estrangement, shame, desire, conflict, and unsettled relational history. These are often graded, contradictory, or viewpoint-dependent rather than atomic facts.

### 4. Formal and aesthetic state

Narrative-distance laws, cadence behavior, recurring images, musical structures, humor, protected ambiguity, narrator permissions, project-specific strangeness, and author-approved craft principles.

### 5. Source-language anchors

Load-bearing sentences, images, jokes, gestures, paragraph movements, and absences that cannot be casually replaced. Each anchor includes the exact source and the function it performs.

### 6. Open ambiguity state

Questions the manuscript intentionally does not settle. The graph must represent unresolved alternatives rather than selecting one for convenience.

### 7. Scene-field state

The bodies, rooms, objects, weather, memories, sounds, institutions, histories, and minor coherences active in a scene. This layer records conditions and relations, not a predetermined thematic conclusion.

## Revised pipeline

The correct pattern is not simply Plan-Then-Execute.

It is:

**Source Lock → Diagnose → Conserve → Plan Conditions → Execute Minimally → Diff Audit → Multi-Lens Review → Human Acceptance → Versioned State Update**

### Source Lock

Identify exact manuscript source, version, range, pass type, and authority to alter prose.

### Diagnose

Name one governing defect. No broad mandate such as improve, tighten, humanize, or make more literary.

### Conserve

Map narrative truth, emotional charge, consciousness, formal behavior, source-language anchors, atmosphere, humor, mystery, and protected absence.

### Plan Conditions

The plan defines what the scene must permit, preserve, and make legible. It does not prewrite the interpretation or require the narrator to state the editorial diagnosis.

### Execute Minimally

Every changed sentence must identify its mandate connection. Unnecessary rephrasing is forbidden.

### Diff Audit

Review source and revision side by side. Classify every alteration as mandatory, supporting, or collateral. Collateral changes are restored unless separately authorized.

### Multi-Lens Review

Continuity may block factual contradiction. Character Psychology may block unsupported behavior or access. Prestige Prose may block flattening and genericization. Reader Experience may identify accidental disorientation. Artistic and editorial sensibility lenses advise but never generate imitation prose.

### Human Acceptance

No automated critic promotes prose into canon. Gabriel accepts, rejects, or requests a new mandate.

### Versioned State Update

Only accepted manuscript changes produce graph deltas. The exact prose citation remains attached.

## Critic-loop separation

A single Maker-Checker loop is too coarse.

### Deterministic or near-deterministic checkers

- source and version integrity;
- names, dates, geography, object state;
- equations and domain facts;
- character knowledge-state contradictions;
- unauthorized changes outside range;
- formatting and assembly fidelity.

These may block automatically when evidence is clear.

### Interpretive checkers

- emotional life;
- narrative distance;
- atmosphere;
- cadence;
- mystery;
- singularity;
- relational field;
- whether prose is alive.

These return evidence, consequences, confidence, and preservation risk. They do not automatically rewrite or approve.

## Graphify assessment

Graphify is useful as an architectural reference and possibly as reusable graph infrastructure, but it is not a near-ready narrative engine. Its central advantage is deterministic code parsing. Narrative extraction is interpretive, temporally complex, viewpoint-dependent, and often intentionally ambiguous. Replacing Tree-sitter code parsing with LLM extraction changes the reliability model.

A prototype should therefore test whether adapting Graphify is cheaper and safer than building a small narrative-state service around an existing graph database or typed document store.

## LangGraph assessment

LangGraph is a strong candidate for the orchestration layer because its durable, stateful, human-in-the-loop model fits Fiction Studio's gates, blocking returns, revision caps, and explicit approval states. It should manage process state, not decide artistic truth.

## Governing warning

A novel is not an orchestrated database with decorative prose attached.

The engine must preserve the difference between:

- facts and meanings;
- meanings and interpretations;
- interpretation and narration;
- a scene contract and a scene's lived emergence;
- consistency and life.

The system succeeds only when it prevents continuity drift without converting the manuscript into a perfectly indexed corpse.
