

## Drive Docs and Sheets Tooling Knowledge - 2026-07-23
# Drive Docs and Sheets Tooling Knowledge

Use this to avoid confusing visible browser context, Drive files, and actual editable surfaces.

## Browser/Chrome context

A selected browser tab can provide read context, page title, visible text, or URL. It does not by itself prove that an agent can write to the underlying document.

## Google Docs / Drive write path

Before promising or performing document edits, inspect the available tools in the current session. Possible write-capable surfaces may include SecondBrain or Google Drive document append/replace/batch update tools, but availability changes by session.

Separate two questions:

1. Is there a write-capable tool available?
2. Is the requested edit authorized?

Both must be true before editing.

## Safer edit workflow

1. Identify exact Drive file or document id.
2. Retrieve current document text or target paragraph/range.
3. Confirm exact target scope.
4. Apply append, replace, or structured batch update.
5. Reread the changed area.
6. Report what changed and what was not changed.

## Google Sheets / file control

Live file-control updates should use native Google Sheets. Uploaded Office spreadsheets may display in Google Drive but fail operations that require native Sheets structure.

If a tool reports that an operation is not supported because the document must not be an Office file, treat the uploaded spreadsheet as backup only and convert/import to native Sheets before live control updates.

## Manuscript caution

Even when document-write tools exist, Fiction Studio manuscript prose remains protected unless the current task explicitly authorizes the edit.
