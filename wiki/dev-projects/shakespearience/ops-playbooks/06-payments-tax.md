# Playbook 06 — Payments & Tax (Stripe)

*Turning on the revenue engine: products, subscriptions, school invoicing, sales tax, and the failure paths (refunds, disputes, dunning) — wired so money moves cleanly and the books stay honest.*

**Audience:** Gabriel.
**Last updated:** 2026-07-13
**Prerequisites:** LLC + EIN (Playbook 02), business bank (Playbook 03). Stripe pays out to the business account and reports under the EIN.

---

## Step 1 — Account + identity

Create the Stripe account under `billing@`, in the company legal name, with the EIN and business bank on file. This is a Tier-2 money account: 2FA on, credentials in the vault. Connect the payout bank first so revenue has somewhere to land.

## Step 2 — Products & prices (from the architecture)

Recreate the five products exactly as specced on the Trello "Payment & Subscription Engine" card:

- **Individual** — $9.99/mo or $89/yr (1 age tier)
- **Family** — $19.99/mo or $169/yr (all 3 tiers, 2 accounts)
- **School Basic** — $249/yr, 15 seats
- **School Standard** — $349/yr, 30 seats
- **School Premium** — $499/yr, 50 seats (+$8/seat add-on)

Use Stripe **Subscriptions** for individual/family (monthly + annual prices, optional 7-day trial, proration on upgrades) and **Invoicing** for schools (NET-30 terms, auto-generated PDF).

## Step 3 — Sales tax: turn on Stripe Tax

Enable **Stripe Tax** so tax is calculated at checkout, collected, and reported automatically. Digital memberships and curriculum are taxable in many states and the rules differ everywhere — this is the feature that keeps you from tracking it by hand. Stripe monitors where you cross an economic-nexus threshold and flags when you owe registration in a new state. Have your CPA confirm registrations as you scale (ties to Playbook 03, Step 4).

## Step 4 — Webhooks are the source of truth

The platform already handles the right events — verify each fires end to end against the live account before launch:

- `customer.subscription.created` → provision access + entitlements
- `customer.subscription.updated` → handle upgrade/downgrade/status
- `customer.subscription.deleted` → revoke access, run cancellation flow
- `invoice.paid` → confirm payment, trigger Season Kit delivery (school provisioning)
- `invoice.payment_failed` → start the dunning sequence

The `webhook_events` table in the schema is the idempotency log — confirm duplicate webhooks can't double-provision.

## Step 5 — Customer Portal + refunds

Turn on the Stripe **Customer Portal** so members self-serve cancellations, plan changes, and payment-method updates — that alone kills most support email. Write a short, plain refund policy (e.g. prorated or first-30-days) and apply it consistently from the admin panel.

## Step 6 — Dunning (failed payments) and disputes

- **Dunning:** the n8n sequence (Day 1 soft / Day 4 urgent / Day 7 warning / Day 10 suspend) recovers most failed cards. Enable Stripe Smart Retries alongside it.
- **Disputes/chargebacks:** rare for a trust-based family brand, but have a habit — respond to every dispute in the Stripe dashboard with the subscription record and access logs as evidence. The `downloads`/audit tables are your paper trail.

## Step 7 — Parental consent tie-in

The card transaction by the parent is a recognized COPPA verifiable-consent mechanism (see Playbook 05). Keep checkout structured so the adult is unambiguously the account holder and payer.

## Cross-references
- [Playbook 03 — Banking & Bookkeeping](03-banking-bookkeeping.md)
- [Playbook 05 — Kids' Privacy / COPPA](05-kids-privacy-coppa.md) — payment as consent
- [Shakespearience Architecture](../architecture.md) — products, webhook design, dunning workflow
