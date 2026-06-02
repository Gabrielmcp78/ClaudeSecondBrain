#!/bin/zsh
# ingest.sh — triggered by launchd WatchPaths whenever a file lands in raw/
# Runs Claude Code in non-interactive mode to process any unprocessed raw files.

RAW="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain/raw"
REPO="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain"
LOG="$REPO/logs/ingest.log"
CLAUDE="/usr/local/bin/claude"

mkdir -p "$REPO/logs"

# Check for unprocessed files (anything without _done in the name, excluding README)
PENDING=$(find "$RAW" -maxdepth 1 -type f ! -name "*_done*" ! -name "README*" ! -name ".DS_Store")

if [[ -z "$PENDING" ]]; then
  echo "$(date): No pending files — skipping." >> "$LOG"
  exit 0
fi

echo "$(date): New files detected — starting ingestion..." >> "$LOG"
echo "$PENDING" >> "$LOG"

cd "$REPO"

# Run Claude Code non-interactively with ingestion prompt
$CLAUDE --dangerously-skip-permissions -p \
"Read CLAUDE.md in full. Then process all unprocessed files in raw/ (files without '_done' in the name, excluding README). For each file: 1) Write a wiki entry per the schema in CLAUDE.md, 2) Update wiki/_index.md and wiki/_connections.md, 3) Log the change in wiki/_meta/change-log.md, 4) Rename the source file by appending '_done' to its basename. Work through all pending files before stopping." \
>> "$LOG" 2>&1

echo "$(date): Ingestion complete." >> "$LOG"
