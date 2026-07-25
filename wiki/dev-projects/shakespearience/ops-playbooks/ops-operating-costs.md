# Ops Operating Costs (companion to the budget sheet)

*Costs the Ops Playbooks imply that are NOT already in the Tech Budget tabs. Durable record; the spreadsheet tab `Shakespearience_Ops_Operating_Costs.xlsx` mirrors this. Prices web-verified 2026-07-13; ranges are DIY (low) → professional/attorney (high).*

## Recurring (monthly → annual)

| Item | Monthly Low | Monthly High | Annual Low | Annual High | Playbook |
|---|--:|--:|--:|--:|---|
| Business email (Fastmail Business Std, 2 users) | $12.00 | $12.00 | $144 | $144 | 01, 04 |
| Password manager (1Password Business, 2 users) | $17.98 | $17.98 | $216 | $216 | 01, 07 |
| Domain renewal (`shakespearienceworld.com`, Cloudflare Registrar at-cost) | $0.88 | $0.92 | $10 | $11 | 04 |
| Registered agent service | $10.42 | $10.42 | $125 | $125 | 02 |
| Business insurance (general liability; +E&O more) | $45.00 | $123.00 | $540 | $1,476 | 10 |
| Privacy/compliance tooling (Termly Pro+) | $0.00 | $15.00 | $0 | $180 | 05 |
| Bookkeeping (Wave free / QuickBooks) | $0.00 | $30.00 | $0 | $360 | 03 |
| CPA / tax prep (annualized) | $41.67 | $125.00 | $500 | $1,500 | 03 |
| **Recurring subtotal** | **$127.95** | **$334.32** | **$1,535** | **$4,012** | |

## One-time / startup

| Item | Low | High | Playbook |
|---|--:|--:|---|
| LLC formation (TX SOS, Form 205) | $300 | $300 | 02 |
| Hardware security keys (2 × YubiKey 5C NFC) | $116 | $116 | 01, 07 |
| Trademark filing (USPTO, $350/class, 1–2 classes) | $350 | $700 | 09 |
| Trademark attorney (optional) | $0 | $1,500 | 09 |
| Operating agreement (template vs. attorney) | $0 | $1,000 | 02 |
| Privacy policy + Terms (generator vs. attorney) | $0 | $3,000 | 05 |
| **One-time subtotal** | **$766** | **$6,616** | |

## Variable (scale with revenue — not summed)

- **Stripe processing:** 2.9% + $0.30 / transaction (already in architecture).
- **Stripe Tax:** 0.5% of taxable volume (or $0.50/transaction via API).
- **Printful:** per-order cost of goods (only if merch launches).
- **Trademark maintenance:** renewal fees years 5–6 and 9–10.

## Excluded (already in the Tech Budget tabs)
Vercel, Supabase, Clerk, Cloudflare R2, Resend, ConvertKit, Transistor, Sanity, n8n/Hetzner, Plausible.

## Read
- **Lean path** (DIY legal docs + Termly, 1 trademark class, GL insurance only): roughly the LOW columns — about **$129/mo + ~$766 one-time**.
- **Buttoned-up path** (attorney on entity/privacy/trademark, fuller insurance): toward the HIGH columns — about **$335/mo + ~$6,600 one-time**.
- The legal/compliance one-time spend is the swing factor; everything recurring is modest.

*Price sources: fastmail.com/pricing · 1password.com/pricing · uspto.gov fee schedule 2026 · stripe.com/tax/pricing · Northwest/Harbor (registered agent) · Insureon/MoneyGeek 2026 (GL insurance) · termly.io/pricing · yubico.com.*
