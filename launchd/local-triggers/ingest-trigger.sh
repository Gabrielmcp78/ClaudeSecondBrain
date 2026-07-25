#!/bin/zsh
# ingest-trigger.sh — local-disk launchd entry point for the SecondBrain ingest watcher.
# Exists because a launchd LaunchAgent whose ProgramArguments points directly at a
# script on an external volume fails at exec time with EX_CONFIG (78), before the
# target script ever runs — independent of Full Disk Access grants on /bin/zsh.
# This thin wrapper lives on local/boot disk so launchd can exec it cleanly, then
# hands off to the real ingest.sh on the external volume where raw/ actually lives.
#
# Canonical source (version-controlled): ClaudeSecondBrain/launchd/local-triggers/ingest-trigger.sh
# Diagnosed and fixed: 2026-07-18.

REPO="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain"

cd "$REPO" || exit 1
exec /bin/zsh "$REPO/ingest.sh"
