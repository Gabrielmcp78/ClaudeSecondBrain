# Google Drive auth failure — diagnosis (2026-07-18)

## Root cause

The rclone `gdrive:` remote's OAuth refresh token is dead. `rclone backend get gdrive:` returns:

```
couldn't fetch token: invalid_grant: maybe token expired? - try refreshing with "rclone config reconnect gdrive:"
```

Both consumers of Google Drive share this one rclone remote, so both are broken the same way:

- `sync.sh` (the ClaudeSecondBrain ↔ Drive rclone sync, run every ~10 min via the local sync runner) — every `Inbox → raw/`, `wiki/ → Drive`, `outputs/ → Drive`, `raw/ → Drive` leg has been failing with this exact error since at least 2026-07-18 10:34, and likely since the token's last recorded expiry of **2026-06-16** (source: `rclone.conf`, source: `~/Library/Logs/secondbrain/sync.log`).
- The live MCP server's `drive.*` / `secondbrain.import_drive_doc` tools (the API surface ChatGPT/Atlas uses) call the identical `getGDriveAccessToken()` → `rclone backend get gdrive:` → read `rclone.conf` chain. Confirmed against the actually-running process at `/Volumes/Ready500/DEVELOPMENT/gm-mcp-hub/servers/secondbrain-mcp-server/index.js` (PID 917, health check OK, root correctly `ClaudeSecondBrain`) — same broken auth path, same failure mode. (source: live process inspection)

This is **not** a Google Drive Desktop app problem. `~/Library/CloudStorage/GoogleDrive-gabemcpherson@gmail.com` is present and mounted normally — the `google_drive` / `manuscripts` safe roots used for local file reads are unaffected. This is specifically the rclone OAuth client (`client_id ...jmg.apps.googleusercontent.com`) used for Drive API calls (sync + the `drive.*` MCP tools).

## Secondary finding: silent failure in sync.sh

`sync.sh` never checks `rclone`'s exit code — each `$RCLONE sync ... 2>/dev/null` line is followed unconditionally by a `log "... done"` line. Every sync for the last month has logged "done" while actually failing. This is why the outage went unnoticed: the log looks healthy at a glance.

## Fix

1. In a Terminal on Gabriel's Mac (interactive browser OAuth, cannot be done remotely): `rclone config reconnect gdrive:` — re-authorizes the existing `gdrive` remote against `gabemcpherson@gmail.com`, writes a fresh access/refresh token pair into `~/.config/rclone/rclone.conf`.
2. Verify: `rclone backend get gdrive:` should return JSON instead of `invalid_grant`.
3. No MCP server restart should be required — `getGDriveAccessToken()` re-reads `rclone.conf` on every call — but restart `gm-mcp-hub`'s `secondbrain-mcp-server` (PID 917) if `drive.*` tools still fail after step 2.
4. Recommended hardening: add `|| log "ERROR: <leg> failed"` after each `$RCLONE` call in `sync.sh` so future auth breaks show up as errors in the log instead of false "done" lines.

## Why the grant likely died

Token history shows a clean refresh cycle up to `2026-06-16T16:40:56-05:00`, then `invalid_grant` from then on. Typical causes for an OAuth refresh token to die outside of normal 6-month inactivity: the Google Cloud OAuth consent screen for this client is still in "Testing" publishing status (test-app refresh tokens can be force-expired), a Google Account security event (password change, "Sign in with Google" third-party access review) around that date, or the app's access was manually revoked under myaccount.google.com/permissions. Worth checking the OAuth consent screen's publishing status in Google Cloud Console if this recurs after reconnecting — moving it out of Testing avoids the forced-expiry class of failure.
