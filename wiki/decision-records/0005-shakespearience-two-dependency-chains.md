# ADR 0005 — Shakespearience Setup Runs on Two Parallel Dependency Chains

**Date:** 2026-07-14
**Status:** Accepted
**Decided by:** Claude (analysis), ratified by Gabriel (patch approved)
**Session context:** Ops Playbook 01's Step 0 implied the legal entity gated all account creation, which would have stalled the entire infrastructure build behind LLC paperwork.

---

## Decision

Shakespearience setup runs on **two parallel dependency chains**, not one sequence.

**Identity chain (gated by nothing — starts immediately):**
password manager → email host → Cloudflare (registrar + DNS) → mail records → all Tier 3-5 services.

**Money chain (gated by paperwork):**
legal entity + EIN → business bank → Stripe.

The LLC and EIN gate the bank and Stripe only. They do not gate Cloudflare, Fastmail, the password manager, Vercel, Supabase, or Clerk.

---

## Bootstrap Paradox Resolution

The `ops@` mailbox cannot exist before DNS, and the Cloudflare account cannot exist without an owner address. This circular dependency is resolved with a **Fastmail-native bootstrap identity**: buy Fastmail first, create 1Password and Cloudflare under its `@fastmail.com` address, stand up DNS, attach the custom domain, then rotate all three account-owner emails to role addresses. Only those first three accounts ever touch the bootstrap identity, and none keep it past the DNS handoff.

---

## Context

Conflating the chains costs weeks of dead time waiting on entity formation for work that formation does not block. The original playbook's Step 0 created a false linear gate that would have blocked the entire infrastructure build on paperwork. The bootstrap paradox was a genuine circular dependency with no stated resolution — it would have surfaced as a blocker at account number 1.

---

## Consequences

**Applies to:**
- Ops Playbook 01, Steps 0 and 0.5
- Any future sequencing advice given to Gabriel on Shakespearience setup

**Reopening condition:** Shakespearience is folded into Present Company as a division rather than formed as its own entity, changing what the money chain depends on.

---

## Addendum — 2026-07-24 (Claude, live Trello sync)

The two-chain structure and bootstrap-paradox resolution above remain in force and are not reopened. Two of the named providers within the identity chain changed after this ADR was written, both per Gabriel decisions dated 2026-07-22: **Bitwarden replaces 1Password**, and **Google Workspace replaces Fastmail** as the bootstrap identity and ongoing email host. The chain shape, sequencing logic, and rotation procedure are unchanged — only the vendor names in "Fastmail-native bootstrap identity" above are stale. See [Ops Playbook 01](../dev-projects/shakespearience/ops-playbooks/01-accounts-and-access.md) for the corrected, current provider names and rotation steps.
