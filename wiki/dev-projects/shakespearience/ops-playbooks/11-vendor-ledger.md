# Playbook 11 — Vendor & Subscription Ledger

*One living record of every account the business runs on — what it is, who owns it, what it costs, when it renews, and whether you could recover it. The single document that turns "wait, what do we even pay for?" into a five-second lookup.*

**Audience:** Gabriel (keeper); Stephanie has visibility.
**Last updated:** 2026-07-13

---

## Why a ledger, not a memory

Fifteen tech services, plus email, banking, insurance, and legal renewals — no one holds that in their head. The ledger prevents the three classic failures: a surprise auto-charge on a card you forgot, a lapsed renewal that locks you out mid-launch, and an account nobody can recover because the recovery codes were never saved. It's also the fastest way to spot-cut cost when you review it.

## Where it lives

Keep the authoritative copy in the **shared password manager** (as a secure note or the built-in fields) so it sits beside the actual credentials, and mirror the cost columns in the **budget sheet** (the `Ops Operating Costs` tab + the Tech Budget tabs). The seed table is already in Playbook 01, Step "Vendor Ledger."

## Columns to keep

| Field | Why |
|---|---|
| Service | What it is |
| Registered under | Which role address owns the login (`ops@`, `billing@`, …) |
| Owner | Human accountable |
| 2FA method | YubiKey / TOTP-in-vault — confirms it's protected |
| Plan / cost | Current tier and price |
| Billing card | Which virtual card (maps 1 card → 1 vendor) |
| Renews | Date + monthly/annual, so nothing surprises you |
| Recovery codes saved? | The column that saves you when a device dies |
| Notes | Cancellation terms, seat count, dependencies |

## The cadence

Fold the review into the **monthly 15-minute hygiene check** (Playbook 07): every live service has a row, costs are current, renewals in the next 60 days are noted, and any account still on personal email or SMS 2FA gets fixed. Add a row the moment any new account is created — never "later."

## What it feeds

- **Cost control** — a monthly glance at total spend vs. the budget catches creep.
- **Security** — the 2FA and recovery-codes columns are an at-a-glance audit.
- **Continuity** — if something happens to one founder, the other can see and reach every account.
- **Incident response** — Playbook 12 starts from this list.

## Cross-references
- [Playbook 01 — Accounts & Access](01-accounts-and-access.md) — the seed ledger table
- [Playbook 07 — Security & Backups](07-security-backups.md) — the monthly review that keeps it current
- [Ops Operating Costs](ops-operating-costs.md) + `Shakespearience_Ops_Operating_Costs.xlsx` — the cost side
