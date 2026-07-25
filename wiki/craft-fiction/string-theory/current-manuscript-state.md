# String Theory — Current Manuscript State

*The live control center for String Theory's production status. This file tracks manuscript version, submission activity, revision notes, research flags, and editorial feedback. The novel's prose is read-only for all agents (see ADR 0003). This file records the surrounding intelligence — what changed, what agents/editors have said, what still needs scrutiny.*

*Last verified: 2026-07-16 (Claude)*

---

## Manuscript Status

| Field | Value |
|-------|-------|
| Current draft | Draft 6.7 |
| Build date | 2026-07-08 |
| Structure | Overture + 27 chapters |
| Word count | 107,060 words |
| Canonical prose source | Google Drive / My Drive / Manuscript Masters / `String Theory - Draft 6.7.txt` |
| Navigation index | `https://gabrielmcp78.github.io/string-theory-chapters/index.html` (chapter/scene manifest; derived from canonical source) |
| Export pipeline status | Verified working 2026-07-08. Pages → Drive sync → `watch_manuscript.py` → `rebuild_and_deploy.sh` → GitHub Pages. |
| Query word count | 96,000 words (used in all June 2026 query letters; reflects a trimmed submission version) |

**Retrieval hierarchy for agents:** Drive `Manuscript Masters` `.txt` export for exact prose. GitHub Pages HTML index for chapter navigation and boundary finding. SB wiki summaries are not manuscript text — they are secondary documentation only.

---

## Query Submission Status

| Field | Value |
|-------|-------|
| Letters sent | 29+ (as of June 2026 push) |
| Status | Responses pending |
| Query letter version | Final (see [Query Letter](submission-strategy/query-letter.md)) |
| Framing note | Avoid "mid-life sad professor" framing — emotional architecture is grief → resonance → release |
| Agent tier targeting | Tiers A and B; full profiles in [Agent Profiles](submission-strategy/agent-profiles.md) |

### Response Log

*No responses received as of 2026-07-16. Update this section when responses arrive.*

| Date | Agent | Response type | Notes |
|------|-------|---------------|-------|
| — | — | — | Awaiting first response |

---

## Revision History

| Draft | Date | Key change |
|-------|------|-----------|
| Draft 6.6 | ~2026-05 | Query submission version; 96,000 words |
| Draft 6.7 | 2026-07-08 | Live manuscript; 27 chapters; 107,060 words |

*For earlier draft history, query the novel's commit history in the pipeline source or Gabriel's manuscript file.*

**Chapter structure change (6.6 → 6.7):** The query submission version was 20 chapters; the current live manuscript is 27 chapters. Chapter-by-chapter articles in this KB (chapter-summaries.md, novel-structure.md) reflect the 20-chapter snapshot and have not yet been re-ingested against the 27-chapter structure. Treat their chapter-specific content as `[historical: 2026-05]` until re-ingestion is complete.

---

## Research Verification Flags

*Claims in the manuscript that require or have received external verification against real science, history, or geography.*

| Claim / Element | Domain | Status | Notes |
|----------------|--------|--------|-------|
| 68.48 Hz harmonic frequency | Physics / VCH | `[creative-canon]` · `[theoretical]` | Neurophysiological basis documented in [68.48 Hz Mechanic](68hz-mechanic.md); VCH bridge in [VCH Framework](../../theory-consciousness/vch-framework.md) |
| Schumann resonance at 7.83 Hz | Physics | `[verified]` | Established electromagnetic resonance measurement |
| Project ARGO (1971, Cornell) | Fictional history | `[creative-canon]` | Entirely fictional; no real Cornell classified project of this name exists |
| Solar maxima / genius birth correlation (Ch. 7) | History / Astrophysics | `[theoretical]` | VCH extension; not established science; labeled `[theoretical]` in [connections](../../_connections.md) |
| Age-47 biological keying | Neuroscience / VCH | `[theoretical]` | Part of the novel's formal resonance model; VCH-derived, not established neuroscience |
| Feynman Chair at Cornell (and the building) | Setting / Academic title | `[creative-canon]` | Fictional endowed chair and building at Cornell; not a real institution. Confirmed by Gabriel 2026-07-16. |
| Newton born Christmas Day 1642; Maunder Minimum onset ~1645 (Ch. 13) | History / Astrophysics | `[verified]` | Consistent with standard dating; supports the novel's "three years before" claim. |
| Émilie du Châtelet's *vis viva* / velocity-squared physics (Ch. 13) | History of science | `[verified]`, framing is `[creative-canon]` | Her real documented position, rendered as a harpsichord/octave-doubling revelation. |
| Fraunhofer absorption lines shown to Newton, 1665/66 (Ch. 13) | History of science | `[creative-canon]` — anachronism | Real discovery is Fraunhofer, 1814. Deliberate compression for the vision device. |
| Helmholtz/Chladni composite lab figure (Ch. 13) | History of science | `[creative-canon]` | Two real, non-contemporary scientists merged into one visitor. |

---

## Continuity Flags

*Internal consistency items flagged for verification against the current manuscript. These are not errors — they are open questions that need a chapter-check.*

| Element | Flag | Resolution |
|---------|------|-----------|
| Novel structure articles (chapter-summaries.md, novel-structure.md) | `[historical: 2026-05]` — reflects 20-chapter structure, not current 27-chapter | Re-ingest once Gabriel confirms the chapter-summary KB rebuild is a priority |
| String Theory Overview word count | Updated 2026-07-16 — now reads 107,060 / Overture + 27 chapters | Resolved ✅ |
| Rune's role recontextualization chapter | Was "Chapter 17" in old 20-chapter build. Now **Chapter 24** (Endless Possibilities / Collapsed Reality). Confirmed via chapter mapping. | Resolved ✅ |
| Eleanor Guare's focal chapter | Old build: Ch 13 "Phenom de Guare". Now **Chapter 20** in Draft 6.7. | Resolved ✅ |
| Eleanor Guare / Tsukino reveal chapter | Old build: Ch 5. Now **Chapter 12** ("Twin Primes on the six") in Draft 6.7. | Resolved ✅ |
| **Chapter 6 → Chapter 13 renumbering confirmed** | Full text of current-manuscript Chapter 13, "Visions and Burdens… of Knowing" (5 scenes, 6,201 words), delivered to Claude 2026-07-16. Title, five-movement symphony form, and scene content (Pythagoras → du Châtelet → office purge → Helmholtz/Chladni → Newton) match the old-structure Chapter 6 entry in `chapter-summaries.md`/`novel-structure.md` exactly. This empirically confirms the 20→27 chapter shift moved this chapter from position 6 to position 13. New detailed article: [Chapter 13 — Visions and Burdens](chapter-13-visions-and-burdens.md). | Confirmed ✅ — but creates a new open question below |
| **Old Chapter 13 ("Phenom de Guare") position unknown** | The old 20-chapter structure's Chapter 13 (Eleanor Guare focal chapter, Nov 29 EMP, 1971 Ishikawa-seals-the-lab flashback) is now displaced by the above. Its new position in the 27-chapter manuscript is unconfirmed. `themes-and-canon.md` has two "(Chapter 13)" references written against the old numbering that need correction once located. | `[needs Gabriel confirmation or manifest lookup]` |

---

## Editorial Feedback History

*Record of substantive feedback from agents, editors, workshop readers, or AI critique tools.*

| Date | Source | Feedback summary | Response / action |
|------|--------|-----------------|-------------------|
| — | — | No external editorial feedback on record yet | — |

*AI critique (Prestige Fiction Forge / Shark Autopsy) is tracked separately in the PFF architecture article. Promote any substantive findings here once a full chapter run is complete.*

---

## Next Actions

| Priority | Action | Owner |
|----------|--------|-------|
| High | Monitor query responses; log in Response Log above | Gabriel |
| Medium | Re-ingest chapter-summaries.md against 27-chapter structure — update plot summaries for new Chs 1–8 (THE IVY LEAGUE through Remaining Returns); existing summaries for old Chs 3–20 are valid with number offset | Claude (when Gabriel activates) |
| Low | Confirm musical form designations for Chs 1–2, 4, 9–15, 17, 19, 21–23, 26–27 — only confirmed in manifest for Chs 3, 16, 24, 25 | Claude (chapter text lookup) |

---

*For submission strategy, see [Query Letter](submission-strategy/query-letter.md) and [Agent Profiles](submission-strategy/agent-profiles.md). For the novel's science, see [68.48 Hz Mechanic](68hz-mechanic.md) and [VCH Framework](../../theory-consciousness/vch-framework.md). For the export pipeline, see [Manuscript Export Pipeline](../../dev-infrastructure/manuscript-export-pipeline.md).*


## Experimental Draft Boundary — 2026-07-17
Gabriel clarified that `String Theory 7` and `String Theory 7.1` are experimental working versions, not replacements for the current full-manuscript canon. `StringTheory_7.2_options` is also experimental, has not been ingested into SecondBrain, and extends only through Chapter 4. For Chapter 5 onward, including the current Chapter 9 work, Draft 6.7 remains the controlling full-manuscript source unless Gabriel explicitly supplies or designates a later replacement. Experimental opening revisions may inform Chapters 1–4 only and must not be projected forward into later-chapter continuity.
