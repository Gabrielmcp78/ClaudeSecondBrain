

## Knowledge Ingestion Runbook - 2026-07-23
# Knowledge Ingestion Runbook

Use this when expanding the SecondBrain wiki/documentation library.

## Step 1: discover

Search by project, artifact title, file id, chapter number, and known terminology. Search both SecondBrain and Drive/local manuscript roots when available.

## Step 2: classify

Before summarizing, classify the artifact:

- canon
- experiment
- working artifact
- approved-not-assembled
- critique/reference
- file-control metadata
- visual companion
- archive/backup
- unknown

## Step 3: extract only durable knowledge

Prefer durable operational facts:

- source hierarchy
- status decisions
- locked terminology
- exact file IDs/paths
- chapter/section scope
- user preferences that affect future actions
- repeated failure modes
- next operations

Avoid dumping full manuscript prose into wiki notes unless the user explicitly asks for that and the destination is appropriate.

## Step 4: attach metadata

For each item, record:

- file name
- file id/path
- modified time if available
- source authority
- status
- allowed uses
- forbidden uses
- verification method

## Step 5: link into indexes

Update `_index.md`, `change-log.md`, and `task-ledger.md` with the new page path and why it exists.

## Step 6: verify discoverability

Search for a distinctive phrase from the new page. If search does not surface it, log an indexing gap rather than assuming the page failed.

## Step 7: preserve boundaries

Do not use ingestion as a backdoor to alter manuscript prose, canonical status, file-control records, or approved assembly state.
