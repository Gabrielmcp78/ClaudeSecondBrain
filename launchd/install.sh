#!/bin/zsh
# launchd/install.sh — installs all SecondBrain launchd agents
#
# Usage:
#   ./launchd/install.sh           # install all agents
#   ./launchd/install.sh --status  # show loaded/unloaded state
#   ./launchd/install.sh --unload  # unload all agents (does not delete plists)
#
# Run from the SecondBrain repo root:
#   cd /Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain && ./launchd/install.sh

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
LAUNCHD_DIR="$REPO/launchd"
AGENTS_DIR="$HOME/Library/LaunchAgents"
DASHBOARD_PLIST="$REPO/dashboard/launchd/com.gabrielmcp.sbbrain.dashboard.plist"
TRIGGERS_SRC="$LAUNCHD_DIR/local-triggers"
TRIGGERS_DEST="$HOME/Library/Application Support/secondbrain"

# All plists managed by this script
PLISTS=(
  "$LAUNCHD_DIR/com.gabrielmcp.secondbrain.ingest-watcher.plist"
  "$LAUNCHD_DIR/com.gabrielmcp.secondbrain.outputs-review.plist"
  "$DASHBOARD_PLIST"
)

# Local-disk trigger wrappers (2026-07-18 fix). launchd refuses to exec a
# LaunchAgent whose ProgramArguments point directly at a script on an
# external volume (last exit code = 78: EX_CONFIG), independent of Full
# Disk Access grants on the interpreter binary. ingest-watcher and
# outputs-review both now point ProgramArguments at these local wrappers,
# which cd onto the external volume and exec the real script from there.
TRIGGERS=(
  "ingest-trigger.sh"
  "outputs-review-trigger.sh"
)

# ────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────

label_from_plist() {
  /usr/libexec/PlistBuddy -c "Print :Label" "$1" 2>/dev/null || basename "$1" .plist
}

is_loaded() {
  launchctl list 2>/dev/null | grep -q "$1"
}

# ────────────────────────────────────────────────
# --status
# ────────────────────────────────────────────────

if [[ "${1:-}" == "--status" ]]; then
  echo "SecondBrain launchd agent status:"
  echo ""
  for plist in "${PLISTS[@]}"; do
    label=$(label_from_plist "$plist")
    dest="$AGENTS_DIR/$(basename "$plist")"
    if [[ ! -f "$dest" ]]; then
      echo "  ⚫ NOT INSTALLED  $label"
    elif is_loaded "$label"; then
      echo "  🟢 LOADED         $label"
    else
      echo "  🟡 INSTALLED/OFF  $label"
    fi
  done
  exit 0
fi

# ────────────────────────────────────────────────
# --unload
# ────────────────────────────────────────────────

if [[ "${1:-}" == "--unload" ]]; then
  echo "Unloading all SecondBrain launchd agents..."
  for plist in "${PLISTS[@]}"; do
    label=$(label_from_plist "$plist")
    dest="$AGENTS_DIR/$(basename "$plist")"
    if [[ -f "$dest" ]]; then
      launchctl unload "$dest" 2>/dev/null && echo "  ✅ Unloaded: $label" || echo "  ⚠️  Already unloaded: $label"
    else
      echo "  ⚫ Not installed: $label"
    fi
  done
  exit 0
fi

# ────────────────────────────────────────────────
# Default: install + load
# ────────────────────────────────────────────────

echo "Installing SecondBrain launchd agents..."
echo "Repo root: $REPO"
echo ""

# Warn about the pre-repo ingest agent (named differently, may still be loaded)
OLD_INGEST="$AGENTS_DIR/com.gabrielmcp.secondbrain.ingest.plist"
if [[ -f "$OLD_INGEST" ]]; then
  echo "⚠️  Legacy agent found: com.gabrielmcp.secondbrain.ingest"
  echo "   This is the pre-repo version. Unloading it to avoid duplicate watchers..."
  launchctl unload "$OLD_INGEST" 2>/dev/null || true
  echo "   Unloaded. The new ingest-watcher agent replaces it."
  echo ""
fi

mkdir -p "$AGENTS_DIR"
mkdir -p "$TRIGGERS_DEST"

for trigger in "${TRIGGERS[@]}"; do
  cp "$TRIGGERS_SRC/$trigger" "$TRIGGERS_DEST/$trigger"
  chmod +x "$TRIGGERS_DEST/$trigger"
  echo "  ✅ Installed trigger: $trigger"
done
echo ""

for plist in "${PLISTS[@]}"; do
  label=$(label_from_plist "$plist")
  dest="$AGENTS_DIR/$(basename "$plist")"

  # Unload first if already running (to pick up any plist changes)
  if is_loaded "$label"; then
    launchctl unload "$dest" 2>/dev/null || true
    echo "  ↩️  Unloaded existing: $label"
  fi

  cp "$plist" "$dest"
  launchctl load "$dest"
  echo "  ✅ Loaded: $label"
done

echo ""
echo "All agents installed. Run './launchd/install.sh --status' to verify."
echo ""
echo "Log locations:"
echo "  Ingest watcher:   $REPO/logs/ingest.log"
echo "  Ingest errors:    $REPO/logs/ingest-error.log"
echo "  Outputs review:   $REPO/logs/outputs-review.log"
echo "  Dashboard:        /tmp/sbbrain-dashboard.log"
