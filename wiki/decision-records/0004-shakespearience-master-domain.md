# ADR 0004 — Shakespearience Master Domain at Cloudflare Registrar

**Date:** 2026-07-14
**Status:** Accepted
**Decided by:** Gabriel
**Session context:** Gabriel preparing to create the Cloudflare account for Shakespearience; asked for the ops sequencing and named the master domain.

---

## Decision

The master domain for Shakespearience is **`shakespearienceworld.com`**, registered at **Cloudflare Registrar**. Registrar, DNS, CDN, WAF, and R2 file storage all consolidate on a single Cloudflare account. Hosting stays on Vercel — registrar and hosting are deliberately separate jobs.

`shakespearience.com` (GoDaddy) is demoted to a defensive registration with a 301 redirect only; it carries no mail, no DNS authority, and no email authentication records.

---

## Context

**Why Cloudflare Registrar:** Sells at wholesale with no markup at renewal (~$10-11/yr for .com). WHOIS privacy included free. Requires the zone to live on Cloudflare, which is where DNS belongs anyway given Cloudflare also provides CDN, WAF, SSL, and R2. Registering fresh avoids the 60-day transfer lock, auth-code, and unlock choreography that would come from moving `shakespearienceworld.com` from another registrar.

**Accepted tradeoff:** Concentration risk. One Cloudflare account now holds domain, DNS, CDN, WAF, and R2. A compromise loses all five simultaneously, and DNS control means an attacker can re-point MX records and intercept every password-reset email the company owns.

**Mandatory mitigation (not advisory):** Cloudflare is the hardest root account: both YubiKeys registered, recovery codes printed and stored physically, registrar lock and auto-renew ON from signup.

---

## Consequences

**Applies to:**
- Ops Playbooks 01 (Accounts & Access) and 04 (Domain, DNS & Email)
- All SPF / DKIM / DMARC records and role addresses (`ops@`, `billing@`, `support@`, `security@`, `dns@`, `admin@`)
- Vendor Ledger and Ops Operating Costs
- Any future article referencing the project's domain configuration

**Reopening condition:** Gabriel selects a different master domain, or a security/availability event argues for splitting registrar away from DNS.
