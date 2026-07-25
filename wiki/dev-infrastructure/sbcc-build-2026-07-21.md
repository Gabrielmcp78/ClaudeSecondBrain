# Second Brain Command Center — Build Chronicle
**Date**: 2026-07-21 → 2026-07-22  
**Session span**: Two conversations (context rollover)  
**Status**: COMPLETE · All services live

---

## What Was Built

The **SecondBrain Command Center (SBCC)** — a native Python C2 layer for
the neo4j knowledge graph, installed at:

`/Volumes/Ready500/DEVELOPMENT/SecondBrainCommandCenter`

### Components

| File | Role |
|---|---|
| `sbcc/graph.py` | Core graph client (`SBGraph`): stats, recall, bridges, heal, feeds |
| `sbcc/server.py` | FastAPI HTTP server + static dashboard host, port 10890 |
| `sbcc/cli.py` | argparse CLI — 9 subcommands including `context` Shortcut hook |
| `sbcc/synthesize.py` | 5-step scheduled synthesis loop |
| `sbcc/static/index.html` | Alpine.js single-page dashboard (no build step) |
| `scripts/shortcut-context.sh` | Apple Shortcuts / Alfred entrypoint |
| `launchd/*.plist` | Persistent dashboard + daily synthesis services |
| `README.md` | Full architecture + setup + usage docs |

---

## Key Technical Discoveries

### 1. Concept nodes are project-siloed
All 20,462 Concept nodes belong exclusively to ChatGPT Archive (Top) and
(Bottom). No creative projects (String Theory, VCH, Shakespearience) have
any Concept nodes. The `REALIZES_CONCEPT` path from DocChunk reaches only
1924 of 20,462 concepts.

**Resolution**: Rewrote `concept_bridges()` to use the 103k stored
384-dim embeddings directly — pass stored float lists back into
`db.index.vector.queryNodes` as query vectors, bypassing the local
encoder entirely for cross-project similarity mining.

### 2. Project fragmentation was severe
38 Project nodes existed (should be 10). String Theory had 14 separate
nodes, Literary Manuscript 9, Shakespearience 4, claude_conversations 3.

**Resolution**: `merge_duplicates(apply=True)` consolidated to 10 canonical
nodes. Zero data loss confirmed (2529 docs, 103k chunks, 9755 messages intact).

### 3. Two Cypher bugs in the neo4j-memory MCP server (patched previous session)
- `_find_conversations`: double-WHERE syntax error (patched)
- `_get_memory_stats`: cartesian product explosion inflating total_chars to
  649 billion (patched with COUNT{} subqueries)

### 4. `ORDER BY … NULLS LAST` not supported
Neo4j 2025.09 rejects `NULLS LAST`; replaced with `coalesce(field, '')`.

### 5. Vector index dimension mismatch
`message_embeddings` index is 1536-dim (OpenAI embedder);
`docchunk_vec_idx` is 384-dim (all-MiniLM-L6-v2). Implemented
`_index_dimension()` to read `SHOW INDEXES` and skip incompatible planes.

---

## Bridge Map Summary (post-heal, 2026-07-22)

Top semantic bridges from the merged 10-project graph:

| Bridge | Score | Hits |
|---|---|---|
| Literary_Manuscript ↔ claude_conversations | 0.946 | 23 |
| ChatGPT Archive (Top) ↔ claude_conversations | 0.935 | 6 |
| ChatGPT Archive (Top) ↔ Literary_Manuscript | 0.930 | 25 |
| The Vibrational Universe ↔ claude_conversations | 0.858 | 22 |
| AI_Skills_Development ↔ claude_conversations | 0.889 | 29 |
| String Theory ↔ claude_conversations | 0.842 | 15 |
| String Theory ↔ The Vibrational Universe | 0.815 | 2 |

**Core finding**: VCH is the unifying substrate. String Theory, The
Vibrational Universe, Literary Manuscript, and Canvas-Design all orbit
the same gravitational centre: resonance, transformation, physics/consciousness.

---

## Services

```
com.gabrielmcp.sbcc.server    → running (PID 96337 at install)
com.gabrielmcp.sbcc.synthesis → scheduled daily 06:00
```

Dashboard: `http://127.0.0.1:10890/`  
API docs: `http://127.0.0.1:10890/docs`

---

## Cross-References
- `wiki/_connections.md` — live semantic bridge map (refreshed by synthesis loop)
- `wiki/synthesis/2026-07-22.md` — first synthesis note
- `wiki/ai-collaboration/chronicle-secondbrain-routing-2026-07-20.md` — prior session
- `neo4j-memory MCP` patched at `/Volumes/Ready500/DEVELOPMENT/neo4j_json_ingester/mcp_server.py`
