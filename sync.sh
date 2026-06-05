#!/bin/zsh
# sync.sh — ClaudeSecondBrain ↔ Google Drive sync
#
# Zone ownership rules:
#   raw/     → INBOUND ONLY  : Drive Inbox/ → local raw/ (new files only, never delete)
#   wiki/    → PUBLISH ONLY  : local wiki/ → Drive wiki/ (local is source of truth)
#   outputs/ → PUBLISH ONLY  : local outputs/ → Drive outputs/ (local is source of truth)
#
# The inbound-only rule for raw/ prevents the output→raw→ingest loop from
# becoming infinite. Outputs are only re-queued for ingestion when Claude
# explicitly moves them to raw/ — not automatically.
#
# Docs: https://rclone.org/commands/rclone_sync/

REPO="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain"
REMOTE="gdrive:ClaudeSecondBrain"
RCLONE="/opt/homebrew/bin/rclone"
LOG="$HOME/Library/Logs/secondbrain/sync.log"

mkdir -p "$HOME/Library/Logs/secondbrain"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG"; }

# ── Verify volume is mounted ──────────────────────────────────────────────────
if [[ ! -d "$REPO" ]]; then
  log "ERROR: Repo not found at $REPO — skipping sync"
  exit 1
fi

log "Starting sync..."

# ── INBOUND: Drive Inbox/ → local raw/ ───────────────────────────────────────
# copy (not sync) — never deletes local files, only adds new ones from Drive
$RCLONE copy \
  "$REMOTE/Inbox" \
  "$REPO/raw" \
  --exclude ".DS_Store" \
  --exclude "*_done*" \
  --log-level INFO \
  --log-file "$LOG" \
  2>/dev/null

log "Inbox → raw/ done"

# ── PUBLISH: local wiki/ → Drive wiki/ ───────────────────────────────────────
# sync — Drive mirrors local exactly (local wins all conflicts)
$RCLONE sync \
  "$REPO/wiki" \
  "$REMOTE/wiki" \
  --exclude ".DS_Store" \
  --log-level INFO \
  --log-file "$LOG" \
  2>/dev/null

log "wiki/ → Drive done"

# ── PUBLISH: local outputs/ → Drive outputs/ ─────────────────────────────────
$RCLONE sync \
  "$REPO/outputs" \
  "$REMOTE/outputs" \
  --exclude ".DS_Store" \
  --log-level INFO \
  --log-file "$LOG" \
  2>/dev/null

log "outputs/ → Drive done"

# ── PUBLISH: local raw/ _done files → Drive raw/ ─────────────────────────────
# Lets you see what's been processed from Drive, but Drive can't un-done them
$RCLONE sync \
  "$REPO/raw" \
  "$REMOTE/raw" \
  --exclude ".DS_Store" \
  --log-level INFO \
  --log-file "$LOG" \
  2>/dev/null

log "raw/ → Drive done"
log "Sync complete."
