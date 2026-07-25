# Gabriel's Automation & Workflow Rules

*This page documents the official automation priority standards, manuscript export systems, and directory paths established for Gabriel McPherson's workspace.* (source: raw/master_components.md, raw/master_connections.md)

---

## 1. Automation Priority Rule

Established on March 28, 2026, to govern all workspace scripting, file actions, and workflow creations:

$$\text{Automation Priority} = \text{macOS Shortcuts} \longrightarrow \text{Compiled .app} \longrightarrow \text{AppleScript} \longrightarrow \text{Shell Scripts / LaunchAgents}$$

- **Shortcuts First**: Always attempt to build automation tasks using **macOS Shortcuts** first. Shortcuts handles the vast majority of operations natively without adding background processes or custom configuration overhead.
- **Daemons as Last Resort**: Shell scripts, LaunchAgents, or background system daemons are treated as a last resort, reserved only for tasks that cannot be accomplished within native macOS Shortcuts or AppleScript frameworks.

---

## 2. Pages to DOCX Export System

A specialized automation system runs locally to compile and archive manuscript chapters:
- **Application**: `/Applications/Export to Manuscript Masters.app`
- **File Tagging**: The export compiler uses `mdfind` to locate files tagged with the custom metadata query:
  ```bash
  mdfind "kMDItemUserTags == 'Manuscript'"
  ```
- **Sync Targets**:
  - **Local Google Drive Client**: `~/Library/CloudStorage/GoogleDrive-gabemcpherson@gmail.com/My Drive/`
  - **Manuscript Masters Target Folder**: `~/Library/CloudStorage/GoogleDrive-gabemcpherson@gmail.com/My Drive/Manuscript Masters`

---

## 3. "Secondbrain" Routing Rule

Established 2026-07-20. `[verified]` — confirmed directly by Gabriel in-session.

When Gabriel says **"send this to secondbrain"** — or chronicle it, save it, add this to memory — the destination is the knowledge system itself:

- **neo4j-memory graph** — cross-session recall, stored via `store_conversation` under project `claude_conversations`.
- **ClaudeSecondBrain KB wiki** — the durable human-readable companion, routed through the `second-brain-kb` protocol into the correct domain folder.

Email carries none of this traffic. "Secondbrain" is a place inside Gabriel's own system, reached through MCP tools, and a chronicle request means write to both stores unless Gabriel names just one.

Origin: [Chronicle — secondbrain resolves to the knowledge system](chronicle-secondbrain-routing-2026-07-20.md).
