# Playbook 12 — Incident Response

*A calm, written plan for the bad days, so decisions come from a checklist instead of panic. You will not need most of this most of the time — which is exactly why it has to be written down before you do.*

**Audience:** Gabriel and Stephanie.
**Last updated:** 2026-07-13

---

## The principle

When something breaks, the first job is to know **what's actually affected, who leads, and what the first three moves are** — not to improvise. Each scenario below is a short runbook. Keep this file in the shared vault so both founders can reach it from any device.

## Roles

- **Gabriel** leads technical, security, and financial incidents.
- **Stephanie** leads audience/member communication and creative/brand incidents.
- Whoever detects an incident owns it until it's explicitly handed off. Say so out loud (or in writing).

## Scenario 1 — A service goes down (Vercel, Supabase, Transistor, etc.)

1. Check the vendor's status page (bookmark them in the ledger).
2. Determine blast radius: does it block *payments/signups*, *content delivery*, or just an internal tool?
3. If member-facing, post a short honest note (status/social) — silence erodes the trust the brand is built on.
4. Most outages are the vendor's and resolve on their side; your job is accurate communication, not a heroic fix.

## Scenario 2 — Payments failing at scale (Stripe)

1. Confirm it's real (Stripe dashboard) vs. a single card.
2. Check whether it's a Stripe incident, an expired API key, or a webhook failure (the `webhook_events` table).
3. The dunning sequence (Playbook 06) handles normal failed cards; a *systemic* failure means pause new-signup provisioning until fixed so you don't grant access without payment.
4. Reconcile once resolved — no double-charges, no missed provisioning.

## Scenario 3 — Lost / stolen device or login

1. From another device, change the password-manager master password.
2. Confirm the four root accounts still require the hardware key (they should — that's why they have it).
3. Force sign-out where possible (Clerk for the app; each service's session control).
4. Remote-wipe the device (Find My). Rotate any credential that lived outside the vault.

## Scenario 4 — Data / privacy incident (highest stakes — children's data)

1. Contain first: revoke access, rotate keys, stop the exposure.
2. Determine what data and whose — member, and critically, **children's or school data** (Playbook 05).
3. This triggers real obligations: breach-notification timelines vary by state, and children's/school data raises the bar. **Loop in counsel immediately** — do not decide notification on your own.
4. Notify your cyber insurer (Playbook 10) if you carry the policy; they often provide breach-response help.
5. Document everything from minute one — the audit tables and a written timeline.

## After any incident

A short written post-mortem: what happened, what you did, what prevents a repeat. If it reveals a gap, update the relevant playbook — the collection gets smarter each time, same as the rest of the second brain.

## Cross-references
- [Playbook 05 — Kids' Privacy / COPPA](05-kids-privacy-coppa.md) — data-incident obligations
- [Playbook 07 — Security & Backups](07-security-backups.md) — recovery + disaster prep
- [Playbook 10 — Insurance & Risk](10-insurance-risk.md) — cyber breach-response coverage
- [Playbook 11 — Vendor & Subscription Ledger](11-vendor-ledger.md) — the account list you start from
