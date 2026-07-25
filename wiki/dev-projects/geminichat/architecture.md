# GeminiChatter — Architecture

*Source: `outputs/2026-06-05_session-infrastructure-buildout.md` (Section 8 — GeminiChatter audit)*  
*Last verified: 2026-06-05 (Claude). Re-verify against live source before any work.*  
*Location: `/Volumes/Ready500/DEVELOPMENT/GeminiChatter`*

---

## Status

`[historical: 2026-06-05]` — Audited once at project inception. The working/broken breakdown below reflects state at that date. The project was scheduled for a follow-up Claude Code session to clean up stubs and wire in the MCP server; whether that occurred is unverified.

---

## Purpose

A native macOS chat application that connects to the Gemini API with a persistent memory service. Distinct from the `bridge.js` Gemini↔MCP connector — GeminiChatter is a user-facing GUI, not an agent bridge.

---

## Stack

| Layer | Technology |
|-------|-----------|
| UI | Swift / SwiftUI (LiquidGlass design language, macOS 26 target) |
| AI client | `GoogleGenerativeAI` Swift SDK (`gemini-2.0-flash`) |
| Memory | FastAPI + PostgreSQL + Redis (Dockerized), `scalable_memory_service.py` |
| Memory bridge | `SeamlessMemoryClient.swift` — HTTP to FastAPI service |
| Personality | `PersonalitySystem.swift` — prompt enhancement layer |

---

## Working (as of 2026-06-05)

- SwiftUI interface: `ContentView`, `GeminiService`, `FileImportView`
- `GoogleGenerativeAI` SDK integration functional
- `PersonalitySystem.swift` — sophisticated prompt enhancement
- `SeamlessMemoryClient.swift` — HTTP bridge to FastAPI
- `scalable_memory_service.py` — FastAPI + PostgreSQL + Redis
- `docker-compose.yml` — postgres, redis, memory_service

---

## Broken / Incomplete (as of 2026-06-05)

- API key hardcoded in `GeminiService.swift` — must move to Keychain
- Firebase framework references in `.pbxproj` but source uses `GoogleGenerativeAI` — build phase conflict
- `mem0_mcp_server/` directory: all stubs — `memory_manager.py` and `apple_intelligence.py` return `{"status": "not_implemented"}`, wired to nothing
- macOS 26.0 deployment target requires Xcode 26 beta
- 5 historical worktree/snapshot directories at repo root (thousands of duplicate files)

---

## Planned Integration

The unfinished REST adapter in `secondbrain-mcp-server` (`POST /call`, `GET /tools`) was intended to allow GeminiChatter to connect to SecondBrain via Swift function declarations rather than the bridge.js SSE path. This integration is `[unverified]` as of this article — check the MCP server for the current state of `/call`.

---

## Connections

- `ai-collaboration/secondbrain-mcp-infrastructure.md` — MCP server GeminiChatter was intended to connect to via `/call` REST endpoint
- `dev-infrastructure/` — `bridge.js` is the alternative Gemini↔MCP connector (CLI-based, no GUI)
