# Shakespearience — Full Second Brain Integration + Dashboard Focus Feature

**Date:** 2026-07-08
**Requested by:** Gabriel — "full set up for shakespearience into second brain... i dont see it as focus in the dashboard integration"
**Sources drawn from:** `wiki/dev-projects/shakespearience/architecture.md`, Trello board `Shakespearience` (all lists, full card descriptions), `Shakespearience_Tech_Budget.gsheet`, `Shakespearience-Platform` codebase + build verification (session of 2026-07-07), `ClaudeSecondBrainApp` source (`main.js`, `preload.js`, `App.jsx`, `ConsoleDashboard.jsx`, `styles.css`)

---

## What was actually broken

Gabriel's dashboard complaint was accurate, not a misunderstanding. `ConsoleDashboard.jsx`'s "Domains" section was a hardcoded array of the seven top-level wiki folder names — it had no concept of an individual project, active or otherwise, and never had. Shakespearience wasn't being deprioritized by any logic; there was no logic that could surface any project as a focus. This was a missing feature, not a bug in prior work.

## What was built

**A `kb-status` convention.** Every `dev-projects/*/architecture.md` can now carry a machine-readable marker:

```
<!-- kb-status: level=active-focus | phase="Build Phase — platform codebase scaffolded & build-verified" | updated=2026-07-08 -->
```

Five levels, ranked: `active-focus` > `active` > `operational` > `planning` > `documented` > `unspecified`.

**Backfilled across all 8 dev-projects**, sourced from each article's own stated phase/status where available, honestly labeled `[unverified]` where inferred:

| Project | Level | Phase |
|---|---|---|
| shakespearience | active-focus | Build Phase — platform codebase scaffolded & build-verified |
| codex-guardian | active | Phase 03b — Live Verification |
| private-club-app | active | Phase 03 — Active Development |
| comtechsuite | active [unverified date] | Iteration 1 — Stabilization complete |
| writetrack | operational | Working pipeline (14–18s processing) |
| flowscape | operational | Ambient logging, active sessions |
| nexus | planning | Research / Technical Proposal |
| prestige-fiction-forge | documented [unverified] | Architecture documented |

**Real feature shipped in ClaudeSecondBrainApp**, not a config flag:
- `main.js` — new IPC handler `kb:get-project-status` + `getProjectStatuses()`, which scans all 8 architecture files, parses the marker via regex, ranks and sorts.
- `preload.js` — exposes `window.kb.getProjectStatus()`.
- `ActiveProjectsPanel.jsx` (new component) — a highlighted "Current Focus" banner for the single `active-focus` project, click-through into the editor, plus a compact ranked list of the rest.
- `App.jsx` — panel wired into the left sidebar between the console stats and the wiki browser, refreshing on the same file-watcher cycle as everything else.
- `styles.css` — new status-dot color variants (focus/operational/planning).
- `README.md` — documents the IPC channel, component, and the marker convention for future projects.

**Verified, not assumed working:** `node --check` clean on both main-process files; `npx vite build` compiled 617 modules with no errors; a standalone regex test run against all 8 real files confirmed every marker parses correctly and Shakespearience resolves to `active-focus` as intended.

One practical note for Gabriel: Electron doesn't hot-reload a packaged build. If the app is currently running from a prior build, it needs a restart (`npm run dev` for live dev mode, or a fresh `npm run build` for the packaged app) before the new panel will actually appear on screen.

## Shakespearience wiki article — enriched

`wiki/dev-projects/shakespearience/architecture.md` now carries:
- The status marker and a visible Status line at the top.
- A full "Technical Implementation" section: stack, what's built, the 2026-07-07 build verification results (4 real bugs found and fixed, npm vulnerabilities reduced from 25/3-critical to 10/0-critical, all 26 Next.js routes building clean), and an honest list of what's not done yet (no major-version SDK jumps taken, UI exists only as architecture/sequencing in code, not a running deployed instance).
- A corrected Tech Budget section synced from the real `.gsheet` figures ($7,040–$26,360 startup range, $83–$511/month operating range).
- A cross-reference to `dev-infrastructure/code-best-practices.md`, since this codebase is the first project built and verified end-to-end against that standard since it was formalized.

## `_connections.md` — two new entries

Linking the Shakespearience-Platform codebase to the code-best-practices standard it was built against, and linking the new dashboard feature back to the Shakespearience complaint that caused it to be built — so the trail from "Gabriel noticed a gap" to "the tool got better for every project" stays visible in the graph.

## Bookkeeping

`wiki/_meta/change-log.md` and `wiki/_index.md` (stats table + new "Active-focus project" row) both updated to reflect this session's work.
