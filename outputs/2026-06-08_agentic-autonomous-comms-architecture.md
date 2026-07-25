# Agentic Autonomous Comms Architecture

_Interpreting “agent tic” as “agentic.”_

The SecondBrain communications model is not direct agent-to-agent chat. It is an evented, durable pipeline where agents interact through a shared MCP server, filesystem ingress, and wiki-backed memory. That gives the system traceability, replayability, and a clear source of truth rather than ephemeral conversation state. (source: `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md`, `wiki/decision-records/0001-unified-mcp-server.md`)

## Core Layers

### 1) Transport / ingress
The unified MCP server runs on port `3456` and serves both transport styles from the same codebase. ChatGPT Atlas reaches the server over Streamable HTTP at `/mcp`, while Gemini and other local clients use SSE at `/sse`. The public endpoint is tunneled through Tailscale Funnel. (source: `wiki/decision-records/0001-unified-mcp-server.md`, `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md`)

### 2) Contract / tool layer
Tools are auto-discovered through `mcpToTool()`, so the server exposes a consistent contract to connected agents without hand-maintained per-tool wiring. The MCP server also applies path validation and logging, which makes file access explicit rather than ambient. (source: `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md`)

### 3) Ingestion / writeback
The inbox folder is the intake surface. Files dropped into `~/Desktop/⬇️ SecondBrain Inbox` trigger `ingest.sh` via `launchd WatchPaths`, and the ingestion engine processes unhandled files against the operating schema before marking them `_done`. That means raw inputs are always converted into durable knowledge artifacts before they exit the pipeline. (source: `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md`)

### 4) Canonical memory
`raw/` is the intake buffer, `wiki/` is the canonical knowledge base, and `outputs/` stores generated answers or reports for later re-ingestion. This is the key autonomy loop: answers become new source material, so later sessions inherit earlier reasoning instead of starting from scratch. (source: `CLAUDE.md`, `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md`)

### 5) Operating schema
`CLAUDE.md` and `Gemini.md` define the rules of engagement, the taxonomy, and the routing behavior. `Gemini.md` explicitly says it is the parallel operating schema to `CLAUDE.md`, which makes the system model-agnostic at the data layer and agent-specific only at the execution layer. (source: `CLAUDE.md`, `Gemini.md`)

### 6) Discovery / adjacency
`wiki/_index.md` is the primary navigation surface, and `wiki/_connections.md` stores the non-obvious cross-links that make the system useful across sessions. In practice, this is where autonomous comms becomes contextual: an agent can move from one topic to the next through explicit graph adjacency rather than unstructured memory. (source: `wiki/_index.md`, `wiki/_connections.md`)

### 7) Observability / verification
`wiki/inbox.md` records connector verification events and live MCP checks. That gives the architecture a health trail: not just whether the server exists, but whether an external agent actually reached it and used it. (source: `wiki/inbox.md`)

## Architectural Implication

The architecture is best understood as a durable message system with memory, not a live chat mesh. Agents communicate by:
- reading the operating schema,
- calling MCP tools,
- writing durable wiki artifacts,
- re-ingesting outputs through the inbox, and
- following cross-links across the knowledge base. (source: `CLAUDE.md`, `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md`, `wiki/_connections.md`)

That design favors auditability and compounding context over conversational immediacy. It is well-suited to long-running work where the system must remember decisions, preserve ambiguity, and expose its own internal history. (source: `CLAUDE.md`, `wiki/_meta/change-log.md`)

## Current Weak Points

- The architecture depends on launchd health and the inbox trigger path staying functional. If the server is down or the watcher fails, the comms loop breaks before ingestion. (source: `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md`)
- The system still relies on disciplined schema updates; if the wiki taxonomy drifts, discovery quality drops. (source: `CLAUDE.md`, `wiki/_index.md`)
- The strongest behavior comes from explicit curation, so “autonomous” here means self-propagating through structured writes, not fully unsupervised reasoning. [inference]

## Bottom Line

SecondBrain’s autonomous comms architecture is a layered protocol stack:
`transport -> tools -> ingestion -> canonical memory -> discovery -> verification`.
That is the right shape for an agentic system that needs to survive reboots, preserve context across models, and keep its own reasoning auditable. (source: `wiki/ai-collaboration/secondbrain-mcp-infrastructure.md`, `wiki/decision-records/0001-unified-mcp-server.md`, `wiki/_connections.md`)
