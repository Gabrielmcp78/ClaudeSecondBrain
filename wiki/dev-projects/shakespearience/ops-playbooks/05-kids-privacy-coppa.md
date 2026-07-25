# Playbook 05 — Kids' Privacy & Compliance (COPPA / FERPA)

*The one front you cannot improvise. Because the Shakespearience is made for children and provisions student accounts through schools, US law regulates how you collect, use, and store data. Getting this right also happens to be good for the brand you're building on trust.*

**Audience:** Gabriel and Stephanie — decide together, then confirm with counsel.
**Last updated:** 2026-07-13
**Not legal advice.** COPPA carries real FTC penalties; treat this as the map, and have an attorney review the actual signup flow and privacy policy before launch.

---

## Why this applies to you

- **COPPA** (Children's Online Privacy Protection Act) governs online services **directed to children under 13** that collect personal information. A Shakespeare podcast + membership for ages 6–16 is squarely child-directed for the younger tiers.
- **FERPA** enters through the school-licensing side: when a school adopts you, student records tied to that use carry school-data obligations.
- The safest posture: **design so children under 13 never create their own accounts or hand you personal data directly.** The parent or teacher is always the account holder.

## The core design decisions

1. **Parent-owned accounts.** For individual/family plans, the paying adult holds the account. A child listens under the parent's login; the child is not a data subject you collect from directly. This is the cleanest way to stay out of COPPA's hardest requirements.
2. **Verifiable parental consent (VPC)** where any child data is involved. The payment step (a credit-card transaction by the parent through Stripe) is itself one FTC-recognized consent mechanism — lean on it.
3. **Data minimization.** Collect the least you can. You do not need a child's name, birthday, photo, or location to deliver audio and PDFs. Don't collect what you'd then have to protect.
4. **School / teacher as intermediary (FERPA).** For school licenses, the teacher (school_admin) provisions student seats. Position the platform as a "school official" acting under the school's direction, collect no more than the seat needs, and give schools a data-processing agreement.

## What you must produce before launch

- **A children's privacy policy** in plain language: what you collect, why, who it's shared with, how long you keep it, and how a parent reviews or deletes it. Link it at signup and in the footer.
- **A direct-notice + consent step** at the point any child-associated data would be collected.
- **Data-processing agreements (DPAs)** with every vendor that touches user data — Clerk, Supabase, Stripe, Resend, ConvertKit, Transistor. Most publish a standard DPA; sign/accept each.
- **A deletion path** — a parent or school can request removal, and you can honor it across Supabase + the vendors.

## Choices already working in your favor

- **Plausible** for web analytics collects no cookies and no personal data — a strong COPPA-friendly choice over GA4. Keep it.
- **Signed, expiring R2 URLs** mean content isn't publicly harvestable.
- **Clerk Organizations** cleanly models teacher→student without exposing student PII broadly.
- **No advertising and no data sale** — the architecture already avoids the highest-risk COPPA territory. Keep it that way; do not add ad networks or behavioral tracking aimed at kids.

## Retention & security

Set a retention policy (delete inactive-member data after a defined window), keep the `downloads`/audit tables free of unnecessary PII, and make sure the security practices in Playbook 07 (encryption, access control, backups) actually cover the kids' data specifically.

## The order

Form the entity (Playbook 02) → draft the privacy policy + consent flow with counsel → sign vendor DPAs → build the parent/teacher-owned signup so no under-13 self-registration exists → launch. This card is marked not-optional in the Ops list for a reason.

## Cross-references
- [Playbook 02 — Legal Foundation](02-legal-foundation.md)
- [Playbook 06 — Payments & Tax](06-payments-tax.md) — the payment step doubles as parental consent
- [Playbook 07 — Security Hygiene & Backups](07-security-backups.md)
- [Shakespearience Architecture](../architecture.md) — Clerk roles, Plausible, R2 gating
