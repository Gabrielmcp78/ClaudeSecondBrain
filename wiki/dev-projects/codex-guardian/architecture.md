# Codex Guardian — Project Architecture

*Codex Guardian (OpenAI Codex CLI) is a terminal-based coding agent and project guard system designed to read repositories, apply file edits, execute tests, and enforce phase compliance via an active environment sandbox.* (source: README.md, CLAUDE.md, MCP_Servers_Collection.md)

<!-- kb-status: level=active | phase="Phase 03b — Live Verification" | updated=2026-06-09 -->
**Status:** 🟡 Active — Phase 03b (Live Verification) · Last updated: 2026-06-09

---

## Architecture Components

The codebase spans CLI execution packages, sandboxing tools, and monitoring apps:

```
codex/
├── package.json                   # CLI metadata and release scripts
├── codex-cli/                     # CLI codebase, sandboxing configurations, and commands
│   ├── src/                       # CLI source files (built via Vitest/TypeScript)
│   └── scripts/                   # OS sandboxing runtime scripts
├── MCPMonitorApp.swift            # Swift-based desktop monitor for the MCP ecosystem
└── MCP_Memory_Comms_Instructions.md # Memory and communication specifications
```

---

## Security & Sandboxing Model

To run model-generated code safely, Codex implements a multi-tier sandboxing model determined by the host OS:

### macOS 12+ (Apple Seatbelt)
Shell commands and execution scripts are executed using `sandbox-exec` (Apple Seatbelt):
- The execution process is placed inside a read-only jail.
- Write access is strictly limited to `$PWD`, `$TMPDIR`, and the user's config directory (`~/.codex/`).
- Outbound network traffic is completely blocked by default.

### Linux (Docker Container)
For Linux hosts, Codex is executed inside a Docker container using `run_in_container.sh`:
- Mounts the working repository read-write.
- Utilizes `iptables` and `ipset` rules to deny all outbound network connections, except directly to the OpenAI API endpoint.

---

## CLI Approval Modes

The user configures agent autonomy via the `--approval-mode` (or `-a`) flag:

| Mode | File Operations | Shell Commands |
|---|---|---|
| **Suggest** *(Default)* | Ask before every write | Ask before every run |
| **Auto Edit** | Read/write files autonomously | Ask before every run |
| **Full Auto** | Read/write files autonomously | Run autonomously (sandboxed, network-blocked) |

---

## Configuration Hierarchy

Guidance instructions are merged in three hierarchical layers:
1. **Global Settings**: Loaded from `~/.codex/config.yaml` and `~/.codex/instructions.md`.
2. **Project Settings**: Shared project-wide via a `codex.md` file located at the repository root.
3. **Sub-package Settings**: Specific sub-package constraints defined in a `codex.md` file within the current working directory.

---

## Codex Guardian Phase Enforcement

Codex Guardian acts as an active CI/CD guard, dynamically writing the `Codex Guardian — Active Phase Context` block to the project's `CLAUDE.md` files:
- **Phase Definition**: Ingests active context from `.codex.json` to define the project phase (e.g., Phase 03 - Active Development).
- **Compliance Rules**: Injects allowed vs. forbidden behaviors (e.g., forbidding mock authentication in production paths, empty TODO stubs, or hardcoded credentials).
- **Recommended Actions**: Triages repository states and details next immediate tasks to clear the exit gate.
- **Handoff Compliance**: Intercepts AI developer runs to ensure operations conform to local development policies.
