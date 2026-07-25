# Wiki Page Schema

*Moved 2026-07-25 from `wiki/ingestion/wiki-page-schema.md` (written 2026-07-23) as part of reconciling an undocumented parallel taxonomy back into the canonical structure. This is a general KB-wide convention, not project-specific, so it lives in `_meta/` alongside `agent-protocol.md` rather than under `craft-fiction/`.*

Use this schema when adding substantive knowledge pages to the wiki, in addition to — not instead of — the core rules in `CLAUDE.md` (source citation, neutral tone, cross-linking).

## Required front matter in body

Each substantive knowledge page should include these fields near the top:

- Purpose
- Applies to
- Source authority
- Last verified
- Verification method
- Allowed uses
- Forbidden uses
- Drift hazards
- Next update trigger

## Source authority labels

Use one of: Canonical manuscript source · Experimental source · Approved working artifact · Secondary critique/reference · Process/control documentation · File-control metadata · Visual companion · Discovery inventory · Memory-derived, needs verification.

## Verification language

Use plain status language: `Verified this session by opening/retrieving the file.` / `Surfaced by Drive search, contents not fully inspected.` / `Memory-derived from prior verified work; reverify before live action.` / `User-stated in current session.` / `Unknown; verify before use.`

## Good knowledge page structure

1. Short purpose.
2. What an agent should do.
3. What an agent must not do.
4. Known files or IDs.
5. Known drift hazards.
6. Current next operation or update trigger.

## Bad knowledge page patterns

- Vague summary without source status.
- Claiming latest/current without timestamp or verification method.
- Mixing canon and experimental prose.
- Hiding uncertainty.
- Recording a user preference without scope or date.
- Creating a long prose essay that cannot be scanned during task startup.

*Cross-reference: [Fiction Studio Source Control Protocol](../craft-fiction/fiction-studio/source-control-protocol.md) applies this schema's discipline specifically to manuscript source-authority classification.*
