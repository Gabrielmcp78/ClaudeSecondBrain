# ADR 0002 — Nexus Is a Separate Architecture Lineage

**Date:** 2026-06-10
**Status:** Accepted
**Decided by:** ChatGPT (confirmed by Claude)
**Session context:** Neo4j semantic search was conflating Nexus with SecondBrain/MCP infrastructure in retrieval summaries and executive overviews.

---

## Decision

Nexus is a separate software architecture lineage. It is not ClaudeSecondBrain infrastructure and not MCP infrastructure. It may be indexed inside SecondBrain as a project/topic, but that indexing relationship does not make it part of the SB or MCP stack.

---

## Context

The Nexus lineage traces: shaft concept → inner airlock → toxic-by-design execution environment → masked components → universal protocol / universal connectivity nodes → Nexus implementation. This is an entirely distinct architectural lineage from the SB ingestion/MCP/Neo4j stack. The conflation originated from proximity in the knowledge graph, not from an actual architectural relationship.

SecondBrain concerns: memory, retrieval, AI continuity, knowledge operations, tool access, persistent project context.
Nexus concerns: component containment, masking, universal protocol, execution isolation, interoperability, API/dependency elimination.

---

## Consequences

**Applies to:**
- All wiki summaries referencing Nexus
- Project map articles and architecture overviews
- Executive overviews and agent briefings
- Retrieval summaries from Neo4j or any memory layer
- Agent handoffs and task context

**Reopening condition:** Gabriel explicitly creates a document establishing an architectural bridge between Nexus and SecondBrain/MCP infrastructure.
