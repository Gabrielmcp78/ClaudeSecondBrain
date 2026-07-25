# Playbook 04 — Domain, DNS & Email Deliverability

*Getting the domain, mailboxes, and DNS records right so your real email lands, your automated member email lands, and the two never sabotage each other. This is the single most common place a young company quietly breaks its own email.*

**Audience:** Gabriel (Stephanie for context).
**Last updated:** 2026-07-24 (Claude, synced against live Trello — rewritten for Google Workspace; supersedes the 2026-07-14 Fastmail version)
**Master domain:** `shakespearienceworld.com` — registered at **Cloudflare Registrar**. Confirmed correct 2026-07-22: purchased directly through Cloudflare Registrar as originally decided, Gabriel has admin access. This is the canonical domain for the site, all mailboxes, and all email authentication.
**Golden rule:** receiving mail and sending bulk mail are different jobs on the same domain. Keep them cleanly separated.

---

## The three roles on one domain

1. **Receiving + your team's mailboxes** → the email host, **Google Workspace** (changed 2026-07-22 from Fastmail — see rationale below). Owns MX.
2. **Transactional sending** (receipts, kit delivery, notifications) → Resend.
3. **Marketing sending** (newsletters, drips) → ConvertKit.

All three authenticate against `shakespearienceworld.com`, so their DNS records must coexist under one SPF and one DMARC policy.

## Why Google Workspace, not Fastmail

**Decision (updated 2026-07-22, Gabriel).** The company already runs on Google Drive for raw recordings, masters, and planning docs (Big Biz Picture → Google Drive card, folder structure locked 2026-07-23: numbered folders 00–10 mirroring the Trello board's own list structure, with Content Manager-level shared-drive access for both founders and private per-item folders for each). Fastmail would have added a second identity system running alongside Drive with no shared login; Workspace consolidates mail + Drive + Docs + Calendar + Meet under one company-owned login per person, which also resolves the "Drive files live under someone's personal Gmail" ownership gap that existed before the Drive structure was formalized.

Cost is modestly higher per seat — roughly $7–9/mo Business Starter, $14–18/mo Business Standard for more Drive storage, eSignature, and full Gemini — versus Fastmail's $6/user/mo. Accepted for the consolidation. Start on Business Starter; upgrade to Standard later only if raw-audio storage volume actually needs the larger tier. No migration pain either way since both live on the same domain and admin console.

## Step 1 — Register `shakespearienceworld.com` at Cloudflare Registrar

**Decision (2026-07-14, Gabriel; confirmed accurate 2026-07-22):** the master domain is `shakespearienceworld.com`, registered directly at **Cloudflare Registrar**. Registrar and DNS live in one place; hosting stays separate.

Why Cloudflare Registrar:
- **At-cost pricing, permanently.** Cloudflare sells domains at wholesale with zero markup — roughly $10–11/yr for a `.com`, at renewal as well as first year. No teaser rate that triples in year two.
- **WHOIS privacy included free.** Most registrars upsell this.
- **Registrar and DNS unify.** Cloudflare Registrar requires the zone to sit on a Cloudflare account, which is exactly where it belongs anyway — DNS, CDN, WAF, SSL, and R2 storage are already Cloudflare.
- **No transfer choreography.** Registering fresh skips the 60-day transfer lock, auth codes, and unlock dance entirely.

Registrar ≠ hosting. Three separate jobs, deliberately:
- **Registrar + DNS + CDN + SSL:** Cloudflare.
- **Hosting:** Vercel. Next.js edge deploys, preview environments, GitHub auto-deploy — this is why Vercel is in the stack and it does not move.
- **File storage:** Cloudflare R2 (same account as DNS).

**The concentration tradeoff — read this once and act on it.** Cloudflare now holds the domain, DNS, CDN, WAF, and R2. Losing that one account loses all five simultaneously, and DNS control means an attacker can re-point MX and intercept every password-reset email you own. This makes Cloudflare the single hardest root account in the company: **both YubiKeys registered, recovery codes printed and stored physically, registrar lock ON, auto-renew ON.** Non-negotiable (Playbook 01, Step 4).

At signup: turn on **domain lock** and **auto-renew** immediately, before adding any DNS records.

**Only open item as of 2026-07-22:** the Cloudflare account's owner-login email is still Stephanie's personal address, not a role address. Rotate this per Playbook 01, Step 0.5 — same tier of concern as any other owner-email rotation, not a migration.

### Legacy: `shakespearience.com` at GoDaddy

If `shakespearience.com` is still held at GoDaddy, keep it as a **defensive registration** and 301-redirect it to `shakespearienceworld.com` (Cloudflare Redirect Rules handle this free once the zone is added). Do not run mail, DNS records, or email authentication from it — one domain owns SPF/DKIM/DMARC, and that domain is `shakespearienceworld.com`. **Never use GoDaddy web hosting or Website Builder.**

Every record below goes in Cloudflare — nowhere else — so nothing gets split across two DNS providers.

## Step 2 — Mailboxes (Google Workspace)

1. Start the Workspace signup with a placeholder personal address.
2. At the domain-verification step, attach `shakespearienceworld.com` as "a domain you already own" (it's already registered — this is verification, not a purchase).
3. Add Google's verification TXT record in Cloudflare.
4. In the Workspace admin console, create real mailboxes for `gabriel@` and `stephanie@`.
5. Create the role addresses as **free Google Groups** routing to a shared inbox: `ops@`, `admin@`, `billing@`, `support@`, `security@`, `dns@`.

The Workspace admin console shows the exact MX and DKIM values during setup — use those, not generic ones.

## Step 3 — DNS records (add in Cloudflare)

Exact hostnames come from each provider's dashboard; the shape is:

**MX (receiving — Google Workspace):**
```
@   MX   1    ASPMX.L.GOOGLE.COM
@   MX   5    ALT1.ASPMX.L.GOOGLE.COM
@   MX   5    ALT2.ASPMX.L.GOOGLE.COM
@   MX   10   ALT3.ASPMX.L.GOOGLE.COM
@   MX   10   ALT4.ASPMX.L.GOOGLE.COM
```
*(Confirm exact priorities/hosts in the Workspace admin console during setup — they're standard but should be copied from the live dashboard, not assumed.)*

**SPF — ONE record only for the whole domain.** Merge every sender into a single line. Do not create two SPF records; that breaks SPF entirely.
```
@   TXT   "v=spf1 include:_spf.google.com include:_spf.resend.com include:_spf.convertkit.com ~all"
```

**DKIM — each service gives its own CNAME/TXT record(s); add all of them:**
```
google._domainkey   TXT     (value generated in the Workspace admin console)
resend._domainkey   CNAME/TXT   (value from Resend dashboard)
convertkit / k1._domainkey   CNAME   (value from ConvertKit dashboard)
```

**DMARC — one policy for the domain.** Start at `p=none` to monitor, then tighten to `quarantine` once reports look clean. Never start at `reject`.
```
_dmarc   TXT   "v=DMARC1; p=none; rua=mailto:security@shakespearienceworld.com; fo=1"
```

## Step 4 — Send bulk mail from a subdomain

Point Resend/ConvertKit sending at a **subdomain** — `send.shakespearienceworld.com` (or `mail.`) — and verify DKIM there. This isolates bulk-sending reputation from the root domain your real mailboxes use. If a big campaign ever trips spam filters, your `gabriel@` and `support@` mail stays unaffected.

## Step 5 — Verify before you rely on it

- Send a test from Resend and from ConvertKit; confirm SPF=pass, DKIM=pass, DMARC=pass in the receiving headers (Gmail "show original" or mail-tester.com).
- Watch the DMARC `rua` reports arriving at `security@` for a couple of weeks before moving `p=none` → `p=quarantine`.
- Only then wire the live member flows.

## Common ways this breaks (avoid)
- Two SPF records on the root — SPF silently fails; add one merged record.
- Forgetting a service's DKIM — that sender lands in spam.
- Sending bulk from the root domain — one bad campaign taints your real mail.
- Setting DMARC to `reject` on day one before confirming every sender passes — legitimate mail vanishes.

## Cross-references
- [Playbook 01 — Accounts & Access](01-accounts-and-access.md) — the accounts these records serve, including the Bitwarden/Workspace bootstrap order
- [Shakespearience Architecture](../architecture.md) — Resend/ConvertKit/Transistor sending model
- Source: live Trello board "Shakespearience" → Ops & Setup → "Domain, DNS & Email" card, synced 2026-07-24; original recommendation in `outputs/2026-07-13_shakespearience-account-and-email-strategy.md`
