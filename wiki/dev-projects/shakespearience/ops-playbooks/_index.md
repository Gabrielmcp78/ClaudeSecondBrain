# Shakespearience — Ops Playbooks

*A growing collection of plain-English "get-this-right-once" guides for running the business. Written for Gabriel and Stephanie, not for engineers. Each playbook covers one front of standing the company up correctly, in the order you'd actually do it.*

**How to use this:** Pick the playbook for the thing you're about to set up. Follow it top to bottom. When something changes or you learn a better way, tell Claude and the playbook gets updated — this collection is meant to compound.

**Status legend:** ✅ ready · ✍️ drafting · 🕓 planned

---

## The collection

| # | Playbook | Front it covers | Status |
|---|----------|-----------------|--------|
| 01 | [Accounts & Access](01-accounts-and-access.md) | Registering every tech service safely, passwords, 2FA, who owns what | ✅ ready |
| 02 | [Legal Foundation](02-legal-foundation.md) | LLC formation, EIN, operating agreement, founder split with Present Company | ✅ ready |
| 03 | [Business Banking & Bookkeeping](03-banking-bookkeeping.md) | Business bank, virtual cards, bookkeeping, sales-tax posture | ✅ ready |
| 04 | [Domain, DNS & Email Deliverability](04-domain-dns-email.md) | The exact Cloudflare records; MX vs. Resend/ConvertKit; SPF/DKIM/DMARC | ✅ ready |
| 05 | [Kids' Privacy & Compliance (COPPA / FERPA)](05-kids-privacy-coppa.md) | Legally required for a children's product with school/student accounts | ✅ ready |
| 06 | [Payments & Tax (Stripe)](06-payments-tax.md) | Products, tax collection, invoicing, refunds, chargebacks | ✅ ready |
| 07 | [Security Hygiene & Backups](07-security-backups.md) | Password-manager discipline, recovery codes, data backup, disaster recovery | ✅ ready |
| 08 | [Contracts & People](08-contracts-people.md) | Actor agreements, contractor/1099, revenue-share terms, IP assignment | ✅ ready |
| 09 | [Brand & Trademark](09-brand-trademark.md) | Name/logo protection, domain defense, usage standards | ✅ ready |
| 10 | [Insurance & Risk](10-insurance-risk.md) | General liability, E&O, what a family-media company actually needs | ✅ ready |
| 11 | [Vendor & Subscription Ledger](11-vendor-ledger.md) | One living record of every account, cost, owner, and renewal date | ✅ ready |
| 12 | [Incident Response](12-incident-response.md) | What to do the day a payment fails at scale, a service goes down, or a login is lost | ✅ ready |
| — | [Ops Operating Costs](ops-operating-costs.md) | Companion cost record: what the playbooks imply that the Tech Budget tabs don't already carry | ✅ ready |

---

## Locked decisions

**Master domain: `shakespearienceworld.com`, registered at Cloudflare Registrar** (2026-07-14, Gabriel; confirmed accurate 2026-07-22). Registrar + DNS + CDN + WAF + R2 all consolidate on Cloudflare at wholesale domain pricing; hosting stays on Vercel. `shakespearience.com` at GoDaddy is demoted to a defensive registration with a 301 redirect — it carries no mail and no DNS authority. Consequence: Cloudflare becomes the hardest root account in the company (both YubiKeys, printed recovery codes, registrar lock ON). See Playbook 04, Step 1.

**Password manager: Bitwarden, not 1Password** (updated 2026-07-22, Gabriel). Cheaper, open-source, same shared-vault/TOTP/Emergency Sheet workflow. See Playbook 01, Step 1.

**Email host: Google Workspace, not Fastmail** (updated 2026-07-22, Gabriel). Consolidates mail with the Drive structure the company already runs on (folder structure locked 2026-07-23, numbered 00–10 mirroring the Trello board's lists). See Playbook 04.

**Two dependency chains, not one.** The identity chain (password manager → Workspace email → Cloudflare → DNS → services) is gated by nothing and starts today. The money chain (LLC + EIN → bank → Stripe) is gated by paperwork. Do not stall DNS behind entity formation. See Playbook 01, Step 0.

**Sanity CMS and Plausible are both cut from the stack** (2026-07-22, Gabriel). Editorial content lives in Supabase's `episodes` table via the in-house Admin Control Panel; analytics runs on the already-paid-for Cloudflare Web Analytics instead of a second vendor. See Playbook 01, Tier 5, and [Shakespearience Architecture](../architecture.md).

---

## Priority flag

**Playbook 05 (Kids' Privacy) is not optional.** The Shakespearience serves children and provisions student accounts under school licenses, which pulls it into COPPA (and FERPA for the school side). This is the single front most likely to cause real trouble if skipped, and it shapes decisions in Accounts, Payments, and Analytics. Recommend building it right after the Legal Foundation.

## Cross-references
- [Shakespearience Architecture](../architecture.md) — the platform these playbooks operationalize
- [Code Development Best Practices](../../../dev-infrastructure/code-best-practices.md) — the technical standard the codebase was built against
- Source recommendations: `outputs/2026-07-13_shakespearience-account-and-email-strategy.md`
