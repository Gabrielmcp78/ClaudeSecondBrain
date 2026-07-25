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
# A second, related loop was found and fixed 2026-07-18: because the
# Inbox→raw/ leg below never touches its Drive-side source, a file marked
# "_done" locally (by the ingestion step) stayed un-renamed in Drive's
# Inbox/ forever, so every 10-minute sync tick re-copied it back into local
# raw/ as if new — which re-fired ingest-watcher's WatchPaths trigger,
# which re-ran the AI ingestion CLI against the same file, which is what
# surfaced to Gabriel as a fast-cycling macOS permission-prompt loop. See
# wiki/_meta/change-log.md ("agy permission-popup loop") for the full
# incident writeup. The reconcile_done_files() leg below closes this gap
# generally: it runs before the inbound copy and renames any Drive Inbox/
# file to match its local "_done" counterpart, so the inbound leg can never
# resurrect an already-processed file again — regardless of which ingestion
# provider (agy/gemini/claude) did the local rename, or whether it was done
# by hand.
#
# Docs: https://rclone.org/commands/rclone_sync/

REPO="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain"
REMOTE="gdrive:ClaudeSecondBrain"
RCLONE="/opt/homebrew/bin/rclone"
LOG="$HOME/Library/Logs/secondbrain/sync.log"

mkdir -p "$HOME/Library/Logs/secondbrain"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG"; }

# Runs an rclone leg, checks its real exit code, and logs success or failure
# accordingly. Without this, a failed rclone call (e.g. expired OAuth token)
# was previously followed unconditionally by a "done" log line, which is how
# a month-long invalid_grant outage went unnoticed — see
# outputs/2026-07-18_gdrive-oauth-invalid-grant-diagnosis.md.
FAILED=0
run_leg() {
  local label="$1"
  shift
  local err rc
  err="$("$@" 2>&1 1>/dev/null)"
  rc=$?
  if [[ $rc -ne 0 ]]; then
    log "ERROR: $label failed (exit $rc): ${err:-no stderr output}"
    FAILED=1
  else
    log "$label done"
  fi
  return $rc
}

# ── Verify volume is mounted ──────────────────────────────────────────────────
if [[ ! -d "$REPO" ]]; then
  log "ERROR: Repo not found at $REPO — skipping sync"
  exit 1
fi

log "Starting sync..."

# ── RECONCILE: mark Drive Inbox/ files done when local raw/ shows them done ──
# For every local raw/ file with "_done" in its name, derive what its
# pre-processing name would have been (strip the first "_done" occurrence,
# same convention the --exclude filter below already assumes) and, if a
# file by that original name still exists in Drive's Inbox/, rename it
# there too. Purely mechanical (no AI step involved) so it can't be skipped
# or forgotten the way a one-off manual fix or an agentic ingestion step
# could be. Idempotent and safe: a no-op whenever nothing matches.
reconcile_done_files() {
  local local_done original base drive_files checked=0 renamed=0
  local_done=$(find "$REPO/raw" -maxdepth 1 -type f -name "*_done*" ! -name ".*" 2>/dev/null)
  if [[ -z "$local_done" ]]; then
    log "Reconcile: no local _done files to check"
    return 0
  fi
  drive_files=$($RCLONE lsf "$REMOTE/Inbox" 2>>"$LOG")
  while IFS= read -r donefile; do
    [[ -z "$donefile" ]] && continue
    base="${donefile##*/}"
    original=$(printf '%s' "$base" | sed -E 's/_done//')
    [[ "$original" == "$base" ]] && continue
    ((checked++))
    if printf '%s\n' "$drive_files" | grep -qxF "$original"; then
      log "Reconcile: Drive Inbox/$original is still pending but local copy is done — renaming on Drive to match"
      if $RCLONE moveto "$REMOTE/Inbox/$original" "$REMOTE/Inbox/$base" >>"$LOG" 2>&1; then
        log "Reconcile: renamed Drive Inbox/$original -> Inbox/$base"
        ((renamed++))
      else
        log "ERROR: Reconcile failed to rename Drive Inbox/$original"
        FAILED=1
      fi
    fi
  done <<< "$local_done"
  log "Reconcile: checked $checked local _done file(s) against Drive Inbox/, renamed $renamed"
}
reconcile_done_files

# ── INBOUND: Drive Inbox/ → local raw/ ───────────────────────────────────────
# copy (not sync) — never deletes local files, only adds new ones from Drive
run_leg "Inbox → raw/" $RCLONE copy \
  "$REMOTE/Inbox" \
  "$REPO/raw" \
  --exclude ".DS_Store" \
  --exclude "*_done*" \
  --log-level INFO \
  --log-file "$LOG"

# ── PUBLISH: local wiki/ → Drive wiki/ ───────────────────────────────────────
# sync — Drive mirrors local exactly (local wins all conflicts)
run_leg "wiki/ → Drive" $RCLONE sync \
  "$REPO/wiki" \
  "$REMOTE/wiki" \
  --exclude ".DS_Store" \
  --log-level INFO \
  --log-file "$LOG"

# ── PUBLISH: local outputs/ → Drive outputs/ ─────────────────────────────────
run_leg "outputs/ → Drive" $RCLONE sync \
  "$REPO/outputs" \
  "$REMOTE/outputs" \
  --exclude ".DS_Store" \
  --log-level INFO \
  --log-file "$LOG"

# ── PUBLISH: local raw/ _done files → Drive raw/ ─────────────────────────────
# Lets you see what's been processed from Drive, but Drive can't un-done them
run_leg "raw/ → Drive" $RCLONE sync \
  "$REPO/raw" \
  "$REMOTE/raw" \
  --exclude ".DS_Store" \
  --log-level INFO \
  --log-file "$LOG"

if [[ $FAILED -ne 0 ]]; then
  log "Sync completed with errors — see ERROR lines above."
  exit 1
fi
log "Sync complete."
