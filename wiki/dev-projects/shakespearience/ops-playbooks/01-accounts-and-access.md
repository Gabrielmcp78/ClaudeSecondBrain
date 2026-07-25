# Playbook 01 — Accounts & Access

*How to register every tech service so the business owns it, nobody gets locked out, and a lost phone or a departing person never becomes a crisis. Follow this before creating a single account.*

**Audience:** Gabriel and Stephanie. No coding required.
**Last updated:** 2026-07-24 (Claude, synced against live Trello Ops & Setup card state — supersedes the 2026-07-14 version's 1Password/Fastmail recommendations)
**Master domain:** `shakespearienceworld.com`, registered at Cloudflare Registrar (see Playbook 04). Every role address below lives on this domain.

---

## The five golden rules

1. **The company owns every account, not a person.** Register under a company address (`ops@shakespearienceworld.com`), never a personal Gmail or `mac.com`, never one founder's name.
2. **One password manager holds everything.** Every login, key, and recovery code lives in one shared vault. If it isn't in the vault, it doesn't exist.
3. **Two-factor on everything, seeds stored in the vault.** No exceptions on money, email, or infrastructure.
4. **Protect the four root accounts hardest.** Registrar, email host, password manager, and bank can reset everything else — they get hardware keys.
5. **Write it down as you go.** Every account created gets a row in the Vendor Ledger (bottom of this file) the same minute you make it.

Break rule 1 or 2 even once and you inherit exactly the mess this playbook exists to prevent.

## Step 0 — What actually blocks what

Two separate dependency chains run in parallel. Conflating them stalls the infrastructure build for weeks behind paperwork that infrastructure does not need.

**The identity chain (start today — nothing gates it):**
password manager → Google Workspace → Cloudflare (registrar + DNS) → mail records → all Tier 3–5 services.

**The money chain (gated on paperwork):**
legal entity + EIN (Playbook 02) → business bank (Playbook 03) → Stripe (Playbook 06).

The **LLC and EIN gate the bank and Stripe only.** They do not gate Cloudflare, Google Workspace, the password manager, Vercel, Supabase, Clerk, or anything else that runs on a free tier or a personal card temporarily. Register the domain and stand up DNS while the entity paperwork is in flight — those weeks are free.

If the company may run under Present Company rather than as its own entity, settle that question before opening any financial account, since the bank and Stripe both bind to a legal name.

## Step 0.5 — The bootstrap paradox (read before creating account #1)

**Updated 2026-07-22 (Gabriel):** the provider choices below changed twice since this playbook was first written — **Bitwarden replaces 1Password**, and **Google Workspace replaces Fastmail** as the human-mailbox provider. Reasoning for Workspace: the company already runs on Google Drive for raw recordings, masters, and planning docs (see Big Biz Picture → Google Drive card, folder structure locked 2026-07-23). Fastmail would have added a second identity system alongside Drive; Workspace consolidates mail + Drive + Docs + Calendar + Meet under one company-owned login per person. Cost is modestly higher per seat (~$7–9/mo Business Starter vs. Fastmail's $6/user/mo) — accepted for the consolidation.

This playbook says register everything under `ops@shakespearienceworld.com`. That mailbox cannot exist until Google Workspace's MX records are live in Cloudflare — and the Cloudflare account itself needs an owner address. The chain has no first link.

**Resolution — do it in this exact order:**

1. **Start the Google Workspace signup** with a placeholder personal address, then attach `shakespearienceworld.com` as "a domain you already own" once you reach the domain-verification step. (The domain itself is already registered and on Cloudflare — confirmed 2026-07-22 — so this step is verification, not a fresh purchase.)
2. **Create Bitwarden** — the account was actually created 2026-07-21 under Gabriel's personal Gmail, before the bootstrap address existed. Once Workspace is live, change the account email to the real Workspace address (Settings → Change Email, no data loss). Set up one shared collection **"Shakespearience — Company"** and invite Stephanie. Turn on Bitwarden's built-in TOTP/authenticator storage. Export and print the Emergency Sheet / recovery code.
3. **Add DNS records directly in Cloudflare** (no transfer, no double-work) — Google's verification TXT, MX, SPF, DKIM, DMARC (Playbook 04).
4. **Verify the domain and create users** in the Google Workspace admin console: `gabriel@`, `stephanie@`, and role aliases as free Groups — `ops@ / admin@ / billing@ / support@ / security@ / dns@`.
5. **Rotate.** Move the Cloudflare account-owner login off Stephanie's personal email onto a role address, and move Bitwarden/Workspace owner emails onto their final form.

Everything created from step 5 forward goes straight in under its role address, exactly as the tables below specify. Only the first few accounts ever touch a bootstrap identity, and none of them keep it.

## Step 1 — Password manager (do this first, literally)

**Decision (updated 2026-07-22, Gabriel): Bitwarden, not 1Password.** Cheaper, open-source, and the shared-vault/TOTP/Emergency Sheet workflow below covers everything 1Password would have.

Setup:
- Create the account under the bootstrap address (Step 0.5), then rotate the owner email to `ops@shakespearienceworld.com` once Workspace mail is live.
- Make one shared collection named **"Shakespearience — Company."**
- Invite Stephanie as a member of that collection.
- Turn on Bitwarden's built-in TOTP/authenticator storage — you'll paste each service's 2FA seed here as you go, so codes live beside the login.
- Export and print the **Emergency Sheet / recovery code** and store it physically — Bitwarden's equivalent of the 1Password Emergency Kit. This is the one credential that can't live inside itself.

## Step 2 — Email host + role addresses

**Decision (updated 2026-07-22, Gabriel): Google Workspace, not Fastmail.** Set up Workspace (Business Starter to begin — upgrade to Business Standard later only if raw-audio storage volume actually needs the larger Drive tier; no migration pain either way), verify `shakespearienceworld.com`, then create real mailboxes for `gabriel@` and `stephanie@`, plus these **role addresses as free Google Groups**:

- `ops@` / `admin@` — the login identity for infrastructure accounts
- `billing@` — Stripe, hosting invoices, renewals
- `support@` — member-facing
- `security@` — DMARC reports, abuse, breach notices
- `dns@` — registrar and DNS alerts

Every service below gets registered under the role address that matches its job — so support tickets, invoices, and security alerts self-sort from day one.

## Step 3 — Build the accounts top-down

Create in this order. Each tier depends on the one above it existing first. Fill the 2FA method from the policy in Step 4. **As of 2026-07-16 this checklist stood at 0/16 complete** — external-account creation itself had not yet started, per the "Accounts & Access" Ops & Setup card's own delivery-state note.

### Tier 1 — Root of trust (hardware key required)
| Service | Register under | Owner | Notes |
|---|---|---|---|
| **Cloudflare** (Registrar + DNS + CDN + WAF + R2) | `dns@` | Gabriel | **Hardest account in the company.** Registrar, DNS, and file storage in one place — one compromise loses all of them, and DNS control means intercepting every password-reset email you own. Both YubiKeys. Lock + auto-renew ON. **Confirmed 2026-07-22:** domain purchased directly through Cloudflare Registrar as planned; Gabriel has admin access. Remaining gap: account owner-login email is still Stephanie's personal address — rotate per Step 0.5. |
| Google Workspace | `ops@` | Gabriel | Admin console owns all mailboxes, Drive, Docs, Calendar, Meet; also resolves the "Drive files live under someone's personal Gmail" ownership gap |
| Bitwarden | `ops@` | Gabriel + Steph | Already done in Step 1 |
| Business bank (e.g. Mercury) | `billing@` | Gabriel | Needs EIN first; issues virtual cards |

### Tier 2 — Money
| Service | Register under | Owner | Notes |
|---|---|---|---|
| Stripe | `billing@` | Gabriel | Company legal name; connect to bank |

### Tier 3 — Infrastructure
| Service | Register under | Owner | Notes |
|---|---|---|---|
| Vercel | `ops@` | Gabriel | Create a Team, not a personal project |
| Supabase | `ops@` | Gabriel | Also the sole editorial content store as of 2026-07-22 — see Sanity note below |
| Cloudflare R2 | `ops@` | Gabriel | Same Cloudflare account as DNS |
| Clerk | `ops@` | Gabriel | Sole auth system — no Supabase Auth wiring anywhere (clarified 2026-07-22) |

### Tier 4 — Communications
| Service | Register under | Owner | Notes |
|---|---|---|---|
| Resend | `ops@` | Gabriel | Verify a sending subdomain, not root |
| ConvertKit | `ops@` | Steph (content) | Steph runs marketing sends |
| Transistor.fm | `ops@` | Gabriel | Three-feed podcast setup |

### Tier 5 — Operations
| Service | Register under | Owner | Notes |
|---|---|---|---|
| Hetzner (n8n host) | `ops@` | Gabriel | |
| Printful | `ops@` | Gabriel | Merch fulfillment |

**Cut from this tier (2026-07-22 decisions — do not create these accounts):**
- ~~Sanity CMS~~ — cut. Editorial content (episode/season/script metadata, publish state) lives directly in the Supabase `episodes` table, authored through the in-house Admin Control Panel's Content Scheduling section. No second CMS, no `sanity_id` sync logic.
- ~~Plausible~~ — cut. Cloudflare Web Analytics is free and already bundled with the Cloudflare account this stack pays for regardless. Custom event tracking (subscriptions, downloads, checkouts) logs to Supabase and surfaces in the Admin Control Panel instead of a dedicated analytics tool. A Year 2 PostHog option is parked for when richer funnel analysis is actually needed.

## Step 4 — Two-factor policy

- **Tier 1 (registrar, email, password manager, bank):** hardware security keys. Buy **two YubiKeys**, register both on each account, keep the spare in a separate physical location. Losing one never locks you out.
- **Tiers 2–5:** TOTP codes generated inside the password manager. When a service shows a QR code during 2FA setup, also click "enter key manually" and paste that secret into the password manager's 2FA field.
- **Never** use SMS text-message 2FA where an app or key is offered — SIM-swap is the exact attack it invites.
- Every service issues **backup/recovery codes** at 2FA setup. Paste them into that service's vault entry immediately. This is what saves you when a device dies.

## Step 5 — Continuity (the "someone leaves" plan)

- Because two founders share this, every Tier-1 account has **both** as recoverable owners (shared vault + both YubiKeys registered).
- Where a service supports team roles (Stripe, Vercel, Clerk, Trello, ConvertKit), invite the human as a **member of the company-owned org** rather than logging in as them. Removing a person then never touches the account itself.
- The bank and registrar are the two that can't be "shared" casually — document in Playbook 02 who has legal signing authority.

## Step 6 — 15-minute monthly hygiene check

Once a month, together or solo:
1. Open the Vendor Ledger; confirm every live service has a row and a current cost.
2. Skim `security@` for DMARC failures or login alerts you don't recognize.
3. Confirm no credential is sitting outside the password manager (no sticky notes, no browser-saved passwords).
4. Check for any service still on personal-email or SMS-2FA and fix it.
5. Note upcoming annual renewals so nothing auto-charges by surprise.

---

## Vendor Ledger (keep this current — becomes Playbook 11)

Copy this table and fill a row the moment any account is created.

| Service | Registered under | Owner | 2FA method | Plan / cost | Billing card | Renews | Recovery codes saved? |
|---|---|---|---|---|---|---|---|
| Cloudflare (Registrar + DNS + R2) | dns@ | Gabriel | YubiKey ×2 | domain ~$10-11/yr at-cost; DNS/CDN free | | | |
| Google Workspace | ops@ | Gabriel | YubiKey | ~$7-9/mo Business Starter (per seat) | | | |
| Bitwarden | ops@ | Gabriel+Steph | YubiKey | free/low-cost org plan | | | |
| Mercury | billing@ | Gabriel | YubiKey | free | — | | |
| Stripe | billing@ | Gabriel | TOTP | usage | | | |
| Vercel | ops@ | Gabriel | TOTP | $20/mo | | | |
| Supabase | ops@ | Gabriel | TOTP | $0→$25/mo | | | |
| Clerk | ops@ | Gabriel | TOTP | free→usage | | | |
| Resend | ops@ | Gabriel | TOTP | free→$20/mo | | | |
| ConvertKit | ops@ | Steph | TOTP | free→$29/mo | | | |
| Transistor | ops@ | Gabriel | TOTP | $49/mo | | | |
| Hetzner | ops@ | Gabriel | TOTP | ~$5/mo | | | |
| Printful | ops@ | Gabriel | TOTP | per-order | | | |

*Sanity and Plausible rows removed 2026-07-24 — both cut from the stack 2026-07-22 (see Tier 5 note above). Costs above are the current-plan figures from the tech budget; confirm at signup.*

## Cross-references
- [Playbook 04 — Domain, DNS & Email](04-domain-dns-email.md) — the Google Workspace + Cloudflare DNS setup this playbook depends on
- [Shakespearience Architecture](../architecture.md) — the full Tech Guts stack, including the Sanity-cut and Plausible-cut decisions in context
- Source: live Trello board "Shakespearience" → Ops & Setup list, synced 2026-07-24
