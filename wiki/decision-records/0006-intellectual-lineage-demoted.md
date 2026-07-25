# ADR 0006 — Intellectual Lineage Tracking Demoted from Standalone Directory

*Decided: 2026-06-08 (GPT/Emily o3 architecture evaluation, Claude ratification)*  
*Status: Settled — do not reopen without explicit Gabriel authorization*

---

## Decision

The `wiki/intellectual-lineage/` directory was created during the 2026-06-05 architecture upgrade but is deliberately kept empty and demoted. Lineage tracking — the pedigree and evolution of ideas across thinkers — is handled as sections within existing wiki articles and as `Lineage:` entries in `wiki/_connections.md`. It does not have its own top-level namespace.

---

## Context

GPT proposed a dedicated `wiki/intellectual-lineage/` folder to document idea pedigree: e.g., how Grant's Unity Harmonica framework evolved into Gabriel's GHRM, or how Penrose's Orch OR influenced VCH. The reasoning was academic rigor and attribution clarity.

---

## Rationale for Demotion

A standalone directory creates micro-stubs in violation of CLAUDE.md's "no micro-stubs" rule. Every lineage relationship is, by definition, already a cross-domain connection — meaning it belongs in `_connections.md`. Lineage entries significant enough to merit standalone articles are significant enough to appear as sections within the relevant framework article (e.g., "Relationship to Unity Harmonica" lives inside `ghrm-framework.md`, not as `intellectual-lineage/ghrm-unity-harmonica.md`).

The directory was also empty at the time of evaluation, making demotion low-friction.

---

## Governing Patterns

- Lineage maps → sections in the relevant primary article, labeled `[external research]` or `[verified]` as appropriate
- Cross-thinker connections → `wiki/_connections.md` under a `Lineage:` prefix
- The `wiki/intellectual-lineage/` directory remains in the filesystem as a placeholder; agents must not write articles into it

---

## Reopening Condition

Gabriel explicitly creates a lineage article that cannot fit within an existing framework article and cannot be adequately captured by a `_connections.md` entry.

---

*(Source: `outputs/2026-06-08_gpt-architecture-evaluation.md`, Section 4)*
