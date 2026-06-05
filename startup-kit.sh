#!/bin/zsh
# startup-kit.sh — generates a paste-ready session context for Gemini/ChatGPT
# Usage: ./startup-kit.sh | pbcopy   (copies to clipboard)
#        ./startup-kit.sh            (prints to terminal)

REPO="/Volumes/Ready500/DEVELOPMENT/ClaudeSecondBrain"

echo "=== CLAUDESECONDBRAIN SESSION CONTEXT ==="
echo "Generated: $(date)"
echo ""
echo "Paste this block to initialize the librarian protocol."
echo ""
echo "--- wiki/_index.md ---"
cat "$REPO/wiki/_index.md"
echo ""
echo "--- wiki/_connections.md ---"
cat "$REPO/wiki/_connections.md"
echo ""
echo "--- wiki/_meta/change-log.md (last 20 entries) ---"
tail -60 "$REPO/wiki/_meta/change-log.md"
echo ""
echo "=== END CONTEXT — librarian protocol ready ==="
