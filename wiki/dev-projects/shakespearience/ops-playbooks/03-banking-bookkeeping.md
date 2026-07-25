# Playbook 03 — Business Banking & Bookkeeping

*Keeping company money cleanly separate from personal money — the thing that protects the LLC's liability shield, makes taxes painless, and lets you kill any subscription in one click.*

**Audience:** Gabriel (Stephanie for shared visibility).
**Last updated:** 2026-07-13
**Prerequisite:** the LLC and EIN from Playbook 02. Do not open business accounts under a personal SSN.

---

## Why this matters beyond convenience

The moment you mix personal and business spending, you weaken the "corporate veil" the LLC exists to give you — a court can argue the company isn't really separate from you personally. One dedicated business account, used for everything company-related, is what keeps that protection real. It also turns tax season from archaeology into a download.

## Step 1 — Business checking

Open a business checking account under `billing@shakespearience.com` once the EIN exists.

- **Recommended: a startup-focused digital bank (e.g. Mercury).** No monthly fee, clean API/dashboard, and — the key feature — **virtual cards you can issue per vendor.** Give each subscription its own virtual card so you can cancel or cap one without touching the other fourteen.
- **Traditional alternative:** a local business account (e.g. a Texas credit union or a national bank) if you want in-person banking or cash handling. Fine, just confirm no/low monthly fee and that it issues a debit card you can use online.
- Fund it, order the card, and store the login + 2FA in the vault (this is a Tier-1 root account — hardware key).

## Step 2 — Card strategy

- One primary business card on file, then **per-vendor virtual cards** where the bank supports them.
- Put every recurring SaaS charge (the 15 services in Playbook 01) on virtual cards so the Vendor Ledger's "billing card" column maps one card → one service. A compromised or runaway charge is then a 10-second fix.
- Keep a small buffer in checking so an auto-renew never bounces and locks you out of a service.

## Step 3 — Bookkeeping

Pick one and use it from day one — reconstructing a year later is the expensive path.

- **Wave** — free, genuinely enough for early stage: income/expense tracking, receipts, simple reports.
- **QuickBooks** — paid, worth it once there's payroll, contractors at volume, or an accountant who wants it.
- Connect the business bank feed so transactions import automatically. Categorize monthly (fold it into the Playbook 01 hygiene check).

## Step 4 — Sales tax posture (know this early)

Digital products, memberships, and curriculum can be taxable, and rules differ by state — this is exactly why **Stripe Tax** is in Playbook 06: let Stripe calculate, collect, and report sales tax automatically rather than tracking 50 states by hand. You establish "nexus" (a tax obligation) in states as sales grow; Stripe Tax flags when you cross a threshold. Confirm the specifics with a bookkeeper or CPA once revenue starts — do not guess.

## Step 5 — Separate what's what

- Startup costs vs. recurring per-season costs — the budget already distinguishes these; mirror that split in your bookkeeping categories so margins stay legible.
- Founder contributions or draws run through documented transfers, not casual Venmo — keep them on the books.

## Cross-references
- [Playbook 02 — Legal Foundation](02-legal-foundation.md) — the EIN this depends on
- [Playbook 06 — Payments & Tax](06-payments-tax.md) — Stripe Tax handles collection
- [Playbook 11 — Vendor & Subscription Ledger](11-vendor-ledger.md) — the card-per-vendor map
