# ClaudeSecondBrain MCP Server

Remote MCP surface for ChatGPT/Atlas developer-mode connectors.

## Local start

```bash
npm install
npm run mcp
```

The Streamable HTTP endpoint is:

```text
http://localhost:3456/mcp
```

Health check:

```bash
curl http://localhost:3456/health
```

## Public HTTPS

ChatGPT requires a public HTTPS MCP endpoint. For local testing:

```bash
cloudflared tunnel --url http://localhost:3456
```

Then use the generated URL with `/mcp`, for example:

```text
https://example.trycloudflare.com/mcp
```

## Tools

- `secondbrain.search`
- `secondbrain.read`
- `secondbrain.write_inbox`
- `secondbrain.append_note`
- `secondbrain.link_notes`
- `secondbrain.recent_changes`
- `secondbrain.verify`
- `secondbrain.import_drive_doc`
- `workspace.list_directory`
- `workspace.read_file`
- `workspace.get_file_info`
- `workspace.search`
- `drive.get_file_metadata`
- `drive.search`
- `drive.read_doc`
- `drive.append_doc`
- `drive.replace_doc_text`
- `drive.create_doc`
- `move_drive_file`

## Safe workspace roots

Most legacy filesystem tools are still scoped to the ClaudeSecondBrain repo root. New workspace tools use named safe roots:

- `secondbrain` -> `ClaudeSecondBrain`
- `google_drive` -> local Google Drive cloud storage
- `development` -> `/Volumes/Ready500/DEVELOPMENT`
- `manuscripts` -> Google Drive Manuscripts folder

Override or extend these with `SECONDBRAIN_SAFE_ROOTS_JSON`, for example:

```bash
SECONDBRAIN_SAFE_ROOTS_JSON='{"research":"/path/to/research"}' npm run mcp
```

Read access can use any configured safe root through `workspace.list_directory`, `workspace.read_file`, `workspace.get_file_info`, and `workspace.search`. Write access remains conservative: `secondbrain.import_drive_doc` only writes into `raw/`, `wiki/`, `outputs/`, or `handoff/` inside ClaudeSecondBrain.

## Drive Doc Import v1

- `drive.read_doc({ url_or_file_id })` resolves a Google Docs URL or file ID, exports the document, and returns text plus metadata.
- `secondbrain.import_drive_doc({ url_or_file_id, target_path })` exports the document, prepends provenance metadata, and writes a snapshot into the SecondBrain repo. Existing files are not overwritten unless `overwrite: true` is passed.
- `workspace.search({ root, query, file_types })` searches safe-root filenames and supported text-like file contents; `google_drive` and `manuscripts` also search native Google Docs through the Drive API.

## Google Docs Write v1

The Docs write layer is intentionally conservative:

- `drive.create_doc({ title, content, parent_folder_id })` creates a separate Google Doc for reports or generated drafts.
- `drive.append_doc({ url_or_file_id, content })` appends text to the end of an existing native Google Doc.
- `drive.replace_doc_text({ url_or_file_id, old_text, new_text, expected_matches })` replaces exact text only after the server verifies the expected match count.

There is no blind full-document overwrite tool.

Server instructions tell ChatGPT to start with `wiki/_meta/agent-protocol.md`, `wiki/_meta/task-ledger.md`, `wiki/_meta/decision-registry.md`, `wiki/_agents/chatgpt/inbox.md` (HIGH PRIORITY dispatches first), `wiki/_meta/handoffs.md`, then `wiki/_index.md` and `wiki/_connections.md` when system context is needed. The full operating schema is in `CHATGPT_SYSTEM_PROMPT.md` at the repo root and should be pasted into the GPT's System Instructions field in the GPT builder. The `SERVER_INSTRUCTIONS` string in `index.js` is a protocol-level backstop delivered via the MCP `initialize` handshake — it is not a substitute for the system prompt.
