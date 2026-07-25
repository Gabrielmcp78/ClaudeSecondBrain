#!/usr/bin/env python3
"""
notify_format.py — Extract a human-readable preview of the most recent
mail-carrier delivery block from an agent inbox.md, for secondbrain-notify.sh.

Why this exists
----------------
secondbrain-notify.sh previously grepped only the raw delivery header line
("## <timestamp> - Mail from X: title"), which told Gabriel *something*
arrived but nothing about what it said - just existence, not content. This
parses the full delivery block that mail_carrier_loop.py's delivery_block()
writes (header + bold Message-ID/From/To/Priority/Source fields + body) and
prints a compact, readable summary the shell script can drop straight into
a notification and an iMessage.

Delivery block format this parses (see scripts/mail_carrier_loop.py):

  ## <ISO timestamp> - Mail from <sender>: <title>

  **Message-ID:** `<id>`
  **From:** `<sender>`
  **To:** `<recipient>`
  **Priority:** `<priority>`
  **Source:** `<path>`

  <body text>

Usage
-----
  python3 scripts/notify_format.py <path-to-inbox.md>

Prints pipe-delimited lines to stdout, or a single "NONE" line if no
delivery block is found:

  AGENT|<inferred from parent directory name>
  FROM|<sender>
  TITLE|<title>
  PREVIEW|<first ~180 chars of body, collapsed to one line>

All four values are pre-escaped for safe embedding inside an AppleScript
double-quoted string literal (backslashes and double quotes escaped) since
that's this script's only consumer. Never raises on malformed input - worst
case is printing NONE, matching the carrier's own best-effort philosophy for
anything notification-related.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

HEADER_RE = re.compile(
    r"^##\s+\S.*?—\s*Mail from\s+(?P<sender>[^:]+):\s*(?P<title>.+?)\s*$",
    re.MULTILINE,
)
FIELD_RE = re.compile(
    r"^\*\*(?P<key>Message-ID|From|To|Priority|Source):\*\*\s*`(?P<value>[^`]*)`",
    re.MULTILINE,
)
PREVIEW_LIMIT = 180


def escape_for_applescript(value: str) -> str:
    """Escape backslashes and double quotes so the value can sit inside an
    AppleScript double-quoted string literal without breaking it."""
    return value.replace("\\", "\\\\").replace('"', '\\"')


def main() -> int:
    if len(sys.argv) != 2:
        print("NONE")
        return 1

    path = Path(sys.argv[1])
    if not path.exists():
        print("NONE")
        return 1

    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        print("NONE")
        return 1

    matches = list(HEADER_RE.finditer(text))
    if not matches:
        print("NONE")
        return 1

    last = matches[-1]
    block = text[last.start():]
    sender = last.group("sender").strip()
    title = last.group("title").strip()

    field_matches = list(FIELD_RE.finditer(block))
    body_start = field_matches[-1].end() if field_matches else last.end()
    body = block[body_start:].strip()
    body = re.sub(r"\s+", " ", body)
    preview = body[:PREVIEW_LIMIT] + ("…" if len(body) > PREVIEW_LIMIT else "")

    # inbox.md lives at wiki/_agents/<agent>/inbox.md
    agent = path.parent.name

    print(f"AGENT|{escape_for_applescript(agent)}")
    print(f"FROM|{escape_for_applescript(sender)}")
    print(f"TITLE|{escape_for_applescript(title)}")
    print(f"PREVIEW|{escape_for_applescript(preview)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
