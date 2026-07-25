#!/usr/bin/env python3
"""
outputs_review.py — SecondBrain outputs/ promotion scanner

Scans outputs/ for files not yet referenced in the change-log, scores each
for wiki promotion potential, and writes a ranked review list to
wiki/_agents/claude/inbox.md.

Run manually or via launchd after any session that produces output files.

Usage:
    python3 scripts/outputs_review.py [--dry-run] [--sb-root /path/to/SecondBrain]

Options:
    --dry-run     Print the review report to stdout instead of writing to inbox.md
    --sb-root     Path to the SecondBrain root directory (default: parent of this script)

Scoring rubric (max 100 points):
    Length          0–25   word count proxy for specificity and completeness
    Structure       0–20   heading count signals organized, promotable content
    Cross-links     0–20   wiki [[link]] or (path.md) references signal integration
    Governance      0–15   [verified]/[theoretical]/[creative-canon] labels signal
                           article-readiness
    Domain signal   0–20   presence of known domain keywords routes to the right folder
"""

import argparse
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SKIP_FILES = {"README.md"}

# Paths relative to SB root
OUTPUTS_DIR = "outputs"
CHANGE_LOG = "wiki/_meta/change-log.md"
INBOX = "wiki/_agents/claude/inbox.md"

# Domain routing: keyword → wiki folder
DOMAIN_SIGNALS: dict[str, str] = {
    "string theory": "craft-fiction/string-theory/",
    "david lang": "craft-fiction/string-theory/",
    "eleanor guare": "craft-fiction/string-theory/",
    "burnthrough": "craft-fiction/aegis-cycle/",
    "kieran vale": "craft-fiction/aegis-cycle/",
    "shakespearience": "dev-projects/shakespearience/",
    "vch": "theory-consciousness/",
    "vibrational consciousness": "theory-consciousness/",
    "ghrm": "theory-consciousness/",
    "harmonic": "theory-consciousness/",
    "flowscape": "dev-projects/flowscape/",
    "mcp server": "ai-collaboration/",
    "secondbrain": "ai-collaboration/",
    "second brain": "ai-collaboration/",
    "agent": "ai-collaboration/",
    "mail carrier": "ai-collaboration/",
    "neo4j": "dev-infrastructure/",
    "launchd": "dev-infrastructure/",
    "sdlc": "dev-infrastructure/",
    "codex guardian": "dev-projects/codex-guardian/",
    "private club": "dev-projects/private-club-app/",
    "comtechsuite": "dev-projects/comtechsuite/",
    "writetrack": "dev-projects/writetrack/",
    "prestige fiction": "dev-projects/prestige-fiction-forge/",
}

GOVERNANCE_LABELS = re.compile(
    r"\[(verified|theoretical|creative-canon|canonical|inference|unverified|"
    r"ai-generated|historical|superseded)\]",
    re.IGNORECASE,
)

WIKI_LINK = re.compile(r"\[.*?\]\(.*?\.md.*?\)|\[\[.*?\]\]")

HEADING = re.compile(r"^#{1,3}\s+\S", re.MULTILINE)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def find_sb_root(script_path: Path) -> Path:
    """Walk up from script location to find SecondBrain root (contains CLAUDE.md)."""
    candidate = script_path.parent
    for _ in range(5):
        if (candidate / "CLAUDE.md").exists():
            return candidate
        candidate = candidate.parent
    raise FileNotFoundError(
        "Could not locate SecondBrain root (CLAUDE.md not found within 5 levels of script)"
    )


def logged_outputs(change_log_path: Path) -> set[str]:
    """Return basenames of output files referenced in change-log.md."""
    if not change_log_path.exists():
        return set()
    text = change_log_path.read_text(encoding="utf-8")
    # Match any path ending in .md that lives in outputs/
    found = re.findall(r"outputs/([^\s'\",\)]+\.md)", text)
    return {f.strip() for f in found}


def score_file(path: Path) -> dict:
    """Read a file and compute a promotion score with breakdown."""
    try:
        text = path.read_text(encoding="utf-8")
    except Exception as e:
        return {"score": 0, "error": str(e)}

    words = len(text.split())
    headings = len(HEADING.findall(text))
    links = len(WIKI_LINK.findall(text))
    labels = len(GOVERNANCE_LABELS.findall(text))
    text_lower = text.lower()

    # --- Length (0–25) ---
    if words >= 800:
        length_score = 25
    elif words >= 400:
        length_score = 18
    elif words >= 200:
        length_score = 10
    elif words >= 80:
        length_score = 5
    else:
        length_score = 1

    # --- Structure (0–20) ---
    if headings >= 5:
        structure_score = 20
    elif headings >= 3:
        structure_score = 14
    elif headings >= 1:
        structure_score = 7
    else:
        structure_score = 0

    # --- Cross-links (0–20) ---
    if links >= 6:
        link_score = 20
    elif links >= 3:
        link_score = 13
    elif links >= 1:
        link_score = 6
    else:
        link_score = 0

    # --- Governance labels (0–15) ---
    if labels >= 5:
        gov_score = 15
    elif labels >= 2:
        gov_score = 10
    elif labels >= 1:
        gov_score = 5
    else:
        gov_score = 0

    # --- Domain signal (0–20) ---
    matched_domains: list[str] = []
    for keyword, folder in DOMAIN_SIGNALS.items():
        if keyword in text_lower:
            if folder not in matched_domains:
                matched_domains.append(folder)
    domain_score = min(20, len(matched_domains) * 7)

    total = length_score + structure_score + link_score + gov_score + domain_score

    return {
        "score": total,
        "words": words,
        "headings": headings,
        "links": links,
        "labels": labels,
        "domains": matched_domains[:3],  # top 3 candidate folders
        "breakdown": {
            "length": length_score,
            "structure": structure_score,
            "cross_links": link_score,
            "governance": gov_score,
            "domain": domain_score,
        },
    }


def recommendation(score: int) -> str:
    if score >= 70:
        return "🟢 PROMOTE — high-value, wiki-ready"
    elif score >= 45:
        return "🟡 REVIEW — solid content, may need light restructuring"
    elif score >= 20:
        return "🟠 LOW VALUE — useful reference but not wiki-article quality"
    else:
        return "⚫ SKIP — too thin or non-prose content"


# ---------------------------------------------------------------------------
# Report builder
# ---------------------------------------------------------------------------

def build_report(sb_root: Path) -> str:
    outputs_dir = sb_root / OUTPUTS_DIR
    change_log_path = sb_root / CHANGE_LOG

    all_outputs = sorted(
        [f for f in outputs_dir.glob("*.md") if f.name not in SKIP_FILES],
        key=lambda f: f.name,
        reverse=True,  # most recent first
    )

    logged = logged_outputs(change_log_path)
    unreviewed = [f for f in all_outputs if f.name not in logged]
    already_logged = [f for f in all_outputs if f.name in logged]

    # Score and sort unreviewed files
    scored = []
    for f in unreviewed:
        result = score_file(f)
        result["name"] = f.name
        scored.append(result)

    scored.sort(key=lambda r: r["score"], reverse=True)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    lines = [
        f"## outputs_review.py — {now}",
        "",
        f"**Unreviewed outputs:** {len(unreviewed)} of {len(all_outputs)} total",
        f"**Already in change-log:** {len(already_logged)}",
        "",
        "---",
        "",
        "### Promotion Queue (ranked by score)",
        "",
    ]

    if not scored:
        lines.append("*All outputs are already referenced in change-log.md — nothing to promote.*")
    else:
        for rank, r in enumerate(scored, 1):
            name = r["name"]
            score = r["score"]
            rec = recommendation(score)
            domains = ", ".join(r.get("domains", [])) or "—"
            breakdown = r.get("breakdown", {})
            error = r.get("error")

            lines.append(f"#### {rank}. `{name}` — Score: {score}/100")
            lines.append(f"**Recommendation:** {rec}")
            if error:
                lines.append(f"**Error reading file:** {error}")
            else:
                lines.append(
                    f"**Stats:** {r['words']} words · {r['headings']} headings · "
                    f"{r['links']} wiki links · {r['labels']} governance labels"
                )
                lines.append(
                    f"**Score breakdown:** length {breakdown.get('length',0)} · "
                    f"structure {breakdown.get('structure',0)} · "
                    f"links {breakdown.get('cross_links',0)} · "
                    f"governance {breakdown.get('governance',0)} · "
                    f"domain {breakdown.get('domain',0)}"
                )
                lines.append(f"**Candidate wiki folder(s):** `{domains}`")
            lines.append("")

    lines += [
        "---",
        "",
        "### Already in change-log (no action needed)",
        "",
    ]
    for f in already_logged:
        lines.append(f"- `{f.name}`")

    lines += [
        "",
        "---",
        "",
        "*Generated by `scripts/outputs_review.py`. To promote a file, ingest it via the*",
        "*standard ingestion procedure (CLAUDE.md §Ingestion Procedure) and append to*",
        "*`wiki/_meta/change-log.md`.*",
    ]

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Inbox writer
# ---------------------------------------------------------------------------

def write_to_inbox(sb_root: Path, report: str) -> None:
    """Prepend the report as a new inbox message to wiki/_agents/claude/inbox.md."""
    inbox_path = sb_root / INBOX
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    message = (
        f"\n---\n\n"
        f"**From:** outputs_review.py (automated)  \n"
        f"**Date:** {now}  \n"
        f"**Priority:** 🟡 NORMAL  \n"
        f"**Subject:** Unreviewed outputs promotion queue\n\n"
        f"{report}\n"
    )

    if inbox_path.exists():
        existing = inbox_path.read_text(encoding="utf-8")
        # Insert after the first heading line if present, else prepend
        if existing.startswith("#"):
            first_newline = existing.index("\n") + 1
            updated = existing[:first_newline] + message + existing[first_newline:]
        else:
            updated = message + existing
    else:
        inbox_path.parent.mkdir(parents=True, exist_ok=True)
        updated = f"# Claude — Inbox\n{message}"

    inbox_path.write_text(updated, encoding="utf-8")
    print(f"✅ Report written to {inbox_path}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="Print report to stdout only")
    parser.add_argument("--sb-root", type=Path, default=None, help="Path to SecondBrain root")
    args = parser.parse_args()

    if args.sb_root:
        sb_root = args.sb_root.resolve()
    else:
        sb_root = find_sb_root(Path(__file__).resolve())

    if not sb_root.exists():
        print(f"Error: SecondBrain root not found at {sb_root}", file=sys.stderr)
        sys.exit(1)

    report = build_report(sb_root)

    if args.dry_run:
        print(report)
    else:
        write_to_inbox(sb_root, report)
        print(f"SecondBrain root: {sb_root}")
        print(f"Outputs scanned: {sb_root / OUTPUTS_DIR}")


if __name__ == "__main__":
    main()
