# ADR 0001 — Unified MCP Server Architecture

## Context and Problem Statement
Originally, the second brain codebase supported two distinct AI interfaces with different transport mechanisms:
1. Gemini accessed the server via Server-Sent Events (SSE) at `/sse` and `/messages`.
2. ChatGPT (via Atlas integration) required a Streamable HTTP protocol endpoint exposed via a public Tailscale Funnel.

Operating two separate server codebases or running multiple instances caused port conflicts, high resource usage, and complex launchd management, as well as divergence in the available tools.

## Alternatives Considered
- **Run separate instances:** Keep SSE and HTTP servers separate. This increases operational complexity, double-exposes public endpoints, and complicates debugging.
- **Unified single server (Selected):** Consolidate SSE and HTTP endpoints into a single Express app running on port 3456. Both interfaces share the same safePath validation, semantic and low-level tools, and logging structures.

## Decision
Unify both transport layers into a single server at `mcp-server/index.js` running on port 3456. The Tailscale funnel maps directly to this port, allowing ChatGPT Atlas to hit `/mcp` while Gemini and other local/SSE clients connect to `/sse`.

## Confidence Level
100/100. Verification confirmed both SSE and HTTP protocols successfully functioning under a single process with no port-sharing collisions.
