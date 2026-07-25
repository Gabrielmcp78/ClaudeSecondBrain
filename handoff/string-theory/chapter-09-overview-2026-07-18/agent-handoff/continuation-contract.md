# Agent Continuation Contract

The next agent must begin with `../manifest.json` and `../README.md`.

Until `../raw/00-conversation-transcript.md` exists and has been verified against the authenticated ChatGPT source, this package may be used only as a recovery dossier. It must not be represented as the complete Chapter 9 Overview discussion.

After lossless retrieval:

1. Preserve the raw transcript as immutable source evidence.
2. Extract each complete edit draft into `../raw/drafts/` without altering a character.
3. Create `../raw/message-index.json` with chronological message numbers, roles, source boundaries, and draft links.
4. Create `continuation-state.md` from explicit decisions only. Keep inference clearly separate.
5. Record verification method and any source elements that could not be exported.
