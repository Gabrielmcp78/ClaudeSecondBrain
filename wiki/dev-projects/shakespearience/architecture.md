# The Shakespearience — Full Project Architecture

*Cinematic Shakespeare podcast for children and families, produced by Present Company (Stephanie Carll). Gabriel McPherson serves as co-founder, CTO, and creative consultant, and composes original music for the production. (Narrator is a performance/casting role within the podcast itself, distinct from Gabriel's founding and technical role — corrected 2026-07-08 per Gabriel's flag.) Active collaboration as of June 2026. Drive folder shared by stephcarlltexas@gmail.com, Drive ID: `16DJlw_CP7xcZEd8o9Be13QER0hZCQec0`.* (source: The Shakespearience Project Overview.docx, Shakespearience_Revenue_Projection_Revised.docx, Shakespearience_Startup_Budget_Framework.xlsx)

<!-- kb-status: level=active-focus | phase="Build Phase — platform codebase scaffolded & build-verified" | updated=2026-07-24 -->
**Status:** 🟢 Active — Current Focus · Build Phase (platform codebase scaffolded + build-verified) · Last updated: 2026-07-24 (Claude — full re-sync against live Trello board, all 9 lists)

**⚠️ Open decision gate — read before quoting any price.** Two incompatible pricing models currently coexist on the board: this document's Monetization Model section below (Stephanie's original curriculum-first doc) versus the Stripe products actually seeded in code (subscription-first — see Technical Implementation → Payment & Subscription Engine). See "Pricing Model — Unresolved Conflict" below before citing a number to anyone.

---

## Core Identity

**Full name:** The Shakespearience: A Guided Journey for Minds Young and Old
**Producer/Creator:** Present Company — Stephanie Carll
**Tagline:** "We are just human beings, having a Shakespearience."
**Sign-off:** "It has been my pleasure to be your guide through this Shakespearience." *(Wink.)*

The Shakespearience is a serialized audio experience that makes Shakespeare feel magical, emotional, funny, and alive for children who might not otherwise encounter meaningful Shakespeare education or live theatre. The goal is not adaptation-for-children in the reductive sense — children are approached with intelligence, humor, beauty, and emotional depth. Like the best family storytelling, the experience layers so that parents genuinely want to listen alongside their children.

**Mission in one sentence:** Restore Shakespeare to what it originally was — living storytelling shared across generations, not academic obligation.

---

## Format & Structure

Each season adapts a single Shakespeare play across 10–15 serialized episodes of 15–20 minutes each. The listener immerses slowly into the world, language, humor, and emotional journey of the play over time. Two seasons are released per year.

### Play Progression by Age Tier

The catalog is intentionally designed to grow alongside its audience — a child can enter at age 6 and continue through adolescence, encountering increasingly layered material as they mature.

**Ages 6–9 — Whimsical Entry**
A Midsummer Night's Dream, Twelfth Night, The Tempest, Comedy of Errors.
Lighter, more fantastical. Emphasis on wonder, wordplay, and accessible comedy.

**Ages 10–12 — Emotional Complexity**
Much Ado About Nothing, The Winter's Tale, Cymbeline, As You Like It.
Increasingly layered character psychology and moral nuance.

**Ages 13–16 — Thematic Depth**
Hamlet, Romeo & Juliet, MacBeth, Julius Caesar.
Full thematic weight. Identity, power, mortality, ambition.

The long-term vision is a storytelling institution children can grow up with — an evergreen library that deepens alongside the listener's maturity. Younger siblings enter as older ones advance.

---

## Production Style

The production is intentionally performance-driven and language-centered. The goal is not overwhelming production design but allowing Shakespeare's storytelling, humor, rhythm, and emotional truth to do the work.

**Adaptation philosophy:** Each play is thoughtfully adapted and carefully cut for clarity, pacing, emotional impact, and accessibility for young listeners while preserving the richness and beauty of the original language.

**Ensemble:** A small core of 4–6 actors allows for intimacy, flexibility, and strong theatrical performances rooted in storytelling rather than spectacle.

**Music:** Original music (Gabriel's domain) and selective sound design create atmosphere and emotional texture. The focus always returns to language, actors, and the imaginative participation of the listener.

**The Narrator:** The center of the experience. Calm, wise, patient, and benevolent. Functioning variously as guide, stage manager, and director. Gently ushers listeners into the world of the play, helping them understand language, rhythm, and story without interrupting the magic. Layered humor — something for all age groups — and meta-theatrical elements define the contemporary accessibility of the piece.

**Educational integration:** Understanding is part of the adventure itself. Listeners encounter Shakespearean language, metaphor, rhythm, imagery, and iambic pentameter through repetition, context, humor, and performance — not through a separate "educational" module.

---

## Team (Known as of July 2026)

- **Stephanie Carll** — Creator, director/producer, lead creative (Present Company)
- **Gabriel McPherson** — Co-founder, CTO, creative consultant, composer (original music)
- **Sarah** — Brand and graphic design (Steph to get estimate/game plan)
- **Jamie** — Social media consultant (paid; marketing launch)
- Additional voice actors: stipends under negotiation; discussing smaller stipends, deferred payment, or revenue share for Season 1

---

## Pricing Model — Unresolved Conflict [flagged 2026-07-24]

Two pricing models exist on the board simultaneously, and they were never reconciled before the second one got seeded into code. This is a real open decision, not a documentation gap — do not present either model as settled to a customer, investor, or backer until Gabriel and Stephanie choose one.

**Model A — Stephanie's original doc** ("Shakesepearience Revenue & Engagement Ecosystem," drafted 6.30.25, last modified 2026-07-06): à la carte / ladder structure. Free weekly public podcast. Discovery Circle membership $9/mo (bonus audio, translations, monthly Zooms). Companion Guide $47/season one-time purchase. Group Study & Performance Guide, price TBD, 5–30 student license. Parent Guide $19 evergreen. This is the model documented in "Monetization Model," "Revenue Projections," and "Identified Missing Opportunities" below — all of it predates the Stripe lock and should be read as **the original creative/business vision, not current pricing**.

**Model B — locked in Tech Guts, seeded in code** (see Technical Implementation → Payment & Subscription Engine): subscription-only. Individual $9.99/mo or $89/yr (1 age tier, 1 account). Family $19.99/mo or $169/yr (all 3 age tiers, 2 accounts). School Basic/Standard/Premium $249/$349/$499 per year (15/30/50 seats, +$8/seat add-on). No separate one-time Companion Guide purchase — Season Kit PDFs bundle into whatever subscription tier is active, delivered via signed R2 URL. No Parent Guide as a discrete product.

**Why this matters right now:** the Stripe integration is fully code-built against Model B (`scripts/seed-stripe-products.ts` seeds Model B's five products), but the actual Trello card carrying this flag states plainly: *"Do not activate or seed live Stripe products until this reconciliation is complete."* Nothing has shipped that resolves the conflict as of 2026-07-24.

**Reconciliation needs to answer:** does the business sell a subscription (Model B, code-ready) or a curriculum-purchase-plus-retention-membership (Model A, closer to the original creative pitch and closer to how homeschool co-ops actually buy)? The Co-op QR licensing decision (locked 2026-07-14, see Group Curricula & Licensing below) already extends Model B's school-tier structure downward to 5–30 family co-ops — implying Model B has functionally won the licensing side even though the top-level individual/family reconciliation is still open.

---

## Monetization Model — Story → Insight → Action

*The following reflects Model A (Stephanie's original doc) — see the conflict flag immediately above before treating any figure here as current pricing.*

The strategic framework in three movements:
- **The podcast** is the experience — and the customer acquisition engine.
- **The membership** provides deeper understanding — and recurring revenue.
- **The curriculum** becomes active application — and the highest-margin long-tail asset.

### Free Access
First 2 episodes of every season remain free. This establishes trust, builds audience, and functions as a sneak peek into the bonus content and deeper world.

### Discovery Circle Membership — $9/month
Unlocks beginning at week 3 of each season. Includes:
- Bonus deep-dive audio episodes
- Present Company's "translations" (Stephanie's signature interpretive layer)
- Expanded literary and thematic exploration
- Actor conversations and behind-the-scenes material
- Companion listening guides
- Immersive educational bonus content

*"If you crave a deeper Shakespearience, join our inner circle."*

### Companion Curriculum Packages (per season)
- **Individual Companion Guide:** ~$47 — for homeschool families and individual parents
- **Group Study & Performance Guide:** ~$97 — for co-ops, micro-schools, small groups

Contents: printable activities, character charts, scene studies, discussion prompts, creative writing exercises, rhythm and language exploration, vocabulary worksheets, theatrical enrichment, imaginative educational experiences that feel inspiring rather than academic.

### Parent & Teacher Guides — ~$29 (evergreen)
Age-specific guides helping adults confidently introduce children to Shakespeare at different developmental stages: context, conversation starters, listening guidance, ways to continue exploration beyond the podcast.

### School & District Licensing
Per-season licensing for classroom and district adoption. High-margin product — each sale serves many students with minimal incremental fulfillment.

### Virtual Workshops & Events
Launch events and educational workshops; live virtual Q&As.

### Live Events & Touring (Year 2+)
Selective appearances; live staged podcast recordings; family Shakespeare workshops; educational conferences; regional theatre collaborations.

### Sponsorships (Year 2+)
Carefully aligned only — educational companies, literacy organizations, arts organizations, family-friendly brands, curriculum platforms, bookstores, publishers. Treated as bonus revenue, never a dependency.

---

## Revenue Projections

| Revenue Stream | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Discovery Circle Membership ($9/mo) | $10,800 | $43,200 | $97,200 |
| Individual Companion Guides | $23,500 | $70,500 | $164,500 |
| Group Study & Performance Guides | $18,000 | $54,000 | $90,000 |
| School/District Licensing | $5,000 | $20,000 | $60,000 |
| Parent Guide | $3,800 | $11,400 | $22,800 |
| Merchandise | $0 | $1,000 | $3,000 |
| Virtual Workshops / Events | $2,500 | $7,500 | $15,000 |
| Live Events / Touring | $0 | $5,000 | $30,000 |
| Podcast Sponsorships | $0 | $5,000 | $25,000 |
| **TOTAL** | **$63,600** | **$217,600** | **$507,500** |

**Member base assumptions:** 100 avg (Y1) → 400 (Y2) → 900 (Y3)
**Business strength threshold:** 200+ paying members AND 100–150 group licenses/year. At that point, the group licensing margin makes the business structurally sound.

**Y3 Revenue Mix:** Individual curriculum ~32% | Group curriculum & licensing ~30% | Membership ~19% | Events & workshops ~9% | Sponsorships ~5% | Parent Guide ~4% | Merch <1%

**5-Year Arc:** Y1: $20K–$75K | Y3: $150K–$400K | Y5: $500K–$1.5M+

---

## Startup Budget — $10,800 to $32,500

| Category | Low | High | Notes |
|---|---|---|---|
| Brand & Graphic Design | $2,000 | $6,000 | Logo, brand identity, visual standards, website graphics, social templates. Steph working with Sarah. |
| Website & E-commerce | $4,000 | $8,000 | Design, storefront, membership area, curriculum delivery, print-on-demand integration, licensing workflow, email funnel |
| Actor Stipends (S1) | $800 | $3,000 | Recurring cost. Smaller stipends, deferred payment, or revenue share under discussion |
| Marketing & Launch | $2,000 | $7,000 | Launch event, paid ads, PR, influencer outreach, social media consultant (Jamie) |
| Business Setup & Legal | $1,500 | $3,000 | LLC, contracts, accounting setup, trademark (optional initially) |
| Software & Subscriptions | $500 | $1,500 | Website platform, email platform, podcast host, cloud storage, design/accounting software |
| Studio Finish-Out | $0 | $2,000 | Mostly complete already |
| Contingency | $0 | $2,000 | Recommended |
| **TOTAL** | **$10,800** | **$32,500** | |

**Key philosophy:** In-house production = unusually low costs and high long-term leverage. Separate startup costs from recurring production costs. Infrastructure built once benefits every future season.

**Per-season recurring costs include:** Actor stipends, season artwork, curriculum layout & graphics, marketing campaign, launch event, print proof copies.

---

## Audience & Growth Strategy

Growth centers on trust-based, grassroots community channels rather than traditional entertainment marketing:
- Homeschool influencers and content creators
- Homeschool co-ops and micro-schools
- Theatre educators
- Literacy advocates and Shakespeare teachers
- Parenting podcasts and newsletters
- Family-centered arts communities

Emphasis on word-of-mouth, educational value, and long-term family loyalty. Not viral acquisition — multigenerational audience retention.

**Long-term audience goal:** A child enters at 6, follows through to 16. Younger siblings begin as older ones advance. The catalog becomes a family institution.

---

## Identified Missing Opportunities (Not Yet Built)

These revenue streams are documented but not yet activated:
- Affiliate partnerships (books, homeschool supplies)
- Corporate season sponsorship (a single sponsor for a full season)
- Patreon-style premium support tier ($25–50/month)
- Audio bundles (complete season downloads)
- Professional development for teachers
- Summer camps and intensives
- Grant funding for educational outreach / nonprofit partnerships
- Digital gift cards and gift memberships
- Physical boxed curriculum kits

---

## Offshoot Franchise Concepts

These are documented future expansions from the same playbook applied to new catalogs:
- **Mythtery School** — mythology equivalent
- **Austentacious** — Jane Austen adaptation series (implied)
- **Creative Podcast Incubator Services** — the production model as a service
- **Martindale Radio** — locally rooted audio brand (note: Gabriel is based in Martindale, TX through end of 2026)

---

## Google Drive Folder

**Root folder:** "The Shakespearience" — ID: `16DJlw_CP7xcZEd8o9Be13QER0hZCQec0`
**Owner:** stephcarlltexas@gmail.com | Shared: June 30, 2026

| File | ID |
|---|---|
| The Shakespearience Project Overview.docx | `1H2xSzjrGSZFsxc-hRKxV4MDZzl7SA5nX` |
| Shakespearience_Revenue_Projection_Revised.docx | `1c5u8H9ciQqanmqKH9jtdnLL35Vz78-yY` |
| Shakespearience_Startup_Budget_Framework.xlsx | `1nIlF6SQvP7ChZJPfQyiBHfngg8hOn5gB` |
| Demo Scripts/ (folder) | `1FTr7Yc7vuoEoCf_rUjmSi2fAfv_LdoJI` |

**Note:** Demo Scripts folder currently returns `canAddChildren: false` — contents not yet accessible via Drive MCP. Files within need to be opened individually or re-shared.

---

## Gabriel's Role

Gabriel is not a passive collaborator — this is a full creative, technical, and business partnership leveraging his specific stack:
- **Co-founder / CTO:** Owns the technical build (Shakespearience-Platform codebase, infrastructure, licensing/membership systems)
- **Creative consultant:** Draws on his stage direction, performance, and teaching pedagogy experience to shape the production's creative direction — distinct from any on-air performance role
- **Music:** Original commissioned scores for each season (his core theatrical composition work)
- **Production:** 18+ years directing, 60+ productions, 350+ master classes inform the production's creative and pedagogical standards
- **Business:** Active participant in the monetization and infrastructure build
- **Martindale Radio:** The local radio offshoot is positioned in Gabriel's current physical location

*Note: the Narrator is a performance/casting role within the podcast itself (see "Production Style" above), separate from Gabriel's co-founder/CTO/creative-consultant role. Corrected 2026-07-08 — see task-ledger.md TASK-MRCIJDA6.*

---

## Technical Implementation — Shakespearience-Platform Codebase

*Added 2026-07-08. Source: Trello board "Shakespearience" → "The Tech Guts" / "Tech Production" lists (full card descriptions, not just titles), Google Sheet `Shakespearience_Tech_Budget.gsheet` (doc_id `1X5Z6KsjSezLvOArU1nvZ8399uv__xkwZ9_FfG2W8Sdo`), and direct build/verification work in this session.*

Per this KB's own routing rule ("code lives in `/Volumes/Ready500/DEVELOPMENT`, not here"), the actual codebase is not duplicated into the wiki — this section is the pointer plus the architectural facts worth having in prose.

**Location:** `/Volumes/Ready500/DEVELOPMENT/Shakespearience-Platform`

**Stack (every choice sourced from a specific Trello card, not assumed; corrected 2026-07-24 for two 2026-07-22 stack changes):** Next.js 14 App Router on Vercel, Clerk with Organizations for school accounts (sole auth system — no Supabase Auth wiring anywhere), Stripe (Subscriptions + Invoicing + Customer Portal), Supabase/Postgres via Prisma, Cloudflare R2 for signed-URL content delivery, Resend for transactional email, ConvertKit for marketing email, Transistor.fm for the three-feed podcast architecture (public/subscriber/bonus), Printful for print-on-demand, Cloudflare Web Analytics for privacy-first web analytics, n8n self-hosted on Hetzner for the 8-workflow automation pipeline, Trello as the production-status sync target *and*, as of the Command Center card, a live-read data source for an in-app operations dashboard.

**Two stack cuts (2026-07-22, Gabriel — both replace what this document previously listed):**
- **Sanity CMS is cut, not built.** A working session for it never happened while Supabase's own `episodes` table was already doing half the job. Editorial content (season/episode/script metadata, description, publish state, transcript, chapter markers) lives directly in the Supabase `episodes` table, authored through the in-house Admin Control Panel's Content Scheduling section (`/admin`) — no second system, no `sanity_id` sync logic. Trade-off accepted: no rich-text/portable-text widgets, no built-in image pipeline, no native preview mode. Revisit only if the content model outgrows a plain form.
- **Plausible is cut in favor of Cloudflare Web Analytics**, which is free and already bundled with the Cloudflare account the stack pays for regardless of this choice. Trade-off: thinner custom-event tracking than Plausible's JS API — custom events (`subscription_started`, `kit_downloaded`, `checkout_initiated`, etc.) log to Supabase instead and surface in the Admin Control Panel's Revenue Analytics section. A Year 2 PostHog option is parked for when richer self-serve funnel analysis is actually needed.

**What's built:** the full Prisma schema (members, subscriptions, school_licenses, license_seats, content_entitlements, episodes — now the sole editorial record with no external CMS id, downloads, webhook_events), Clerk auth with the six-role architecture (admin/team/subscriber/school_admin/student/free), the complete Stripe integration including school NET-30 invoicing and a 5-tier product seed script (seeding Model B — see the pricing conflict flag above; not yet activated live), seven Resend email templates, the R2 signed-URL content-gating choke point with full audit logging, all six sections of the admin control panel (subscriber overview, member management, school licenses, content scheduling/editorial authoring, automation monitor, revenue analytics), the Teacher Portal with server-side seat enforcement, Printful order creation wired to the Stripe webhook, and all 8 n8n workflows as real importable JSON exports (Workflow 1 updated 2026-07-22 to remove its Sanity/Buffer dependencies).

**Command Center — live operations dashboard (new, delivery state: code-built on `feat/command-center-foundation`, not deployed):** a protected `/admin/command-center` route with a server-side Trello snapshot endpoint (`TRELLO_API_KEY`/`TRELLO_TOKEN`/`TRELLO_BOARD_ID`, credentials never reach the browser) rendering a visual board map, priority queue, ownership/due-date health signals, and critical path to pilot — i.e. a live read of the same Trello state this wiki article is synced against, inside the product itself. A planned AI advisor layer (chat over a minimized Trello-derived snapshot) is explicitly gated behind Gabriel's authorization to send that data to a model provider; until granted, the dashboard stays fully private and rule-based.

**Delivery-state governance framework (new, adopted 2026-07-16):** every Tech Guts/Ops & Setup card now self-reports one of five states — **Planned** (agreed, not implemented) → **Code-built** (exists in the repo) → **Configured** (real infrastructure/accounts stood up) → **Verified** (the intended journey passed in a safe test environment) → **Live** (approved for real users, operationally supported). As of 2026-07-16, the whole platform's snapshot reads: application/integration code = Code-built; third-party accounts/infrastructure = Configuration pending; CI/automated tests/staging proof = Verification pending; public launch = Not live. Trello is the cross-functional decision/delivery layer; the platform repo and this wiki remain the detailed technical record — the rule is explicitly not to duplicate one into the other.

**Release engineering gap (flagged 2026-07-16, still open):** `npm run typecheck` and `npm run build` pass locally, but no automated test script and no `.github` CI workflow exist yet. No pilot/staging environment or completed end-to-end acceptance run is documented either — the "Pilot Environment and End-to-End Verification" card lists the full required journey matrix (signup → checkout → entitlement → gated content → school/co-op provisioning → Stripe failure/refund/webhook recovery → privacy/consent checks) as not yet run.

**Build verification (2026-07-08):** `npm run build` passes clean, all 26 routes compile and correctly resolve to dynamic server-rendered — no route attempts build-time database or third-party API calls. Four real bugs were caught and fixed in this pass (a missing required Clerk parameter, a React Email type mismatch, a missing `await`, and a Resend SDK constructor that crashed the build when instantiated at module scope). Dependency patch versions were bumped, dropping `npm audit` from 3 critical vulnerabilities to zero. One environment-level discovery, not a code bug: Gabriel's shell has `NODE_ENV=production` set globally, which makes plain `npm install` silently skip devDependencies — affects any project on this machine, not just this one; documented in the platform repo's own `CHANGELOG.md`.

**Not yet done, by design:** no third-party accounts exist yet (Supabase/Clerk/Stripe/etc.) — every integration is real, SDK-wired code waiting on real credentials, not a mock. `SETUP.md` in the repo has the 11-step account-creation order. Sanity's episode content model is deliberately deferred to a session with Stephanie directly, since it's content-modeling work, not infrastructure. Visual/brand design hasn't started — blocked on the same Trello budget line item (Sarah's estimate) the corrected budget below documents as not-yet-requested.

## Tech Budget — Corrected (synced from Shakespearience_Tech_Budget.gsheet, 2026-07-07)

Startup budget corrected from the original $10,800–$32,500 estimate to **$7,040–$26,360** — the original overstated the web build (assumed a paid contractor; Gabriel is building it himself in-house) and understated ongoing hosting (originally uncosted). Monthly operating budget, previously unspecified, now documented at **$83–$511/month** excluding Stripe transaction fees, covering Vercel, Resend, ConvertKit, Transistor, Cloudflare R2, Sanity, Clerk, Supabase, n8n/Hetzner, Plausible, and bookkeeping (Wave/QuickBooks). Full line-item breakdown lives on the Trello "Budget: Startup & Per-Season" card (https://trello.com/c/W8lUUfUs), which this session updated directly, replacing its prior "working draft" placeholder.

## Production Pipeline — Tech Production [added 2026-07-24]

*Source: Trello "Shakespearience" → Tech Production list, full card descriptions.* This is the granular audio-production layer beneath the "Episode dissemination plan" already covered above — script lock through final master, before the automated publish sequence takes over.

**Stage 1 — Script → Audio production workflow:** script locked & approved by Stephanie → voice cast confirmed & scheduled → recording session completed → raw audio handed to editor → edited episode goes to Gabriel for QC → master delivered to the publishing pipeline. Tooling (DAW, remote recording platform, file naming, Drive folder structure) is specified in the next two cards; end-to-end verification on one real pilot episode has not yet happened.

**Stage 2 — Recording session setup:** open decisions as of 2026-07-24 — remote recording platform (Riverside.fm / Squadcast / Zencastr candidates), local DAW standard (Logic / Reaper / Adobe Audition candidates), mic/interface requirements for cast, session template/project file standards, raw-file backup protocol. Naming convention already decided: `SE[season]EP[episode]_[character]_[take]`.

**Stage 3 — Audio editing & post-production standards:** noise reduction/cleanup standards, music bed licensing and integration points, an age-appropriate theatrical sound-effects library, intro/outro templates per age tier (6-9/10-12/13-16), episode pacing targets, an editor brief template, and a defined revision-cycle (how many passes, who approves) — all still open decisions, not yet specified.

**Stage 4 — Mastering, QC & delivery specs (locked):** loudness -16 LUFS integrated (podcast standard), true peak -1 dBTP, delivery format MP3 320kbps + WAV archive master. QC checklist: levels, no clipping, clean in/out points, chapter markers, complete ID3 tags. Gabriel signs off before the publish trigger fires. WAV masters archive to Google Drive `/Masters/[Season]/[Episode]/` (now folder `03 – Tech Production` per the locked Drive structure — see Business Operations below).

**Stage 5 — Show notes, metadata & SEO:** per-episode outputs are platform-optimized title, short + long description, timestamped chapter markers, keywords/tags, an auto-generated-then-reviewed transcript, and 1400×1400px minimum episode artwork. Target automation: metadata generation triggers from the approved script, routes to Stephanie for review, then auto-populates to RSS and the website on publish — not yet built.

**Stage 6 — Automated publishing pipeline:** superseded in practice by the fuller "Episode dissemination plan" documented earlier in this article (Tech Guts), which already resolved the tool choice to n8n and removed the Sanity/Buffer dependencies this Tech Production card's stack-candidates list (Make.com/Zapier/n8n) had left open. Treat the Tech Guts version as authoritative.

**Stage 7 — Multi-platform distribution:** same public-directory list documented above (Apple/Spotify/Amazon/iHeartRadio/Pocket Casts/Overcast/YouTube/Pandora/TuneIn) plus the three-tier member feed (private RSS per tier, gated bonus feed, early-access feed for premium). Podcast-host candidate list on this card (Buzzsprout/Transistor/Captivate/RSS.com) is superseded — Transistor is locked (Tech Guts → Podcast Hosting Platforms).

**Release calendar & episode scheduling (decision simplified 2026-07-22):** an earlier plan to run release scheduling through a dedicated Airtable/Notion board was dropped as redundant — Trello is already the board of record and n8n is already wired to it (Workflow 8: Trello Production Status Sync). Replacement is Trello-native: the free Calendar Power-Up reads card due dates directly for the season-arc/multi-tier view; an episode's release date is simply its Trello card's due date; the "no publish unless QC complete X days prior" rule enforces against card due dates and list position through the existing n8n Trello webhook; age-tier cadence differences (6-9/10-12/13-16 may release on different schedules) use a Trello label per tier, filterable in the Calendar view. No second system to keep in sync with Trello.

---

## Business Operations — Big Biz Picture [added 2026-07-24]

*Source: Trello "Shakespearience" → Big Biz Picture list, full card descriptions.*

### Google Drive structure (locked 2026-07-23)

One shared Google Drive, **"Shakespearience,"** built inside Google Workspace (`gabriel@shakespearienceworld.com`) rather than a personal-account folder tree — numbered top-level folders mirror the Trello board's own list structure, since numbering keeps Drive's alphabetical-only sort in the intended order:

00 – Big Biz Picture · 01 – Creative Vision · 02 – Tech Guts · 03 – Tech Production (sub-foldered by season: `S1/scripts`, `S1/audio-raw`, `S1/audio-master`) · 04 – Marketing · 05 – Curricula · 06 – Bonus Content · 07 – Group Curricula & Licensing · 08 – Ops & Setup · 09 – Gabriel Private · 10 – Stephanie Private.

Both founders hold **Content Manager** (not full Manager) access at the shared-drive level — can add/edit/move/delete, can't change membership or delete the drive; this cascades to every folder automatically. Folders 09/10 override that inheritance per-item so each private folder is visible only to its owner. **Not yet decided:** whether Season audio masters live in this Drive long-term or stay referenced-by-link only, given Workspace Business Starter's pooled 30GB/user storage — R2 already handles public Season Kit downloads, so this only concerns internal working files.

### Funding strategy (synced 2026-07-13)

Startup need is $7,040–$26,360 (see Tech Budget below); monthly burn $83–$511. This is explicitly sized as **a five-figure gap-close, not a VC raise** — every option below is ranked against that reality, not against startup-funding norms generally.

1. **Recommended lead — Crowdfunding (Kickstarter/Indiegogo).** The product already has a natural reward-tier structure (Individual/Family/School kits, physical Season Kits, merch), so campaign rewards translate directly from what's already on the board. Realistically covers the low-to-mid end of the funding range alone and doubles as audience-building (fills the otherwise-empty Marketing list). Tradeoffs: requires upfront campaign production before any cash lands, ~5% platform + ~3% payment-processing fees, and Kickstarter specifically is all-or-nothing (Indiegogo offers flexible funding as an alternative).
2. **Parallel — Founding Subscriber pre-sale.** Since Stripe subscription products are already architected, open a discounted "Founding Family" pre-sale before Season 1 drops. Real revenue (no dilution, no repayment), stress-tests actual demand, and builds the subscriber base + email list pre-launch. Requires the ConvertKit waitlist-nurture sequence to already be running (currently unstarted — see Marketing status below).
3. **Backup — Bootstrap + friends & family.** At this dollar range, genuinely reachable through founder contribution plus a small F&F round — loan, small equity (once the LLC exists), or a convertible note if pre-entity. No pitch deck or investor-reporting overhead; personal financial exposure is the tradeoff.
4. **Slow parallel track — Arts & education grants.** State arts council grants, literacy nonprofits/foundations, EdTech microgrants, local arts commissions. Non-dilutive but slow (months, not weeks) and competitive. **Currently unassigned across the board** — needs an owner before a shortlist gets built.
5. **Fallback — SBA microloan / small-business loan.** Up to $50K, more founder-friendly terms than a conventional bank loan, but gated behind Legal Foundation (LLC/EIN) → Business Banking existing first, and repayment starts immediately regardless of revenue.
6. **Parked — Angel/seed investment.** Wrong stage for a $7K–$26K raise; investors at this check size want either existing traction or a materially bigger ask. Revisit only if Shakespearience expands into a multi-property franchise model, or after Season 1 data (subscriber conversion, school renewal rate) makes a larger growth round the right ask.

### Open operational gaps (verified 16 July 2026, still open as of this sync)

Three Big Biz Picture cards remain structurally empty, and they're load-bearing gaps, not administrative trivia:

- **SOPs & Workflow creation** — no documented recurring workflow yet for release approval, content publishing, customer support, school onboarding, incident response, or billing exceptions. First deliverable needed: a one-page SOP index naming owner/trigger/steps/evidence/escalation per launch-critical process.
- **Role delegation** — no ownership/delegation matrix exists. No accountable owner is explicit yet for product decisions, technical release, editorial approval, legal/privacy, customer support, school licensing, or Stripe/financial decisions.
- **Timeline** — no integrated delivery milestone plan exists sequencing business decisions, account setup, configuration, CI, pilot verification, privacy review, and launch approval against real dependencies.

All three block the same thing from different angles: nothing currently on the board shows "the next executable action and dependency for every launch-critical workstream" in one place — that's the explicit done-condition on all three cards, and none of them meet it yet.

---

## Board Status Snapshot — Remaining Lists [added 2026-07-24]

*Confirms current Trello state for the lists not otherwise covered above. Source: live board sync, 2026-07-24.*

**The Creative Vision** — all seven cards (Mission Statement/North Star, Narrator Role & Rules, Values & Vibe, Episode Structure, Series Through Lines, Series Season Map, Off-Shoots) are still empty on Trello itself, confirming the `[NEEDS CONTENT]` gaps already flagged throughout [creative-bible.md](creative-bible.md) are a real, board-level gap and not just a wiki lag. Stephanie's direct input remains the blocking dependency.

**Marketing** — all eight cards (Website, Logo & Branding, Social Media, Merch, Live Performances, Direct Marketing & Outreach, Series Premiere Launch Party, Content Ideas) are empty. Matches the funding-strategy note above that crowdfunding is expected to double as the marketing-list-filling activity, since almost nothing here has started independently.

**Curricula** — mostly empty (Parent Guide/Manifesto, Cheat Sheet are blank); **Season Kit** has real content: Episode Print-Outs, Character Chart, Play Synopsis, Scenes/Monologues, Vocabulary, and Iambic Pentameter worksheets/games are the defined contents, already reflected in the Season Kit description elsewhere in this document.

**Bonus Content** — all five cards (Iambic Pentameter, Spotlight Deep Dive, Translations, Roundtable, Monthly Zoom) are empty stubs. These map to the Discovery Circle membership perks named in the Monetization Model above, but none have been built out into an actual content plan yet.

**Group Curricula & Licensing** — mostly empty (Teacher Guide, Group Season Kits, Games, Annual Licensing Research, Performance Guide are blank), **except one fully locked decision:**

### Co-op Multi-Seat Licensing via QR Code Redemption (locked 2026-07-14)

An extension of the School & Group Licensing System (Tech Guts, above) built specifically for homeschool co-ops, which aren't schools — smaller groups (5–30 families, per Stephanie's Revenue & Engagement doc), tighter budgets, no institutional purchasing process. Reusing School Basic (15 seats/$249/yr flat) would have oversized and overpriced the entry point for the most common real co-op size.

**New Co-op Stripe products (mirror the School tier structure):** Co-op Small 5–10 seats $99/yr · Co-op Medium 11–20 seats $179/yr · Co-op Large 21–30 seats $249/yr. Same NET-30 invoicing option and Clerk Organization-per-license model as School tiers.

**Redemption flow:** co-op lead buys a tier → license key + seat count created in the reused `school_licenses` Supabase schema → system generates N unique redemption codes rendered as QR codes → distributed either as a printable PDF sheet for in-person handout or emailed individually from the co-op lead's portal (covers both in-person and remote/async co-ops) → parent scans/clicks their code, creates a normal account, seat is permanently marked claimed in `license_seats` (same server-side `seats_used >= seat_count` enforcement already built for schools) → claimed seat grants full home access to that family's age-tier library, not a classroom-limited login.

**Seat expiration** ties to the annual license period, reusing the same 14-day grace period and n8n renewal-reminder sequence already built for School Licensing — one consistent expiration rule across every group-license type rather than a second parallel entitlement system.

**Build delta against the existing School & Group Licensing System:** three new Stripe price tiers, a new `redemption_codes` table (code, license_id, qr_asset_url, claimed_by, claimed_at), a new public claim route (`/claim/[code]`), QR generation (likely the `qrcode` npm package, R2-stored PDF sheet), and a co-op-lead-facing seat portal (reusing the Teacher Portal component, retitled). No changes needed to R2 signed-URL gating, Clerk Organizations, or renewal automation.

This card is the clearest evidence that **Model B (subscription/licensing-first) has functionally already won** on the group/licensing side of the business even though the top-level Individual/Family pricing conflict (see "Pricing Model — Unresolved Conflict" above) remains open.

---

## Cross-References

- [Gabriel McPherson — Profile](../../ai-collaboration/gabriel-profile.md) — active project, co-founder/CTO/composer role
- [Acting and Performance Pedagogy](../../music-performance/acting-and-performance-pedagogy.md) — the pedagogical foundation for the narrator's approach
- [Writing Principles](../../craft-fiction/craft-principles/writing-principles.md) — age-tiered narrative craft principles in practice
- [VCH Framework](../../theory-consciousness/vch-framework.md) — Gabriel's theoretical framework for resonant storytelling (informs production philosophy) [theoretical]
- [Code Development Best Practices](../../dev-infrastructure/code-best-practices.md) — the enterprise-grade standards the Shakespearience-Platform codebase was built against (SDK-first design, zero-placeholder policy, two-level documentation)
- [Creative Bible](creative-bible.md) — the artistic counterpart to this document; the Creative Vision list's emptiness confirmed here is the same gap tracked there
- [Ops Playbooks](ops-playbooks/_index.md) — operational build-out this architecture depends on, including the 2026-07-22 Bitwarden/Google Workspace/Sanity-cut/Plausible-cut decisions
- [Gabriel Workflow Rules](../../ai-collaboration/gabriel-workflow-rules.md) — the SDLC and documentation discipline (Delivery State language, zero-placeholder policy) mirrored in this project's own Trello governance
