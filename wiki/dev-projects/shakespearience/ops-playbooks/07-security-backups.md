# Playbook 07 — Security Hygiene & Backups

*The unglamorous discipline that means a lost laptop, a bad actor, or a dumb mistake is an inconvenience instead of a catastrophe. Small habits, run consistently, beat any one-time heroics.*

**Audience:** Gabriel (Stephanie for the shared parts).
**Last updated:** 2026-07-13

---

## Part A — Access hygiene (ongoing)

The foundation is Playbook 01; this keeps it honest over time.

- **Everything in the vault, nothing outside it.** No passwords in browsers, notes apps, texts, or sticky notes. If it's not in the shared vault, it doesn't exist.
- **Hardware keys on the four root accounts** (registrar, email, password manager, bank); TOTP-in-vault everywhere else; SMS 2FA nowhere.
- **Least privilege.** Invite people to the minimum role they need (Stephanie as team/editor, not admin, unless she needs it). Remove access the day someone stops needing it.
- **Recovery codes saved** for every account at 2FA setup — this is what saves you when a device dies.

## Part B — The monthly 15-minute check

Same cadence as Playbook 01, expanded:

1. Vendor Ledger current — every live service has a row, a cost, and recovery codes marked saved.
2. Skim `security@` for DMARC failures and unrecognized login alerts.
3. No credentials living outside the vault.
4. Nothing still on personal email or SMS 2FA.
5. Upcoming annual renewals noted so nothing auto-charges by surprise.
6. Confirm last month's backups actually ran (Part C).

## Part C — Backups (what would hurt to lose)

Three things carry the business; each needs a real backup, not a hope.

- **The database (Supabase).** Members, subscriptions, licenses, entitlements. Supabase Pro includes automated daily backups + point-in-time recovery — enable it before real member data exists. Additionally export a periodic dump to Cloudflare R2 (or Drive) so a backup exists outside the provider.
- **Content & masters (Cloudflare R2 + Google Drive).** Audio masters and Season Kit PDFs. Masters already archive to Drive per the production workflow; confirm R2 buckets have lifecycle rules and that `/masters/` is never the only copy.
- **The codebase (GitHub).** The Shakespearience-Platform repo is the source of truth for the whole build. Confirm it's pushed to a private GitHub remote (not just local on `/Volumes/Ready500`), so a drive failure never costs the platform.

**The rule that makes backups real:** a backup you've never restored is a guess. Once, do a test restore — pull a Supabase backup into a scratch project and confirm it opens. Then you actually have backups.

## Part D — Disaster recovery (write it down once)

A one-page "if X, then Y" so panic doesn't drive decisions:

- **Lost/stolen laptop** → change the vault master password from another device, confirm the four root accounts still require the hardware key, remote-wipe via Find My.
- **A service goes down** → where the status page is, whether it blocks payments or just delivery, and the manual workaround.
- **Suspected breach** → rotate keys from the vault, force-logout via Clerk, check Stripe for unfamiliar activity, note the kids'-data obligations from Playbook 05.
- Keep this in the vault and in Playbook 12 (Incident Response) so both founders can find it.

## Cross-references
- [Playbook 01 — Accounts & Access](01-accounts-and-access.md) — the access foundation
- [Playbook 05 — Kids' Privacy / COPPA](05-kids-privacy-coppa.md) — breach obligations for children's data
- [Playbook 12 — Incident Response](12-incident-response.md) — the escalation companion
- [Shakespearience Architecture](../architecture.md) — Supabase, R2, and the repo this protects
