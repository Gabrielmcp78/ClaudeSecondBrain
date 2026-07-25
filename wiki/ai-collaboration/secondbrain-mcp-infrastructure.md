# ClaudeSecondBrain MCP Infrastructure

*Established 2026-06-05 (source: outputs/2026-06-05_session-infrastructure-buildout.md)*

---

The ClaudeSecondBrain system exposes its filesystem tools to any AI agent via a persistent MCP server over HTTP+SSE transport, tunneled publicly via Tailscale Funnel.

## Architecture

```
Any AI Agent (Gemini, Claude, etc.)
        ↓  HTTPS
https://gabrielsmini.tail26536d.ts.net/sse
        ↓  Tailscale Funnel
localhost:3456 (secondbrain-mcp-server)
        ↓  path-guarded filesystem access
/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain/
```

## MCP Server

**Location:** `/Volumes/Ready500/DEVELOPMENT/gm-mcp-hub/servers/secondbrain-mcp-server/`
**Runtime:** Node.js v26, `@modelcontextprotocol/sdk` v1.29.0
**Managed by:** launchd `com.gabrielmcp.secondbrain.mcp-server`
**Wrapper:** `~/.local/bin/secondbrain-mcp.sh` (handles external volume wait)

**Tools:** `list_directory`, `read_file`, `write_file`, `append_file`, `rename_file`, `create_directory`, `search_files`, `get_file_info`

All paths resolved relative to repo root. Path traversal outside root is blocked at the server level.

## Public Endpoint

```
https://gabrielsmini.tail26536d.ts.net/sse
```

Permanent. Managed by launchd `com.gabrielmcp.secondbrain.tunnel`. Survives reboots.

## Gemini Integration

**bridge.js** at the MCP server directory connects Gemini API to the MCP server using `mcpToTool()`. Tools are auto-discovered — no manual function declarations. System instruction loads `Gemini.md` before every operation.

```bash
GEMINI_API_KEY=key node bridge.js "your prompt"
```

## Auto-Ingestion

Files dropped into `~/Desktop/⬇️ SecondBrain Inbox` (symlink to `raw/`) trigger `ingest.sh` via launchd `WatchPaths`. Gemini CLI is the default ingestion engine and processes all unprocessed files against `Gemini.md`, writes wiki entries, and marks files `_done`.

Provider selection is controlled by `SECOND_BRAIN_AI_PROVIDER`:

```bash
SECOND_BRAIN_AI_PROVIDER=gemini ./ingest.sh
SECOND_BRAIN_AI_PROVIDER=claude ./ingest.sh
```

Gemini defaults to `/opt/homebrew/bin/gemini` and `gemini-2.5-pro`. Override with `GEMINI_CLI` or `GEMINI_MODEL` if needed.

Logs: `logs/ingest.log`

## Operating Schemas

- `CLAUDE.md` — Claude Code operating schema
- `Gemini.md` — Gemini operating schema (parallel, same rules and taxonomy)

---

## Communications Model

*(source: outputs/2026-06-08_agentic-autonomous-comms-architecture.md)*

The SecondBrain communications model is not direct agent-to-agent chat. It is an evented, durable pipeline where agents interact through a shared MCP server, filesystem ingress, and wiki-backed memory. This gives the system traceability, replayability, and a clear source of truth rather than ephemeral conversation state.

The pipeline has six layers:

**Transport / ingress.** The unified MCP server runs on port `3456` and serves both transport styles from the same codebase. ChatGPT Atlas reaches the server over Streamable HTTP at `/mcp`; Gemini and other local clients use SSE at `/sse`. The public endpoint is tunneled through Tailscale Funnel.

**Contract / tool layer.** Tools are auto-discovered through `mcpToTool()`, so the server exposes a consistent contract to connected agents without hand-maintained per-tool wiring. The MCP server also applies path validation and logging, which makes file access explicit rather than ambient.

**Ingestion / writeback.** The inbox folder is the intake surface. Files dropped into `raw/` (or its Desktop symlink) trigger `ingest.sh` via launchd `WatchPaths`, and the ingestion engine processes unhandled files against the operating schema before marking them `_done`. Raw inputs are always converted into durable knowledge artifacts before they exit the pipeline.

**Canonical memory.** `raw/` is the intake buffer, `wiki/` is the canonical knowledge base, and `outputs/` stores generated answers or reports for later re-ingestion. This is the key autonomy loop: answers become new source material, so later sessions inherit earlier reasoning instead of starting from scratch.

**Discovery / adjacency.** `wiki/_index.md` is the primary navigation surface, and `wiki/_connections.md` stores the non-obvious cross-links that make the system useful across sessions. An agent can move from one topic to the next through explicit graph adjacency rather than unstructured memory.

**Observability / verification.** Agent inbox files and the change-log record connector verification events and live MCP checks, providing a health trail: not just whether the server exists, but whether an external agent actually reached it and used it.

Agents communicate by reading the operating schema, calling MCP tools, writing durable wiki artifacts, re-ingesting outputs through the inbox, and following cross-links across the knowledge base. The design favors auditability and compounding context over conversational immediacy. It is well-suited to long-running work where the system must remember decisions, preserve ambiguity, and expose its own internal history.

## Weak Points

*(source: outputs/2026-06-08_agentic-autonomous-comms-architecture.md)*

- The architecture depends on launchd health and the WatchPaths trigger path staying functional. If the ingest watcher fails, the comms loop breaks before ingestion.
- The system relies on disciplined schema updates; if the wiki taxonomy drifts, discovery quality drops.
- The strongest behavior comes from explicit curation — "autonomous" here means self-propagating through structured writes, not fully unsupervised reasoning. [inference]
