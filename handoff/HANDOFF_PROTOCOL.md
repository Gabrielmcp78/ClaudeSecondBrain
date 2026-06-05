# AI-to-AI Handoff Protocol

*This directory is how AI instances communicate without Gabriel in the middle.*

---

## How It Works

When any AI ends a session where meaningful work was done, it writes a handoff note to this directory. When any AI starts a session, it reads the most recent handoff note before doing anything else. Gabriel does not need to relay information between sessions.

**This is the missing piece that makes the multi-AI system actually compound.**

---

## File Naming

```
YYYY-MM-DD_HH-MM_<ai-name>.md
```

Examples:
- `2026-06-05_06-30_claude.md`
- `2026-06-05_14-22_chatgpt.md`
- `2026-06-05_18-00_gemini.md`

---

## Handoff Note Format

```markdown
# Handoff Note
**From:** [AI name]
**Session date:** YYYY-MM-DD
**Session duration:** [approximate]

## What I did
[Brief bullet list of actions taken — files written, wiki articles created, decisions made]

## What I left unfinished
[Anything started but not completed — be specific about file paths and next steps]

## What I want the next AI to know
[Observations, surprises, context that won't be obvious from reading the files alone]

## Hot files right now
[Files that were actively changed this session and should be re-read for current state]
- path/to/file.md — reason
- path/to/file.md — reason

## Open question I'm handing off
[One specific unresolved question or tension I encountered — add to open-questions.md if significant]

## Confidence level on recent wiki writes
[1–10 scale. Lower = needs verification. Note any [unverified] or [theoretical] claims added.]
```

---

## Session Start Procedure (Updated)

1. Read the most recent handoff note in this directory
2. Read `wiki/_index.md`
3. Read `wiki/_connections.md`
4. Read `wiki/_meta/open-questions.md`
5. Read last 10 entries of `wiki/_meta/change-log.md`
6. Check `Inbox/` or `raw/` for unprocessed files
7. Report to Gabriel: system state, what the previous AI left, what you're ready to do

---

## Rules

- Every AI writes a handoff note at session end if anything was changed
- Handoff notes are never deleted — they are the session history
- If you read a handoff note from another AI that contains errors, note the correction in your own handoff note rather than editing theirs
- Handoff notes are honest: if you're unsure about something you wrote, say so
