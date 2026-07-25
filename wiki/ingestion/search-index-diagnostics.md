

## Search Index Diagnostics - 2026-07-23
# Search Index Diagnostics

This note records observed search behavior during the 2026-07-23 control-system and knowledge-ingestion pass.

## Observed behavior

- `SecondBrain._secondbrain_append_note` reported successful appends for new wiki pages.
- Local `secondbrain` workspace search returned no hits for several obvious new and existing terms.
- Drive search surfaced key markdown files including `_index.md`, `_connections.md`, `change-log.md`, `agent-protocol.md`, `handoffs.md`, `inbox.md`, and `task-ledger.md`.
- Drive search was useful but uneven for compound/OR-style queries.

## Practical rule

When a SecondBrain workspace search returns no hits, do not assume the knowledge does not exist. Try Drive search, exact file names, simpler terms, and known IDs/paths.

## Recommended follow-up

- Determine whether local `secondbrain` workspace search points to the same root as the wiki append tool.
- Add or repair an index refresh process if available.
- Prefer updating `_index.md`, `change-log.md`, and `task-ledger.md` after new pages so there are multiple discovery routes.
- Use exact paths from append responses as confirmation when search indexing lags.

## Agent warning

Search misses are not source truth. Treat them as retrieval uncertainty and disclose the gap when it affects the task.
