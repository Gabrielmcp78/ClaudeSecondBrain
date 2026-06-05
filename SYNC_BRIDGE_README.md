# Neo4j ↔ ClaudeSecondBrain Sync Bridge

A standalone Python script that bridges the Neo4j conversation knowledge graph
with the human-readable wiki in `ClaudeSecondBrain/wiki/`.

---

## What it does

| Step | Action |
|------|--------|
| 1 | Connects to Neo4j (`bolt://localhost:7687` or `NEO4J_URI`) |
| 2 | Queries every Project with conversation + message stats |
| 3 | Routes each project to the correct wiki domain folder via `DOMAIN_ROUTING` |
| 4 | Fetches the most informative text chunks as topic samples |
| 5 | Generates a Markdown article per project |
| 6 | Writes to `wiki/<domain>/<project-slug>.md` (skips existing unless `--force`) |
| 7 | Infers and appends cross-domain connections to `wiki/_connections.md` |
| 8 | Appends to `wiki/_meta/change-log.md` |
| 9 | Saves a full report to `outputs/YYYY-MM-DD_neo4j-sync.md` |

---

## Quick start

```bash
# 1. Preview — no files touched
./sync.sh --dry-run

# 2. Live sync
./sync.sh

# 3. Force-regenerate all articles
./sync.sh --force

# 4. One domain only
./sync.sh --domain dev-projects
./sync.sh --domain craft-fiction
./sync.sh --domain theory-consciousness
```

---

## Environment variables

Set in `.env` (auto-loaded from `neo4j_json_ingester/.env`) or shell:

| Variable | Default | Description |
|----------|---------|-------------|
| `NEO4J_URI` | `neo4j://localhost:7687` | Neo4j bolt URI |
| `NEO4J_USER` | `neo4j` | Username |
| `NEO4J_PASS` | *required* | Password |
| `NEO4J_DATABASE` | *(default db)* | Optional named database |

---

## Domain routing

Project names in Neo4j are matched against keywords in `DOMAIN_ROUTING` to
land in the right wiki folder:

| Keyword match | Wiki folder |
|--------------|-------------|
| `string theory` / `stringtheory` | `craft-fiction/string-theory` |
| `burnthrough` / `aegis` | `craft-fiction/aegis-cycle` |
| `vch` / `vibrational` / `ghrm` | `theory-consciousness` |
| `codex guardian` | `dev-projects/codex-guardian` |
| `writetrack` | `dev-projects/writetrack` |
| `mcp` / `neo4j` / `mem0` | `dev-infrastructure` |
| *(no match)* | `reference-external` |

To add a new project, append a `(keyword, folder)` tuple to `DOMAIN_ROUTING`
in `neo4j_sync_bridge.py`.

---

## Output structure

```
ClaudeSecondBrain/
├── neo4j_sync_bridge.py        ← this script
├── sync.sh                     ← shell runner
├── wiki/
│   ├── _connections.md         ← new connections appended here
│   ├── _meta/change-log.md     ← each run logged here
│   ├── dev-projects/
│   │   ├── codex-guardian/
│   │   │   └── <project-slug>.md   ← generated articles
│   │   └── ...
│   └── ...
└── outputs/
    └── 2026-06-02_neo4j-sync.md    ← full run report
```

---

## Idempotency

Running the script multiple times is safe:

- Articles that already exist are **skipped** (use `--force` to overwrite).
- Connection entries are checked for duplicates before appending.
- Change-log entries accumulate but never duplicate.

---

## Dependencies

```bash
pip install neo4j python-dotenv
# sentence-transformers is optional (used only for semantic queries, not this bridge)
```

The script reuses the venv from `neo4j_json_ingester/.venv` if present.

---

## Integration with ClaudeSecondBrain sessions

At the start of any session I (Claude) should:

1. Read `CLAUDE.md` — the master schema.
2. Search `Mem0_local_M26` and `neo4j-memory` MCP tools for live context.
3. Read `wiki/_index.md` for article navigation.

The sync bridge runs separately (on demand or cron) to keep the wiki articles
aligned with what's growing in the graph.  The two systems are complementary:

- **Neo4j** = live, semantic, searchable across 454+ conversations
- **Wiki** = durable, human-readable, narrative-form canonical reference
