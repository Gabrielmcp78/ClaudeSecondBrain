# Ops Sequencing — Cloudflare Signup & the Master Domain

*2026-07-14 · Session output · Claude*
*Drew from: `ops-playbooks/01-accounts-and-access.md`, `04-domain-dns-email.md`, `ops-operating-costs.md`, `_meta/decision-registry.md`, Shakespearience Trello (Ops & Setup, Big Biz Picture)*

---

## The decision

The master domain is **`shakespearienceworld.com`**, registered at **Cloudflare Registrar**.

Registrar, DNS, CDN, WAF, and R2 storage consolidate on one Cloudflare account. Hosting stays on Vercel. `shakespearience.com` at GoDaddy becomes a defensive registration with a 301 redirect and no authority over anything.

## Why registrar + DNS together is right, and registrar + hosting is not

Cloudflare Registrar sells at wholesale — roughly $10-11/yr for a `.com`, at renewal as much as at signup, with WHOIS privacy included rather than upsold. It requires the zone to sit on a Cloudflare account, which is exactly where DNS belongs given Cloudflare already supplies CDN, WAF, SSL, and R2. Registering fresh also skips the 60-day transfer lock, the auth code, and the unlock choreography entirely.

Hosting is a different job. Vercel exists in this stack for Next.js edge deploys, preview environments, and GitHub auto-deploy, and none of that moves. What consolidates is registrar + DNS + CDN — one job wearing three hats.

## The tradeoff, stated plainly

One Cloudflare account now holds the domain, DNS, CDN, WAF, and R2. A single compromise loses all five. Worse: DNS control means re-pointing MX and intercepting every password-reset email the company owns — which makes Cloudflare a lever on every *other* account in the stack, including the bank.

This is acceptable, and it comes with a price that is not optional. Cloudflare is now the hardest root account in the company:

- Both YubiKeys registered
- Recovery codes printed and stored physically
- Registrar lock ON, auto-renew ON, from the first minute

## The two chains

The original Playbook 01 implied one long sequence starting with the LLC. That would have parked the entire infrastructure build behind formation paperwork it does not need.

**Identity chain — gated by nothing, starts today:**
password manager → email host → Cloudflare (registrar + DNS) → mail records → Tier 3-5 services

**Money chain — gated by paperwork:**
legal entity + EIN → business bank (Mercury) → Stripe

The LLC and EIN gate the bank and Stripe. They gate nothing else.

## The bootstrap paradox, and its resolution

Playbook 01 said to register everything under `ops@shakespearienceworld.com`. That mailbox cannot exist until Fastmail's MX records are live in Cloudflare, and the Cloudflare account needs an owner address to be created at all. The chain had no first link.

The fix, in order:

1. **Buy Fastmail first** — it issues a working `@fastmail.com` address immediately, no custom domain needed. This is the bootstrap identity.
2. **1Password** under that address. Shared vault, TOTP generator on, Emergency Kit printed.
3. **Cloudflare** under that address. Register `shakespearienceworld.com`. Lock + auto-renew. Both YubiKeys.
4. **DNS records** per Playbook 04 — MX, one merged SPF line, DKIM for all three senders, DMARC at `p=none`.
5. **Attach the custom domain in Fastmail.** Create `gabriel@`, `stephanie@`, and the role aliases.
6. **Rotate** the account-owner email on all three off the bootstrap address and onto `ops@` / `dns@`.

Three accounts touch the bootstrap identity. None of them keep it.

## What this changed in the KB

Playbooks 01, 04, and the operating-costs file were internally contradictory on the registrar — 01 said Cloudflare, 04 said GoDaddy, costs said GoDaddy at $20/yr. All three now agree, and the cost line drops to at-cost. The orphaned `ops-operating-costs.md` is registered in the playbook index. The master `wiki/_index.md` had been claiming only Playbook 01 was ready since the day the other eleven were finished; corrected.

Two decisions were registered as binding: `DECISION-2026-07-14-master-domain-cloudflare` and `DECISION-2026-07-14-two-dependency-chains`.

## Still open

**Trello drift.** The "Domain, DNS & Email" card in Ops & Setup still describes the GoDaddy-registrar / Cloudflare-nameservers plan. It now contradicts the playbooks.

**COPPA remains unassigned.** It shapes signup flow, parental consent, analytics, and data retention — decisions about to be baked into Clerk and Plausible. It does not block Cloudflare, and it should not stay unowned much longer.
