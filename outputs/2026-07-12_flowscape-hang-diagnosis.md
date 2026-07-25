# FlowScape Hang — Diagnosis, Immediate Fix, and Durable Fix

**Date:** 2026-07-12
**Author:** Claude (Second Brain session)
**Drew from:** live process inspection; `FlowScape/Sources/FlowScape/{ActivityEngine,PatternEngine,AppDelegate,main}.swift`
**Related:** dev-projects/flowscape/architecture.md, dev-infrastructure/flowscape-ambient-sessions.md

---

## Symptom

Gabriel could not bring FlowScape's panel up. The launchd job reported `state = running` with a live PID, so nothing looked crashed.

## What was actually happening

The process (PID 77726, launched 2026-07-08 00:01) had been pegged at **~128% CPU for 4 days, 15 hours**, RSS a tiny 12 MB, state `R`. A `sample` of the live process showed two threads simultaneously inside the same SQLite B-tree cursor:

- **Main thread** → `PatternEngine._doAnalyze()` (PatternEngine.swift:68) → `ActivityEngine.events(since:limit:)` (ActivityEngine.swift:174) → `sqlite3_step` → spinning in `sqlite3BtreeCursor`.
- **`com.flowscape.fsevents` queue** → `fsEventsCallback` (ActivityEngine.swift:335) → `persistEvent` (ActivityEngine.swift:315) → `sqlite3_step` → spinning in `sqlite3BtreeCursor`.

The database itself is healthy: `PRAGMA integrity_check` = ok, only 9,015 rows, 4 MB. Data flowed normally until 2026-07-08 05:01, then froze — no commits since.

## Root cause

`ActivityEngine` holds **one** `db` connection (`OpaquePointer`) and accesses it from two threads with no serialization:

- Writes (`persistEvent`) run on the `com.flowscape.fsevents` dispatch queue.
- Reads (`events()`) run on the main actor, driven by `PatternEngine`.

Both threads being *inside* SQLite at the same instant proves the connection is not mutex-serialized. About five hours in, a read and a write collided, corrupted the connection's in-memory cursor state, and `sqlite3_step` entered an infinite loop in `sqlite3BtreeCursor` on both threads. Because nothing commits, the on-disk file stays valid and frozen; the WAL never checkpoints; two cores peg indefinitely. The wedge sits on the **main actor**, so the whole UI freezes — hence the panel never opens.

This is a data race, not corruption and not resource exhaustion.

## Immediate fix (applied)

Restarted the wedged job:

```
launchctl kickstart -k gui/$(id -u)/com.gabriel.flowscape
```

Fresh process settled at ~2% CPU, state `S`, DB writes resumed (WAL advancing). Panel opens on ⌃⌥Space. This clears the wedge but does not remove the race — expect a re-wedge after hours of concurrent read/write.

## Durable fix (pending approval — code change + rebuild)

Serialize every SQLite operation on the existing serial `queue`, and keep reads off the main thread. Concretely, in `ActivityEngine`:

1. Route both `persistEvent` and `events()` through the single serial `queue` (`queue.sync {}` for the read so callers still get a return value), so the connection is only ever touched by one thread at a time.
2. Belt-and-suspenders: open the connection with `sqlite3_open_v2(..., SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX, nil)` instead of `sqlite3_open`, guaranteeing the connection's own mutex even if a future caller bypasses the queue.
3. Make `PatternEngine._doAnalyze()` call `events()` off the main actor (it already hands the heavy detection work to a detached task; the query fetch should move with it) so a slow read never blocks the UI.

Any one of (1) or (2) removes the infinite-loop race; doing both plus (3) also protects responsiveness. All are bug-scope changes — no new features, consistent with production standards.

---

## Pipeline ingested this session

- `flowscape_context_2026-07-07_16-24-34.md` → ambient-sessions log (SecondBrain dashboard build).
- `flowscape_context_2026-07-07_23-42-47.md` → ambient-sessions log (Shakespearience-Platform storefront/membership scaffolding: Stripe, license-key, roles, db, middleware, admin routes). Cross-linked to dev-projects/shakespearience.
- `flowscape_session_2026-07-07.md` → reviewed, **not** promoted; Apple-Intelligence digest confabulated (invented QuickTime/VLC/video work). Marked `[unverified]`, kept for audit.
- `Vibrational Consciousness Hypothesis.pdf` → marked `_done`, duplicate source of the already-processed VCH material.

All four now `_done`; `raw/` has no unprocessed files.
