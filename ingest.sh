#!/bin/zsh
# ingest.sh — triggered by launchd WatchPaths whenever a file lands in raw/
# Runs an AI CLI in non-interactive mode to process any unprocessed raw files.

RAW="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain/raw"
REPO="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain"
LOG="${TMPDIR:-/tmp}/ingest-boot.log"   # writable even before volume mounts

# Default provider is "agy" (Google Antigravity CLI), not "gemini". As of
# 2026-07-18 the standalone gemini-cli free tier ("Gemini Code Assist for
# individuals") was deprecated by Google — it now fails immediately with
# IneligibleTierError and points users at Antigravity. agy is the free
# replacement Gabriel already has installed; "claude" remains available but
# is not the default since it bills against Anthropic API usage rather than
# a flat subscription, which Gabriel does not want running unattended.
AI_PROVIDER="${SECOND_BRAIN_AI_PROVIDER:-agy}"

# Boot-race guard: external volume may not be mounted when launchd fires WatchPaths.
# Wait up to 30 seconds for the volume, then abort cleanly (exit 0, not 78).
VOLUME="/Volumes/Ready500"
WAIT=0
until [[ -d "$VOLUME" ]] || (( WAIT >= 30 )); do
  sleep 2
  (( WAIT += 2 ))
done

if [[ ! -d "$VOLUME" ]]; then
  echo "$(date): $VOLUME not mounted after ${WAIT}s — skipping ingest." >> "$LOG"
  exit 0
fi

# Volume is up — switch to the real log path
LOG="$REPO/logs/ingest.log"
GEMINI="${GEMINI_CLI:-/opt/homebrew/bin/gemini}"          # deprecated 2026-07-18, see AI_PROVIDER note above
CLAUDE="${CLAUDE_CLI:-/usr/local/bin/claude}"              # available, not default — bills per-token
AGY="${AGY_CLI:-/Users/gabrielmcp/.local/bin/agy}"          # default — free, Google Antigravity CLI
GEMINI_MODEL="${GEMINI_MODEL:-gemini-2.5-pro}"
AGY_MODEL="${AGY_MODEL:-Gemini 3.1 Pro (High)}"

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

GEMINI_PROMPT="Read Gemini.md in full. Then process all unprocessed files in raw/ (files without '_done' in the name, excluding README). For each file: 1) Write a wiki entry per the schema in Gemini.md, 2) Update wiki/_index.md and wiki/_connections.md, 3) Log the change in wiki/_meta/change-log.md, 4) Rename the source file by appending '_done' to its basename. Work through all pending files before stopping."

CLAUDE_PROMPT="Read CLAUDE.md in full. Then process all unprocessed files in raw/ (files without '_done' in the name, excluding README). For each file: 1) Write a wiki entry per the schema in CLAUDE.md, 2) Update wiki/_index.md and wiki/_connections.md, 3) Log the change in wiki/_meta/change-log.md, 4) Rename the source file by appending '_done' to its basename. Work through all pending files before stopping."

AGY_PROMPT="Read Gemini.md in full. Then process all unprocessed files in raw/ (files without '_done' in the name, excluding README). For each file: 1) Write a wiki entry per the schema in Gemini.md, 2) Update wiki/_index.md and wiki/_connections.md, 3) Log the change in wiki/_meta/change-log.md, 4) Rename the source file by appending '_done' to its basename. Work through all pending files before stopping."

case "$AI_PROVIDER" in
  agy)
    if [[ ! -x "$AGY" ]]; then
      echo "$(date): Antigravity CLI not found or not executable at $AGY" >> "$LOG"
      exit 1
    fi

    echo "$(date): Running Antigravity CLI (agy) ingestion with model $AGY_MODEL..." >> "$LOG"
    # < /dev/null prevents stdin hangs in background/launchd context.
    # print-timeout raised from agy's 5m0s default: a real ingestion pass
    # (read Gemini.md, write/update several wiki files, rename source) ran
    # past 5 minutes and was killed mid-task on first live test 2026-07-18 —
    # cleanly, with no partial wiki writes, but killed nonetheless.
    "$AGY" --dangerously-skip-permissions --model "$AGY_MODEL" --print-timeout 20m --print "$AGY_PROMPT" \
      < /dev/null >> "$LOG" 2>&1
    ;;

  gemini)
    echo "$(date): WARNING — 'gemini' provider is deprecated (gemini-cli free tier removed by Google 2026-07-18). Falling through to 'agy'. Set SECOND_BRAIN_AI_PROVIDER=agy explicitly to silence this." >> "$LOG"
    if [[ ! -x "$AGY" ]]; then
      echo "$(date): Antigravity CLI not found or not executable at $AGY — cannot fall through." >> "$LOG"
      exit 1
    fi
    # print-timeout raised from agy's 5m0s default: a real ingestion pass
    # (read Gemini.md, write/update several wiki files, rename source) ran
    # past 5 minutes and was killed mid-task on first live test 2026-07-18 —
    # cleanly, with no partial wiki writes, but killed nonetheless.
    "$AGY" --dangerously-skip-permissions --model "$AGY_MODEL" --print-timeout 20m --print "$AGY_PROMPT" \
      < /dev/null >> "$LOG" 2>&1
    ;;

  claude)
    if [[ ! -x "$CLAUDE" ]]; then
      echo "$(date): Claude CLI not found or not executable at $CLAUDE" >> "$LOG"
      exit 1
    fi

    echo "$(date): Running Claude Code ingestion..." >> "$LOG"
    "$CLAUDE" --dangerously-skip-permissions -p "$CLAUDE_PROMPT" \
      < /dev/null >> "$LOG" 2>&1
    ;;

  *)
    echo "$(date): Unknown SECOND_BRAIN_AI_PROVIDER '$AI_PROVIDER'. Use 'agy' (default, free) or 'claude' (bills per-token)." >> "$LOG"
    exit 1
    ;;
esac

echo "$(date): Ingestion complete." >> "$LOG"
