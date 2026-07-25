

## Canonical Manuscript Access Route
Canonical current manuscript access route for scene-level retrieval:

https://gabrielmcp78.github.io/string-theory-chapters/index.html

Use this GitHub Pages index as the primary pointer when Gabriel asks for manuscript output by chapter/scene, e.g. "output scene 4 of chapter 7." Raw SB files may contain archival snapshots and are useful for backup/cross-checking, but the GitHub Pages chapter index is the intended navigation source for current manuscript chapter access.

Operational rule:
- For scene/chapter output requests, first consult the GitHub Pages chapter index.
- Use raw files only as fallback or provenance support.
- Do not treat SB summaries as manuscript text.
- Manuscript prose remains read-only unless Gabriel explicitly authorizes edits or says "rewrite this."


## Canonical Source — Manuscript Masters Export Folder

Canonical working source:

`/Users/gabrielmcp/Library/CloudStorage/GoogleDrive-gabemcpherson@gmail.com/My Drive/Manuscript Masters`

Current live export set (Draft 6.7, built 2026-07-11):

- `String Theory - Draft 6.7.txt` ← canonical text source for all retrieval
- `String Theory - Draft 6.7.docx`
- `String Theory - Draft 6.7.pdf`

*(Draft 6.6 files remain in this folder as historical reference. Do not use them as the current manuscript.)*

Operational source hierarchy for String Theory manuscript retrieval:

1. Pages working manuscript exports in `Manuscript Masters` are canonical current source.
2. Prefer `String Theory - Draft 6.7.txt` for direct text retrieval and scene/chapter output.
3. Use `.docx` or `.pdf` for formatting/layout confirmation when needed.
4. Use GitHub Pages chapter index (`https://gabrielmcp78.github.io/string-theory-chapters/`) as the manifest/navigation layer — chapter word counts, scene breakdowns, paragraph counts, scene-level navigation.
5. Use SB raw files only as archival fallback or historical comparison.
6. SB summaries are not manuscript text.

Manuscript prose remains read-only unless Gabriel explicitly authorizes edits or says "rewrite this."


## Retrieval Granularity — Use HTML Manifest as Scene/Paragraph Map
Refinement: the GitHub Pages HTML version is not the manuscript master, but it is useful as the scene/paragraph navigation and manifest layer.

Source model:

- `Manuscript Masters` remains canonical for current exported manuscript files from Pages.
- The GitHub HTML chapter index is a derived product of the same export automation and may provide superior retrieval granularity: chapter word counts, scene breakdowns, paragraph counts, and scene-level navigation.

Operational routing:

1. Use `Manuscript Masters/String Theory - Draft 6.6.txt` as the canonical text source when exact prose output is needed.
2. Use `https://gabrielmcp78.github.io/string-theory-chapters/index.html` as the manifest/navigation layer to identify chapter, scene, paragraph, and word-count boundaries.
3. For requests like "output scene 4 of chapter 7," use the HTML manifest to locate the scene boundary, then verify/output against the canonical exported text when possible.
4. This avoids loading/truncating the full 107,000-word manuscript unnecessarily.
5. SB raw files remain archival fallback only.

Practical agent rule: do not choose between Google Drive exports and GitHub HTML. Treat them as paired layers: Drive exports are canonical text; GitHub HTML is the structured retrieval map.


## Correction — Exclude Google Doc Reader from Novel Manuscript Retrieval Sequence
The Google Docs/Drive native document reader should not be part of the normal operational sequence for String Theory manuscript retrieval.

Correct sequence for novel manuscript work:

1. Use the GitHub HTML chapter index / chapter pages as the derived manifest layer for chapter, scene, paragraph, and word-count boundaries.
2. Use local Google Drive export files in `Manuscript Masters` as the canonical text source, especially `String Theory - Draft 6.6.txt` or later current `.txt` export.
3. Use `.docx` or `.pdf` exports only for formatting/layout verification when needed.
4. Do not use Google Docs-native reading or `drive.read_doc` in the normal manuscript sequence unless Gabriel explicitly asks to inspect a native Google Doc.
5. Do not use SB summaries as manuscript text.
6. Do not use SB raw files except as archival fallback/historical comparison.

Reason: the actual writing workflow occurs in Pages. The automation exports txt/doc/pdf/epub into `Manuscript Masters` and separately exposes GitHub HTML for structured browsing. Google Docs structure is not authoritative for this novel workflow and can introduce wrong routing.


## Correction — No User Workaround for Chapter URL Resolution
Operational correction: agents must not ask Gabriel to paste direct GitHub chapter URLs as a workaround for retrieval. The purpose of the manuscript routing system is to let Gabriel refer naturally to chapters/scenes while the agent resolves the correct source path.

Correct behavior for requests like "Chapter 20 Scene 5" or "scene 4 of chapter 7":

1. Use the GitHub HTML index/manifest route to resolve chapter and scene boundaries without asking Gabriel for a direct URL.
2. If a direct child page cannot be opened by one tool path, try supported alternatives: read the index source, use the known chapter URL pattern, search the GitHub Pages domain, inspect available raw/manifest files, or use the canonical local export text with heading searches.
3. Ask Gabriel for a URL only as a last resort after all available system routes fail, and state exactly which routes failed.
4. Do not make the user manually compensate for tooling limitations the SB architecture was built to absorb.

The intended interaction is natural-language addressing: Gabriel should be able to say "let's look at Chapter 7 Scene 3" and the system should resolve the source path.
