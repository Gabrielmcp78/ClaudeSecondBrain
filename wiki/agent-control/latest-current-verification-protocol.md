

## Latest and Current Verification Protocol - 2026-07-23
# Latest and Current Verification Protocol

Use when the user asks for `latest`, `current`, `newest`, `approved`, `canonical`, `where are we`, `what is next`, or similar status-sensitive language.

## Required steps

1. Search SecondBrain for project status and prior decision notes.
2. Search Drive/local manuscript roots for the named project, chapter, scene, or artifact.
3. Compare candidates by modified time, status labels, file-control entries, and artifact class.
4. Prefer canonical source over newer experimental material unless the user asks for experimental/latest options.
5. State the basis for the selection in the response.
6. If multiple plausible candidates exist, report them with status labels instead of choosing silently.

## Response pattern

Use language like:

- `Canonical source verified: ...`
- `Newest experimental material found: ...`
- `Secondary/reference material found: ...`
- `I did not find a current file-control confirmation for ...`
- `This is memory-derived and should be reverified before edit/assembly.`

## What counts as enough verification?

For low-risk summary work:

- current source path or Drive file identified
- artifact class clear
- no obvious conflicting newer candidate

For revisions, assembly, readiness judgment, or file control:

- source file opened or text retrieved
- target scope verified
- exact authorization confirmed
- output scope labeled
- status impact recorded

## Common failure mode

The system often remembers correct prior decisions, but those decisions can be stale. Memory should tell agents where to look and what traps to avoid; it should not be treated as the live file state.
