#!/usr/bin/env bash
# sync.sh — one-line runner for neo4j_sync_bridge.py
#
# Usage:
#   ./sync.sh              # live sync
#   ./sync.sh --dry-run    # preview only
#   ./sync.sh --force      # overwrite existing articles
#   ./sync.sh --domain dev-projects   # one domain only

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE="${SCRIPT_DIR}/neo4j_sync_bridge.py"

# Load .env from the neo4j_json_ingester project if present
ENV_FILE="/Volumes/Ready500/DEVELOPMENT/neo4j_json_ingester/.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

# Activate venv if the neo4j_json_ingester has one
VENV="/Volumes/Ready500/DEVELOPMENT/neo4j_json_ingester/.venv"
if [[ -d "$VENV" ]]; then
  # shellcheck disable=SC1091
  source "${VENV}/bin/activate"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Neo4j → ClaudeSecondBrain Sync"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 "$BRIDGE" "$@"
