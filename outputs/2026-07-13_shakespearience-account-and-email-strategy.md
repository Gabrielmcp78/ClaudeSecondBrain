# Shakespearience — Account Management + Business Email Strategy

**Date:** 2026-07-13
**Requested by:** Gabriel — how to manage accounts across all tech services, and best non-Google email for the business/memberships.
**Feeds:** `SETUP.md` (11-step account-creation order) in the Shakespearience-Platform repo.

---

## Core principle

Every tech-service account is registered under a **company-owned role address at shakespearience.com**, never a personal Gmail and never one person's name. The company owns the identity; humans are invited into it. This survives a founder leaving and keeps account recovery inside the business.

## Root-of-trust (protect hardest — 2 hardware keys each)

1. **Domain registrar / DNS** (Cloudflare Registrar) — controls email auth + can reset everything downstream. The crown jewel.
2. **Email host** (see below) — receives every verification + recovery email.
3. **Password manager** (1Password or Bitwarden) — single source of truth for all credentials, API keys, TOTP seeds, recovery codes. One shared "Shakespearience Platform" vault.
4. **Business bank** (Mercury or similar LLC banking) — issues per-vendor virtual cards so any subscription can be killed without rotating the primary card.

## Role-address scheme (aliases into a shared mailbox)

- `admin@` / `ops@` — owner login for infra (Vercel, Supabase, Cloudflare, Clerk)
- `billing@` — Stripe, hosting invoices, registrar renewals
- `support@` — member-facing replies
- `security@` — breach/abuse, DMARC reports
- `dns@` — registrar + DNS notifications
- `gabriel@`, `stephanie@` — real human mailboxes

## Non-Google email host — recommendation

**Primary pick: Fastmail Business Standard — $6/user/mo.** Custom domain, 60GB, unlimited aliases (so every role address routes into a shared inbox at no extra cost), best-in-class deliverability, real admin tools, native migration. Two human seats to start (~$12/mo).

Alternatives:
- **Proton Mail Business** ($6.99/user/mo, annual) — privacy/encryption first; needs Proton Bridge for IMAP, heavier for integrations.
- **Migadu** ($19/yr flat, priced on volume not mailboxes) — unlimited real mailboxes/domains; ideal if you want many independent role mailboxes cheaply; more technical setup.
- **Zoho Mail** ($1/user/mo Lite; free for ≤5 users one domain, region-limited) — cheapest, solid, part of a broader suite.
- **iCloud+ custom domain** — not recommended for the business: no team admin or role management.

## Critical DNS gotcha

The mailbox host and the sending stack coexist on the same domain and must not collide:
- **MX** → Fastmail (receives mail).
- **Resend** (transactional) + **ConvertKit** (marketing) each need their own SPF include + DKIM; DMARC is one policy for the domain.
- Send automated member email from a **subdomain** (e.g. `send.shakespearience.com`) via Resend so bulk sending never damages the root-domain reputation your real mailboxes depend on.

## Service tiers (for SETUP.md ordering)

1. Root-of-trust: registrar, email host, password manager, bank.
2. Money: Stripe, bank virtual cards.
3. Infra: Vercel, Supabase, Cloudflare R2, Clerk.
4. Comms: Resend, ConvertKit, Transistor.
5. Ops: n8n/Hetzner, Sanity, Plausible, Printful.

Create top-down: each lower tier's signup and verification depends on the tier above it existing first.
