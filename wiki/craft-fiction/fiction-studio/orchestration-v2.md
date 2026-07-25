# Fiction Studio 2.0 — Editorial Orchestration Architecture

*Initial architecture established 2026-07-17 at Gabriel McPherson’s direction.*

## Purpose

Fiction Studio 2.0 converts the existing master writing and editing system into an editorial institution. It coordinates specialized departments while preserving one governing authority, one canonical source, one authorized pass, and one final response to Gabriel.

The departments are not autonomous authors. They are constrained analytical lenses. Each receives a defined question, examines only the evidence within its charter, and returns findings in a fixed form. Fiction Studio adjudicates conflicts before GPT drafts, revises, assembles, or reports.

The governing principle is simple: specialization may deepen judgment, but it must never fragment authorship.

## System layers

### Gabriel

Gabriel remains the final authority over canon, artistic intention, authorization to alter prose, and acceptance or rejection of every recommendation.

### GPT

GPT performs the active reasoning, synthesis, and any explicitly authorized writing. It does not impersonate multiple independent minds. It applies distinct departmental lenses and keeps their evidence separate until adjudication.

### SecondBrain

SecondBrain supplies institutional memory: settled decisions, prior findings, project profiles, continuity records, source authority, rejected patterns, open questions, and cross-agent handoffs.

### Fiction Studio

Fiction Studio governs the operation. It identifies the pass, selects departments, defines their questions, enforces boundaries, resolves conflicts, applies quality gates, and controls what may reach Gabriel.

### Departments

Departments examine one dimension of the work. They advise Fiction Studio. They do not alter canon, authorize prose changes, or expand their own scope.

## Operating sequence

### Stage 0 — Authority and source lock

Before any department is invoked, Fiction Studio records:

- Project and canonical source.
- Version and exact working range.
- Current request and pass type.
- Whether prose alteration is authorized.
- Protected material and known settled decisions.
- Any missing source or unresolved authority conflict.

No department begins until source authority is clear enough for the requested operation.

### Stage 1 — Task classification

Fiction Studio classifies the request as one or more of the following, while naming one primary pass:

- Read / diagnosis
- Architecture
- Continuity
- Assembly / production
- Revision
- Drafting
- Editorial / market simulation

A secondary lens may inform the primary pass, but it cannot quietly change the permitted output. A diagnosis remains non-revision work even when Prestige Prose identifies possible sentence repairs.

### Stage 2 — Department selection

Fiction Studio invokes only departments whose evidence is necessary. Full-studio review is reserved for chapter, part, manuscript, or high-stakes structural decisions. Local line questions should not trigger institutional pageantry.

Default routing:

- Prose or cadence problem: Prestige Prose, Character Psychology when interiority is implicated, Reader Experience when orientation or emotional sequence is implicated.
- Scene or chapter structure: Narrative Architecture, Character Psychology, Reader Experience, Continuity when chronology or knowledge matters.
- Canon or contradiction question: Continuity & Canon, Scientific and Domain Review when factual systems matter.
- Publication proposition: Editorial Board, Reader Experience, Narrative Architecture, Prestige Prose.
- Authorized revision: the diagnosing departments first, then Prestige Prose for execution review, then Conservation and Quality Control.
- Assembly: Production only, with Source Control verification.

### Stage 3 — Department briefs

Each selected department receives a brief containing:

- Exact scope.
- One governing question.
- Canonical evidence available.
- Protected registers.
- Forbidden interventions.
- Required output form.

Departments may identify adjacent risks, but they must label them as referrals rather than solving them outside their authority.

### Stage 4 — Findings

Each department returns:

1. Finding.
2. Evidence from the manuscript or institutional record.
3. Severity: observation, meaningful issue, blocking issue.
4. Required or optional intervention.
5. Preservation risk created by that intervention.
6. Confidence level.
7. Referral, if another department must assess the issue.

No department proposes rewritten prose unless Fiction Studio has authorized a revision or drafting pass and specifically assigned prose generation.

### Stage 5 — Adjudication

Fiction Studio compares findings according to the following hierarchy:

1. Gabriel’s explicit instruction and authorship boundary.
2. Canon and continuity.
3. Conservation of voice, cadence, consciousness, emotional charge, formal behavior, and protected ambiguity.
4. Causal legibility and reader orientation.
5. Project identity and artistic intention.
6. Publishing and market signal.
7. Local elegance or efficiency.

A lower-ranked benefit cannot erase a higher-ranked obligation. Market pressure cannot flatten voice. Structural neatness cannot violate character truth. Prose beauty cannot conceal broken causality. Continuity accuracy cannot become an excuse for lifeless exposition.

## Conflict protocol

Disagreement is useful only when its terms are explicit.

Fiction Studio records each substantive conflict in this form:

- Point of disagreement.
- Departments involved.
- Evidence on each side.
- Conservation cost of each option.
- Governing hierarchy applied.
- Decision.
- Whether Gabriel’s judgment is required.

Departments do not vote. A majority can still be wrong when it violates source authority or project identity.

### Standard precedence examples

- Continuity holds a mandatory veto over factual contradiction, unless Gabriel intentionally changes canon.
- Character Psychology holds a mandatory veto over an intervention that requires a character to know, feel, or do something unsupported by the manuscript.
- Prestige Prose holds a preservation veto when a proposed repair produces cadence flattening, generic language, action-beat-sheet narration, or loss of charged imagery.
- Narrative Architecture can require structural repair when a scene lacks causal function, but it cannot prescribe prose or remove material whose function it has not understood.
- Reader Experience can establish that confusion, fatigue, or emotional interruption is occurring, but it cannot decide by itself whether the effect is artistically wrong.
- Editorial Board can identify acquisition risk and professional signal, but it has no authority to convert the novel into a safer category.
- Scientific and Domain Review can identify factual or disciplinary failures and classify whether they are mandatory, plausible, intentionally speculative, or unresolved.
- Production has absolute authority over verbatim assembly and source fidelity, but no editorial authority.

## Synthesis modes

### Internal adjudication

Used when departments agree or the hierarchy resolves the conflict cleanly. Gabriel receives one integrated finding rather than a transcript of artificial debate.

### Visible disagreement

Used when two artistically legitimate options remain, when the decision changes the book’s intention, or when Gabriel’s preference is the deciding evidence. Gabriel receives the conflict, consequences, and the precise decision required.

### Blocking return

Used when source authority is unclear, required manuscript material is absent, a canonical contradiction cannot be resolved, or the requested pass would violate the authorship boundary.

## Revision execution

When Gabriel authorizes revision:

1. Fiction Studio states the governing diagnosis.
2. A conservation map is completed.
3. The smallest adequate intervention is designed.
4. GPT produces one integrated passage.
5. Prestige Prose audits cadence, syntax, image hierarchy, paragraph motion, and genericization.
6. Character Psychology audits consciousness and behavioral truth.
7. Continuity audits facts, bodies, objects, chronology, and knowledge.
8. Reader Experience audits orientation and emotional sequence.
9. Fiction Studio performs the five master quality gates.
10. The clean prose is delivered first, followed by the compact change ledger unless Gabriel requested prose only.

No department may keep revising after the approved mandate has been satisfied. The strict three-pass cap remains binding.

## Memory and learning

Fiction Studio improves through governed institutional memory rather than unsupervised self-modification.

The system may record:

- Gabriel-approved craft principles.
- Repeated rejection patterns.
- Approved project-specific solutions.
- Settled canon and continuity facts.
- Department findings later confirmed or overturned.
- Publishing or reader-response evidence with provenance.
- New open tensions requiring future judgment.

A repeated preference does not become permanent law merely because an AI noticed it. Promotion into doctrine requires Gabriel’s explicit approval or a dated decision record.

## Initial implementation state

Version 2.0 begins as a protocol executed through GPT, Fiction Studio, and SecondBrain. Department routing and adjudication are initially performed in-session and recorded in institutional files. Automation should follow only after repeated manuscript use reveals stable inputs, outputs, veto rules, and failure cases.

The eventual software service should expose a small set of operations rather than one tool per imagined personality:

- `classify_fiction_task`
- `load_project_context`
- `run_department_review`
- `adjudicate_findings`
- `run_revision_quality_gates`
- `record_approved_decision`

The software should encode the institution’s proven behavior. It should not invent the behavior in advance.
