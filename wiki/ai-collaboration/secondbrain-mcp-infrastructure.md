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

Files dropped into `~/Desktop/⬇️ SecondBrain Inbox` (symlink to `raw/`) trigger `ingest.sh` via launchd `WatchPaths`. Claude Code CLI processes all unprocessed files against `CLAUDE.md` schema, writes wiki entries, marks files `_done`.

Logs: `logs/ingest.log`

## Operating Schemas

- `CLAUDE.md` — Claude Code operating schema
- `Gemini.md` — Gemini operating schema (parallel, same rules and taxonomy)
