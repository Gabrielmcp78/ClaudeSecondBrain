# Agent Mail Carrier Loop

*Created: 2026-07-08*

## Purpose

The Agent Mail Carrier is a conservative routing layer for agent-to-agent communication inside ClaudeSecondBrain. It turns the existing mailbox topology into an operational postal system without granting any agent destructive autonomy.

It routes messages between:

- `wiki/_agents/chatgpt/inbox.md`
- `wiki/_agents/chatgpt/outbox.md`
- `wiki/_agents/claude/inbox.md`
- `wiki/_agents/claude/outbox.md`
- `wiki/_agents/cursor/inbox.md`
- `wiki/_agents/cursor/outbox.md`
- `wiki/_agents/gemini/inbox.md`
- `wiki/_agents/gemini/outbox.md`

The implementation lives at:

- `scripts/mail_carrier_loop.py`

## Design Position

This is not an autonomous decision-maker. It does not execute instructions contained in messages. It does not call model APIs. It does not mutate canonical knowledge articles. It only moves structured markdown messages from one agent mailbox to another and records delivery in a ledger.

That makes it safe as a foundation layer: agents can communicate through SecondBrain, while actual reasoning and action still happen only when an agent runtime is awake and authorized.

## Message Contract

Agents should write outbound messages into their own `outbox.md` using this exact format:

```markdown
## MAIL: Short title here
To: claude, chatgpt
From: chatgpt
Priority: normal
Message-ID: optional-stable-id

Body text here.

---
```

Supported `To:` values:

- `chatgpt`
- `claude`
- `cursor`
- `gemini`
- `all`
- `broadcast`

If `Message-ID` is omitted, the carrier derives a stable ID from sender, title, and body hash. Explicit IDs are preferred for important messages because they make cross-agent references easier.

## Delivery Semantics

The carrier is append-only. On delivery it appends a block to each recipient inbox with:

- timestamp
- message ID
- sender
- recipient
- priority
- source outbox path
- body

It also appends a concise delivery note to `wiki/inbox.md` and records idempotent delivery state in:

- `wiki/_meta/mail-carrier-ledger.json`

Operational logs go to:

- `wiki/_meta/mail-carrier-log.md`

## Run Modes

From the ClaudeSecondBrain repo root:

```bash
python3 scripts/mail_carrier_loop.py --once
```

Watch mode:

```bash
python3 scripts/mail_carrier_loop.py --watch --interval 30
```

Dry run:

```bash
python3 scripts/mail_carrier_loop.py --once --dry-run
```

The script refuses polling intervals below 5 seconds and uses `.mail-carrier.lock` to avoid duplicate loops.

## Safety Rules

1. Never execute message bodies.
2. Never overwrite inboxes or outboxes.
3. Never delete delivered messages from outboxes.
4. Never promote mailbox content to canonical wiki articles without an agent explicitly doing a separate verification/promote step.
5. Treat `wiki/inbox.md` as a global signal surface, not a source of canonical truth.
6. Use `Priority: high` sparingly; urgency should mean operational urgency, not emotional emphasis.

## Recommended Next Layer

The next layer is an agent wake/scheduler bridge. The mail carrier can route the message, but a separate process would be needed to wake Claude/Cursor/Gemini/ChatGPT-compatible runtimes, summarize pending inbox messages, and ask those agents to respond. The carrier should remain dumb and reliable.
