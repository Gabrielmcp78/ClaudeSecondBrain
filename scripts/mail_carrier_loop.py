#!/usr/bin/env python3
"""
SecondBrain Agent Mail Carrier Loop

Purpose
-------
Routes structured markdown messages between per-agent outboxes and inboxes inside
ClaudeSecondBrain without overwriting human or agent notes.

This is intentionally conservative:
- append-only delivery
- local filesystem only
- no network calls
- no destructive actions
- lockfile guarded
- idempotent delivery via ledger
- does not execute message contents

Expected mailbox layout
-----------------------
wiki/_agents/<agent>/inbox.md
wiki/_agents/<agent>/outbox.md

Supported agents are configured in AGENTS below.

Message format
--------------
Agents may write markdown blocks into their own outbox using this header form:

## MAIL: <short title>
To: claude, chatgpt
From: chatgpt
Priority: normal
Message-ID: optional-stable-id

Body text here.

---

If Message-ID is omitted, the carrier derives a stable ID from sender + title +
body hash. Delivered messages are logged in wiki/_meta/mail-carrier-ledger.json.

Run examples
------------
One-shot:
  python3 scripts/mail_carrier_loop.py --once

Daemon, polling every 30 seconds:
  python3 scripts/mail_carrier_loop.py --watch --interval 30

Dry run:
  python3 scripts/mail_carrier_loop.py --once --dry-run

Watch mode with macOS notifications (added 2026-07-09, Claude):
  python3 scripts/mail_carrier_loop.py --watch --interval 30 --notify

  --notify fires a Notification Center alert (via `osascript`) for each real
  delivery. It does not read or act on message content beyond title/sender/
  recipient for the alert text, and a notification failure is logged and
  swallowed rather than crashing the loop. This does not "wake" a remote
  agent session (e.g. an open ChatGPT/Atlas tab) — that's not reachable from
  a local script. It notifies Gabriel so a human relay is prompted instead of
  polled for. See wiki/ai-collaboration/agent-mail-carrier.md for the full
  design rationale and current limitations of the wake/notify layer.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

AGENTS = {
    "chatgpt": "wiki/_agents/chatgpt",
    "claude": "wiki/_agents/claude",
    "cursor": "wiki/_agents/cursor",
    "gemini": "wiki/_agents/gemini",
}

LEDGER_PATH = Path("wiki/_meta/mail-carrier-ledger.json")
LOG_PATH = Path("wiki/_meta/mail-carrier-log.md")
LOCK_PATH = Path(".mail-carrier.lock")
GLOBAL_INBOX = Path("wiki/inbox.md")

HEADER_RE = re.compile(r"^##\s+MAIL:\s*(?P<title>.+?)\s*$", re.IGNORECASE | re.MULTILINE)
FIELD_RE = re.compile(r"^(?P<key>To|From|Priority|Message-ID):\s*(?P<value>.+?)\s*$", re.IGNORECASE | re.MULTILINE)


@dataclass(frozen=True)
class MailMessage:
    message_id: str
    title: str
    sender: str
    recipients: Tuple[str, ...]
    priority: str
    body: str
    raw_block: str
    source_path: Path


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[1]


def safe_read(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def ensure_file(path: Path, initial: str = "") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(initial, encoding="utf-8")


def load_ledger() -> Dict[str, object]:
    ensure_file(LEDGER_PATH, '{\n  "delivered": {}\n}\n')
    try:
        data = json.loads(safe_read(LEDGER_PATH))
    except json.JSONDecodeError:
        backup = LEDGER_PATH.with_suffix(".corrupt.json")
        backup.write_text(safe_read(LEDGER_PATH), encoding="utf-8")
        data = {"delivered": {}, "warning": f"Recovered from corrupt ledger at {utc_now()}"}
    data.setdefault("delivered", {})
    return data


def save_ledger(ledger: Dict[str, object]) -> None:
    tmp = LEDGER_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(ledger, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    tmp.replace(LEDGER_PATH)


def parse_recipients(value: str) -> Tuple[str, ...]:
    raw = [part.strip().lower() for part in value.replace(";", ",").split(",")]
    recipients = []
    for item in raw:
        if not item:
            continue
        if item in {"all", "broadcast"}:
            recipients.extend(AGENTS.keys())
        else:
            recipients.append(item)
    return tuple(dict.fromkeys(recipients))


def fields_from_block(block: str) -> Dict[str, str]:
    fields: Dict[str, str] = {}
    for match in FIELD_RE.finditer(block):
        fields[match.group("key").lower()] = match.group("value").strip()
    return fields


def derive_message_id(sender: str, title: str, body: str) -> str:
    digest = hashlib.sha256(f"{sender}\n{title}\n{body}".encode("utf-8")).hexdigest()[:16]
    return f"mail-{sender}-{digest}"


def split_mail_blocks(text: str) -> Iterable[Tuple[str, str]]:
    matches = list(HEADER_RE.finditer(text))
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        yield match.group("title").strip(), text[start:end].strip()


def body_from_block(block: str) -> str:
    lines = block.splitlines()
    body_lines: List[str] = []
    in_headers = True
    for line in lines[1:]:
        if in_headers and FIELD_RE.match(line):
            continue
        if in_headers and not line.strip():
            in_headers = False
            continue
        in_headers = False
        body_lines.append(line)
    body = "\n".join(body_lines).strip()
    # Remove a trailing markdown separator if the block used one as terminator.
    body = re.sub(r"\n?---\s*$", "", body).strip()
    return body


def parse_outbox(agent: str, outbox_path: Path) -> List[MailMessage]:
    text = safe_read(outbox_path)
    messages: List[MailMessage] = []
    for title, block in split_mail_blocks(text):
        fields = fields_from_block(block)
        sender = fields.get("from", agent).strip().lower()
        to_value = fields.get("to", "").strip()
        if not to_value:
            append_log(f"Skipped message without To field in {outbox_path}: {title}")
            continue
        recipients = parse_recipients(to_value)
        body = body_from_block(block)
        message_id = fields.get("message-id", "").strip() or derive_message_id(sender, title, body)
        priority = fields.get("priority", "normal").strip().lower()
        messages.append(
            MailMessage(
                message_id=message_id,
                title=title,
                sender=sender,
                recipients=recipients,
                priority=priority,
                body=body,
                raw_block=block,
                source_path=outbox_path,
            )
        )
    return messages


def append_log(message: str) -> None:
    ensure_file(LOG_PATH, "# Mail Carrier Log\n\n")
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(f"- {utc_now()} — {message}\n")


def notify_macos(title: str, subtitle: str, body: str) -> None:
    """Best-effort macOS notification via osascript. Never raises — a notification
    failure (e.g. running on a non-mac host, or Notification Center permission not
    granted) must not interrupt or crash the carrier's delivery loop."""
    script = (
        f'display notification {json.dumps(body)} '
        f'with title {json.dumps(title)} subtitle {json.dumps(subtitle)}'
    )
    try:
        subprocess.run(
            ["osascript", "-e", script],
            check=False,
            capture_output=True,
            timeout=5,
        )
    except Exception as exc:  # noqa: BLE001 - notification is best-effort only.
        append_log(f"WARNING: notification failed: {type(exc).__name__}: {exc}")


def delivery_block(message: MailMessage, recipient: str) -> str:
    return (
        f"\n\n## {utc_now()} — Mail from {message.sender}: {message.title}\n\n"
        f"**Message-ID:** `{message.message_id}`  \n"
        f"**From:** `{message.sender}`  \n"
        f"**To:** `{recipient}`  \n"
        f"**Priority:** `{message.priority}`  \n"
        f"**Source:** `{message.source_path.as_posix()}`\n\n"
        f"{message.body}\n"
    )


def global_delivery_note(message: MailMessage, recipients: Tuple[str, ...]) -> str:
    joined = ", ".join(recipients)
    return (
        f"\n\n## {utc_now()} — Agent mail delivered: {message.title}\n"
        f"Source: mail-carrier\n\n"
        f"From `{message.sender}` to `{joined}`. Message-ID `{message.message_id}`.\n"
    )


def already_delivered(ledger: Dict[str, object], message: MailMessage, recipient: str) -> bool:
    delivered = ledger.get("delivered", {})
    return bool(isinstance(delivered, dict) and delivered.get(message.message_id, {}).get(recipient))


def mark_delivered(ledger: Dict[str, object], message: MailMessage, recipient: str) -> None:
    delivered = ledger.setdefault("delivered", {})
    assert isinstance(delivered, dict)
    item = delivered.setdefault(message.message_id, {})
    assert isinstance(item, dict)
    item[recipient] = {
        "delivered_at": utc_now(),
        "from": message.sender,
        "title": message.title,
        "priority": message.priority,
        "source": message.source_path.as_posix(),
    }


def valid_recipients(message: MailMessage) -> Tuple[str, ...]:
    clean: List[str] = []
    for recipient in message.recipients:
        if recipient not in AGENTS:
            append_log(f"Unknown recipient `{recipient}` for message `{message.message_id}`; skipped")
            continue
        if recipient == message.sender:
            # Allow self-delivery only when explicit. It can be useful for reminders.
            clean.append(recipient)
        else:
            clean.append(recipient)
    return tuple(dict.fromkeys(clean))


def route_once(dry_run: bool = False, notify: bool = False) -> int:
    ensure_file(LOG_PATH, "# Mail Carrier Log\n\n")
    ensure_file(GLOBAL_INBOX, "# Inbox\n\n")
    ledger = load_ledger()
    delivered_count = 0

    for agent, rel_dir in AGENTS.items():
        base = Path(rel_dir)
        inbox = base / "inbox.md"
        outbox = base / "outbox.md"
        ensure_file(inbox, f"# {agent} Inbox\n\n")
        ensure_file(outbox, f"# {agent} Outbox\n\n")

        for message in parse_outbox(agent, outbox):
            recipients = valid_recipients(message)
            delivered_this_message: List[str] = []
            for recipient in recipients:
                if already_delivered(ledger, message, recipient):
                    continue
                recipient_inbox = Path(AGENTS[recipient]) / "inbox.md"
                block = delivery_block(message, recipient)
                if dry_run:
                    print(f"DRY RUN: would deliver {message.message_id} to {recipient_inbox}")
                else:
                    with recipient_inbox.open("a", encoding="utf-8") as f:
                        f.write(block)
                    mark_delivered(ledger, message, recipient)
                    delivered_count += 1
                    delivered_this_message.append(recipient)
                    if notify:
                        notify_macos(
                            title="SecondBrain Mail",
                            subtitle=f"{message.sender} → {recipient}",
                            body=message.title,
                        )

            if delivered_this_message and not dry_run:
                with GLOBAL_INBOX.open("a", encoding="utf-8") as f:
                    f.write(global_delivery_note(message, tuple(delivered_this_message)))
                append_log(f"Delivered `{message.message_id}` from `{message.sender}` to {', '.join(delivered_this_message)}")

    if not dry_run:
        save_ledger(ledger)
    return delivered_count


class Lock:
    def __enter__(self) -> "Lock":
        try:
            fd = os.open(str(LOCK_PATH), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(f"pid={os.getpid()}\nstarted={utc_now()}\n")
        except FileExistsError:
            raise SystemExit(f"Lock exists at {LOCK_PATH}. Another mail carrier may be running.")
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        try:
            LOCK_PATH.unlink()
        except FileNotFoundError:
            pass


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Route SecondBrain agent mailbox messages.")
    parser.add_argument("--once", action="store_true", help="Run one routing pass and exit.")
    parser.add_argument("--watch", action="store_true", help="Keep polling for new messages.")
    parser.add_argument("--interval", type=int, default=30, help="Polling interval in seconds for --watch.")
    parser.add_argument("--dry-run", action="store_true", help="Print deliveries without modifying files.")
    parser.add_argument(
        "--notify",
        action="store_true",
        help="Fire a macOS Notification Center alert (via osascript) for each real delivery. "
        "No-op combined with --dry-run. Best-effort: failures are logged, never fatal.",
    )
    args = parser.parse_args(argv)

    root = repo_root_from_script()
    os.chdir(root)

    if not args.once and not args.watch:
        args.once = True

    if args.interval < 5:
        raise SystemExit("Refusing interval below 5 seconds.")

    with Lock():
        if args.once:
            count = route_once(dry_run=args.dry_run, notify=args.notify)
            print(f"Mail carrier pass complete. Deliveries: {count}")
            return 0

        append_log(f"Mail carrier watch started with interval={args.interval}s notify={args.notify}")
        while True:
            try:
                count = route_once(dry_run=args.dry_run, notify=args.notify)
                if count:
                    print(f"{utc_now()} delivered {count} message(s)", flush=True)
                time.sleep(args.interval)
            except KeyboardInterrupt:
                append_log("Mail carrier watch stopped by KeyboardInterrupt")
                return 0
            except Exception as exc:  # noqa: BLE001 - daemon should log and continue.
                append_log(f"ERROR: {type(exc).__name__}: {exc}")
                time.sleep(args.interval)


if __name__ == "__main__":
    sys.exit(main())
