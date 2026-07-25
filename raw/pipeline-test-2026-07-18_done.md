# Ingestion Pipeline Live Test — 2026-07-18

This file was dropped by Claude (Cowork session) at Gabriel's request, specifically
to verify that the launchd WatchPaths trigger on raw/ fires ingest.sh automatically —
with no manual `launchctl kickstart` — after today's fix (local StandardOutPath/
StandardErrorPath + migration from the dead gemini-cli to the agy/Antigravity
provider).

This is operational/test content, not a knowledge drop. Per existing KB convention
for this kind of content (see the FlowScape session-digest handling in
wiki/dev-infrastructure/flowscape-ambient-sessions.md), please do not create a
dedicated wiki article for this file. It is fine to: mark this file _done, and add
a one-line note to wiki/_meta/change-log.md confirming you processed it and noting
the timestamp you read it at, so Gabriel and Claude can confirm the watcher fired
on its own.
