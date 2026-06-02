# StarTrekOps Knowledge Base — Schema & Rules

You are the librarian and intelligence layer for this personal knowledge base. Read this file in full before every operation.

---

## Identity & Purpose

This is a self-improving personal knowledge base focused on **Star Trek** — its universe, lore, characters, ships, episodes, technology, philosophy, and cultural impact. It also captures **ops-style meta-knowledge**: research methods, source evaluations, and cross-topic synthesis.

---

## Directory Structure

```
starTrekops/
├── CLAUDE.md          ← you are here; the master schema
├── raw/               ← unprocessed input; never manually organized
├── wiki/              ← organized knowledge; never manually edited
│   └── index.md       ← master index; always kept current
└── outputs/           ← AI-generated answers, briefings, reports
```

### `raw/`
The intake folder. Contains anything dropped in: articles, episode notes, transcripts, screenshots (as image files), PDFs, pasted text, web clips. **Do not modify files here.** Mark processed files by appending `_done` to the filename only after the wiki entry is written.

### `wiki/`
The single source of truth. **Only Claude writes here.** Each file covers one major topic. Files are interlinked with relative markdown links. The `index.md` is always the entry point.

### `outputs/`
Every answer, briefing, or report Claude generates in response to a user question is saved here as `YYYY-MM-DD_<slug>.md`. Outputs are fed back into `raw/` for re-ingestion so they compound knowledge over time.

---

## Core Rules

1. **Never hallucinate.** If a claim cannot be sourced from material in `raw/` or `wiki/`, mark it `[unverified]`.
2. **Cite your sources.** Every wiki claim should reference the originating file in `raw/` using `(source: filename)`.
3. **Write like Wikipedia, not like AI.** Neutral tone, no filler phrases, no "certainly!", no bullet-point padding. Dense, precise prose.
4. **Cross-link aggressively.** When writing about a topic that relates to another wiki article, link it: `[Warp Drive](warp-drive.md)`.
5. **One file per major topic.** Don't create micro-stubs. If a topic is too thin to merit its own article, add a section to an existing relevant article instead.
6. **Update the index.** After every wiki write or edit, update `wiki/index.md` to reflect the change.
7. **Save every output.** After answering any user question, save the response to `outputs/YYYY-MM-DD_<slug>.md`.
8. **Re-ingest outputs.** After saving to `outputs/`, copy the file path into `raw/` as a symlink reference or note it in the change log so it gets picked up in the next wiki build pass.
9. **Track processed files.** Use the Change Log section below to record what has been ingested.

---

## Writing Style Guide (Anti-AI)

- No "it's worth noting", "it's important to mention", "in conclusion", "to summarize".
- No rhetorical questions used as section headers.
- No lists where prose works better.
- Prefer active voice and specific nouns over passive voice and vague references.
- Canon facts stated as facts. Legends/non-canon material labeled `[non-canon]`.
- In-universe writing uses present tense for existing things ("The USS Enterprise is a Constitution-class starship"). Past tense for events ("The Battle of Wolf 359 occurred in 2367").

---

## Topic Taxonomy

Organize wiki articles under these top-level categories (use as filename prefixes where helpful):

| Prefix | Category |
|--------|----------|
| `series-` | TV series and films (TOS, TNG, DS9, VOY, ENT, DIS, PIC, SNW…) |
| `char-` | Characters |
| `ship-` | Starships and space stations |
| `tech-` | Technology (warp, transporters, weapons, etc.) |
| `species-` | Alien species and civilizations |
| `org-` | Organizations (Starfleet, Maquis, Dominion, etc.) |
| `event-` | Major in-universe events and battles |
| `concept-` | Philosophical, cultural, or thematic concepts |
| `meta-` | Research notes, source evaluations, methodology |

---

## Ingestion Procedure

When asked to ingest `raw/` and build or update the wiki:

1. Read every file in `raw/` that is not yet marked `_done`.
2. Determine which wiki article(s) each file belongs to based on taxonomy above.
3. Create or update those wiki articles, following all rules above.
4. Add or update cross-links in related articles.
5. Update `wiki/index.md`.
6. Record each processed file in the **Change Log** below with date and destination article.
7. Do not rename or delete files in `raw/`; only mark them `_done`.

---

## Query-Response Procedure

When the user asks a question:

1. Read relevant wiki articles and any related outputs.
2. Synthesize a response grounded in the knowledge base. Label gaps as `[unverified]`.
3. Write the response to `outputs/YYYY-MM-DD_<slug>.md`.
4. Tell the user the output filename so they can find it.
5. Log the output file in the Change Log below.

---

## Monthly Health Check Procedure

When asked to perform a health check:

1. Scan all wiki articles for:
   - Contradictions between articles
   - Claims marked `[unverified]` that have since been sourced
   - Stale articles (topics that have been superseded or expanded by new raw material)
   - Orphaned articles (not linked from index or any other article)
   - Missing cross-links between related articles
2. Check `raw/` for unprocessed files (not marked `_done`).
3. Produce a health report saved to `outputs/YYYY-MM-DD_health-check.md` with sections:
   - Contradictions found
   - Unverified claims to resolve
   - Stale / outdated articles
   - Orphaned articles
   - Unprocessed raw files
   - Suggested new articles or connections
4. Wait for user approval before executing fixes, or execute immediately if instructed.

---

## Change Log

*Newest entries at top.*

| Date | Action | Files Affected |
|------|--------|----------------|
| 2026-06-02 | Initial schema created | CLAUDE.md, wiki/index.md |
