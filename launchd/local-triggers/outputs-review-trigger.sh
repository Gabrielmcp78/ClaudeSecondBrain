#!/bin/zsh
# outputs-review-trigger.sh — local-disk launchd entry point for the SecondBrain
# outputs review job. Same EX_CONFIG root cause and fix as ingest-trigger.sh —
# see that file for the full explanation.
#
# Canonical source (version-controlled): ClaudeSecondBrain/launchd/local-triggers/outputs-review-trigger.sh
# Diagnosed and fixed: 2026-07-18.

REPO="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain"

cd "$REPO" || exit 1
exec /usr/bin/python3 "$REPO/scripts/outputs_review.py" --sb-root "$REPO"
