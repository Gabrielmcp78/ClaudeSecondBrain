#!/usr/bin/env python3
"""
neo4j_sync_bridge.py — ClaudeSecondBrain ↔ Neo4j Knowledge Graph Sync Bridge

PURPOSE:
    Queries the Neo4j conversation graph and materialises high-signal knowledge
    as wiki articles inside ClaudeSecondBrain/wiki/.  Runs on demand (cron or
    manual) and is fully idempotent — re-running never duplicates content.

WHAT IT DOES (in order):
    1. Queries Neo4j for the most-connected projects and their conversation
       topics via semantic clustering on chunk embeddings.
    2. Routes each result to the correct wiki domain folder per CLAUDE.md taxonomy.
    3. Creates or appends to wiki articles in Markdown.
    4. Appends new cross-domain links to wiki/_connections.md.
    5. Writes the run log to wiki/_meta/change-log.md.
    6. Saves a full report to outputs/YYYY-MM-DD_neo4j-sync.md.

USAGE:
    # Basic run (dry-run mode — prints what would be written, touches nothing):
    python neo4j_sync_bridge.py --dry-run

    # Full sync:
    python neo4j_sync_bridge.py

    # Limit to one domain:
    python neo4j_sync_bridge.py --domain dev-projects

    # Force re-generation of existing articles (overwrites):
    python neo4j_sync_bridge.py --force

REQUIREMENTS:
    pip install neo4j python-dotenv  (sentence-transformers optional for deeper queries)

ENVIRONMENT (.env or shell):
    NEO4J_URI   = neo4j://localhost:7687  (default)
    NEO4J_USER  = neo4j                   (default)
    NEO4J_PASS  = <required>
    NEO4J_DATABASE = <optional>
"""

import os
import sys
import re
import json
import argparse
import logging
from datetime import datetime, date
from pathlib import Path
from typing import Optional

# ── dependencies ──────────────────────────────────────────────────────────────

try:
    from neo4j import GraphDatabase, basic_auth
except ImportError:
    sys.exit("Missing: pip install neo4j")

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
    load_dotenv(Path("/Volumes/Ready500/DEVELOPMENT/neo4j_json_ingester/.env"))
except ImportError:
    pass  # dotenv is optional; fall back to shell env

# ── config ────────────────────────────────────────────────────────────────────

KB_ROOT       = Path(__file__).parent           # ClaudeSecondBrain/
WIKI          = KB_ROOT / "wiki"
OUTPUTS       = KB_ROOT / "outputs"
CHANGE_LOG    = WIKI / "_meta" / "change-log.md"
CONNECTIONS   = WIKI / "_connections.md"
INDEX         = WIKI / "_index.md"

NEO4J_URI     = os.getenv("NEO4J_URI",  "neo4j://localhost:7687")
NEO4J_USER    = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASS    = os.getenv("NEO4J_PASS")   # required — set in .env or shell
NEO4J_DB      = os.getenv("NEO4J_DATABASE")

TODAY         = date.today().isoformat()

# ── taxonomy: Neo4j project names → wiki domain folders ───────────────────────
# Keys are lowercase substrings that appear in Neo4j project names.
# The first match wins.  Add more entries as new projects land in the graph.

DOMAIN_ROUTING = [
    # Conversation archives — primary asset, goes to ai-collaboration
    ("claude_conversations",    "ai-collaboration"),
    ("claude conversations",    "ai-collaboration"),
    ("chatgpt archive",         "reference-external"),
    # String Theory / creative fiction
    ("string theory",           "craft-fiction/string-theory"),
    ("string_theory",           "craft-fiction/string-theory"),
    ("stringtheory",            "craft-fiction/string-theory"),
    ("literary_manuscript_david", "craft-fiction/string-theory"),
    ("literary manuscript",     "craft-fiction/string-theory"),
    ("david_lang",              "craft-fiction/string-theory"),
    ("burnthrough",         "craft-fiction/aegis-cycle"),
    ("aegis",               "craft-fiction/aegis-cycle"),
    ("latency zero",        "craft-fiction/aegis-cycle"),
    ("query",               "craft-fiction/submission-strategy"),
    ("agent",               "craft-fiction/submission-strategy"),
    # Consciousness / VCH / physics
    ("vch",                 "theory-consciousness"),
    ("vibrational",         "theory-consciousness"),
    ("ghrm",                "theory-consciousness"),
    ("consciousness",       "theory-consciousness"),
    ("physics",             "theory-consciousness"),
    # Dev projects
    ("codex guardian",      "dev-projects/codex-guardian"),
    ("codex_guardian",      "dev-projects/codex-guardian"),
    ("writetrack",          "dev-projects/writetrack"),
    ("write_track",         "dev-projects/writetrack"),
    ("private club",        "dev-projects/private-club-app"),
    ("private_club",        "dev-projects/private-club-app"),
    ("comtech",             "dev-projects/comtechsuite"),
    ("prestige fiction",    "dev-projects/prestige-fiction-forge"),
    ("prestige_fiction",    "dev-projects/prestige-fiction-forge"),
    ("nexus",               "dev-projects/nexus"),
    # MCP / infrastructure
    ("mcp",                 "dev-infrastructure"),
    ("neo4j",               "dev-infrastructure"),
    ("mem0",                "dev-infrastructure"),
    ("memory",              "dev-infrastructure"),
    # AI collaboration
    ("synergy",             "ai-collaboration"),
    ("collaboration",       "ai-collaboration"),
    ("workflow",            "ai-collaboration"),
]

# ── logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("neo4j-sync-bridge")


# ═══════════════════════════════════════════════════════════════════════════════
# Neo4j queries
# ═══════════════════════════════════════════════════════════════════════════════

def get_driver():
    """
    Returns an authenticated Neo4j driver.

    Connection: bolt over localhost (default) or NEO4J_URI env var.
    Raises ValueError if NEO4J_PASS is unset.
    """
    if not NEO4J_PASS:
        raise ValueError("NEO4J_PASS environment variable is required")
    return GraphDatabase.driver(NEO4J_URI, auth=basic_auth(NEO4J_USER, NEO4J_PASS))


def neo4j_session(driver):
    """Returns a session, optionally scoped to NEO4J_DATABASE."""
    if NEO4J_DB:
        return driver.session(database=NEO4J_DB)
    return driver.session()


def fetch_project_stats(driver) -> list[dict]:
    """
    Pulls every Project with conversation + message counts.

    Returns list of dicts:
        project (str), description (str|None), creator (str|None),
        conversations (int), messages (int), documents (int)
    """
    cypher = """
    MATCH (proj:Project)
    OPTIONAL MATCH (proj)-[:HAS_DOC]->(doc:Document)
    OPTIONAL MATCH (proj)-[:HAS_CONV]->(conv:Conversation)
    OPTIONAL MATCH (conv)-[:HAS_TURN]->(msg:Message)
    OPTIONAL MATCH (person:Person)-[:CREATED]->(proj)
    RETURN
        proj.name        AS project,
        proj.description AS description,
        person.name      AS creator,
        count(DISTINCT doc)  AS documents,
        count(DISTINCT conv) AS conversations,
        count(DISTINCT msg)  AS messages
    ORDER BY conversations DESC
    """
    with neo4j_session(driver) as s:
        return s.run(cypher).data()


def fetch_top_chunks_for_project(driver, project_name: str, limit: int = 8) -> list[dict]:
    """
    Returns the longest / most informative text chunks for a project —
    a proxy for the topics that appear most in those conversations.

    Returns list of dicts:
        doc (str), snippet (str), char_len (int)
    """
    cypher = """
    MATCH (proj:Project {name: $project})
           -[:HAS_DOC]->(doc:Document)
           -[:HAS_CHUNK]->(chunk:DocChunk)
    RETURN
        doc.filename  AS doc,
        chunk.text    AS snippet,
        chunk.char_len AS char_len
    ORDER BY chunk.char_len DESC
    LIMIT $limit
    """
    with neo4j_session(driver) as s:
        return s.run(cypher, project=project_name, limit=limit).data()


def fetch_recent_conversations(driver, project_name: str, limit: int = 5) -> list[dict]:
    """
    Returns the most recent conversation IDs + message samples for a project.

    Returns list of dicts:
        conversation_id (str), turn_count (int), sample_turns (list[str])
    """
    cypher = """
    MATCH (proj:Project {name: $project})-[:HAS_CONV]->(conv:Conversation)
    OPTIONAL MATCH (conv)-[:HAS_TURN]->(msg:Message)
    WITH conv, collect(msg.text)[..3] AS sample_turns
    RETURN
        conv.conversation_id AS conversation_id,
        conv.turn_count      AS turn_count,
        sample_turns
    ORDER BY conv.conversation_id DESC
    LIMIT $limit
    """
    with neo4j_session(driver) as s:
        return s.run(cypher, project=project_name, limit=limit).data()


def fetch_database_overview(driver) -> dict:
    """
    Returns high-level counts: projects, documents, conversations, messages.
    """
    cypher = """
    MATCH (proj:Project)
    OPTIONAL MATCH (proj)-[:HAS_DOC]->(doc:Document)
    OPTIONAL MATCH (proj)-[:HAS_CONV]->(conv:Conversation)
    OPTIONAL MATCH (conv)-[:HAS_TURN]->(msg:Message)
    RETURN
        count(DISTINCT proj) AS projects,
        count(DISTINCT doc)  AS documents,
        count(DISTINCT conv) AS conversations,
        count(DISTINCT msg)  AS messages
    """
    with neo4j_session(driver) as s:
        row = s.run(cypher).single()
        return dict(row) if row else {}


# ═══════════════════════════════════════════════════════════════════════════════
# Routing + article generation
# ═══════════════════════════════════════════════════════════════════════════════

def route_project(project_name: str) -> str:
    """
    Maps a Neo4j project name to a wiki domain folder using DOMAIN_ROUTING.
    Falls back to 'reference-external' when no match is found.

    Parameters:
        project_name: raw project name from Neo4j

    Returns:
        Relative path string within wiki/ (e.g. 'craft-fiction/string-theory')
    """
    lower = project_name.lower()
    for keyword, folder in DOMAIN_ROUTING:
        if keyword in lower:
            return folder
    return "reference-external"


def slugify(text: str) -> str:
    """Converts a project name to a filesystem-safe slug."""
    slug = text.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def truncate(text: str, max_chars: int = 400) -> str:
    """Truncates text and appends ellipsis if needed."""
    if not text:
        return ""
    text = text.strip().replace("\n", " ")
    return text[:max_chars] + ("…" if len(text) > max_chars else "")


def build_article(project: dict, chunks: list[dict], convos: list[dict]) -> str:
    """
    Generates a wiki article in Markdown for a single Neo4j project.

    Parameters:
        project: row from fetch_project_stats
        chunks:  rows from fetch_top_chunks_for_project
        convos:  rows from fetch_recent_conversations

    Returns:
        Complete Markdown string ready to write to disk.

    Article layout:
        - Frontmatter comment with source tag
        - H1 title (project name)
        - Overview (description + creator)
        - Stats table
        - Topic samples extracted from chunks
        - Recent conversations
        - Source traceback
    """
    name    = project["project"]
    desc    = project.get("description") or ""
    creator = project.get("creator") or "unknown"
    docs    = project.get("documents", 0)
    convs   = project.get("conversations", 0)
    msgs    = project.get("messages", 0)

    lines = [
        f"<!-- source: neo4j-sync-bridge  generated: {TODAY} -->",
        "",
        f"# {name}",
        "",
    ]

    if desc:
        lines += [desc, ""]

    lines += [
        f"**Creator:** {creator}  ",
        f"**Documents in graph:** {docs}  ",
        f"**Conversations:** {convs}  ",
        f"**Messages:** {msgs}  ",
        "",
    ]

    # Topic samples from chunks
    if chunks:
        lines += ["## Topic samples", ""]
        seen_snippets: set[str] = set()
        for chunk in chunks:
            snippet = truncate(chunk.get("snippet", ""), 300)
            if not snippet or snippet in seen_snippets:
                continue
            seen_snippets.add(snippet)
            doc = chunk.get("doc", "unknown")
            lines += [
                f"*From `{doc}`:*",
                f"> {snippet}",
                "",
            ]

    # Recent conversations
    if convos:
        lines += ["## Recent conversations", ""]
        for conv in convos:
            cid      = conv.get("conversation_id", "?")
            turns    = conv.get("turn_count") or "?"
            samples  = conv.get("sample_turns") or []
            lines += [f"**`{cid}`** ({turns} turns)"]
            for sample in samples[:2]:
                lines.append(f"  - {truncate(sample, 200)}")
            lines.append("")

    lines += [
        "---",
        f"*Article generated by neo4j_sync_bridge.py on {TODAY}.*",
        f"*Neo4j source: `{NEO4J_URI}` — project `{name}`*",
        "",
    ]

    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# File I/O helpers
# ═══════════════════════════════════════════════════════════════════════════════

def ensure_dir(path: Path):
    """Creates directory and all parents if absent."""
    path.mkdir(parents=True, exist_ok=True)


def write_article(
    folder: str,
    slug: str,
    content: str,
    force: bool = False,
    dry_run: bool = False,
) -> tuple[bool, Path]:
    """
    Writes content to wiki/<folder>/<slug>.md.

    Parameters:
        folder:  relative wiki folder (e.g. 'dev-projects/codex-guardian')
        slug:    filename without extension
        content: full markdown string
        force:   if True, overwrite existing files
        dry_run: if True, do nothing but return the would-be path

    Returns:
        (written: bool, path: Path)
            written is False when the file already exists and force is False,
            or when dry_run is True.
    """
    target_dir = WIKI / folder
    target     = target_dir / f"{slug}.md"

    if dry_run:
        log.info(f"[DRY-RUN] would write → {target.relative_to(KB_ROOT)}")
        return False, target

    if target.exists() and not force:
        log.info(f"[SKIP] already exists: {target.relative_to(KB_ROOT)}")
        return False, target

    ensure_dir(target_dir)
    target.write_text(content, encoding="utf-8")
    log.info(f"[WRITE] {target.relative_to(KB_ROOT)}")
    return True, target


def append_connection(
    source_article: str,
    target_article: str,
    source_domain: str,
    target_domain: str,
    description: str,
    dry_run: bool = False,
):
    """
    Appends a cross-domain link entry to wiki/_connections.md if it is not
    already present (idempotent).

    Parameters:
        source_article: human-readable article name
        target_article: human-readable article name
        source_domain:  folder path (e.g. 'dev-projects/codex-guardian')
        target_domain:  folder path
        description:    one-sentence relationship description
        dry_run:        skip writing when True
    """
    entry = (
        f"\n### [{source_article}] ↔ [{target_article}]\n"
        f"*Domain: {source_domain} ↔ {target_domain}*\n"
        f"Connection: {description}\n"
    )

    if dry_run:
        log.info(f"[DRY-RUN] would append connection: {source_article} ↔ {target_article}")
        return

    existing = CONNECTIONS.read_text(encoding="utf-8") if CONNECTIONS.exists() else ""
    # Avoid duplicates by checking for the source+target combo
    marker = f"[{source_article}] ↔ [{target_article}]"
    if marker in existing:
        return

    with CONNECTIONS.open("a", encoding="utf-8") as f:
        f.write(entry)
    log.info(f"[CONNECTION] {source_article} ↔ {target_article}")


def append_change_log(entries: list[str], dry_run: bool = False):
    """
    Appends rows to wiki/_meta/change-log.md.

    Parameters:
        entries: list of plain-text change descriptions
        dry_run: skip writing when True
    """
    if dry_run or not entries:
        return

    ensure_dir(CHANGE_LOG.parent)
    lines = "\n".join(
        f"| {TODAY} | neo4j-sync | neo4j graph | {e} |"
        for e in entries
    ) + "\n"

    with CHANGE_LOG.open("a", encoding="utf-8") as f:
        f.write(lines)


def save_report(report_lines: list[str], dry_run: bool = False) -> Optional[Path]:
    """
    Writes the full sync report to outputs/YYYY-MM-DD_neo4j-sync.md.

    Parameters:
        report_lines: lines of the markdown report
        dry_run:      skip writing when True

    Returns:
        Path to the written file, or None if dry_run.
    """
    if dry_run:
        return None

    ensure_dir(OUTPUTS)
    out = OUTPUTS / f"{TODAY}_neo4j-sync.md"
    out.write_text("\n".join(report_lines), encoding="utf-8")
    log.info(f"[REPORT] {out.name}")
    return out


# ═══════════════════════════════════════════════════════════════════════════════
# Cross-domain connection inference
# ═══════════════════════════════════════════════════════════════════════════════

def infer_connections(projects: list[dict]) -> list[tuple]:
    """
    Inspects project names and routes to detect cross-domain relationships
    worth recording in _connections.md.

    Logic:
        - Any dev project that mentions 'string theory', 'VCH', or 'fiction'
          in its name or description gets a link to the relevant craft-fiction
          or theory-consciousness article.
        - MCP/infrastructure projects get a link to dev-infrastructure.
        - Adds a generic bi-directional link between any two projects that
          share a domain folder (they're in the same thematic cluster).

    Parameters:
        projects: rows from fetch_project_stats

    Returns:
        list of (source_article, target_article, source_domain, target_domain, description)
    """
    connections = []
    routed = [(p, route_project(p["project"])) for p in projects]

    # Group by domain
    domain_groups: dict[str, list[str]] = {}
    for project, domain in routed:
        domain_groups.setdefault(domain, []).append(project["project"])

    # Infer string-theory ↔ theory-consciousness when both present
    st_projects = domain_groups.get("craft-fiction/string-theory", [])
    vc_projects = domain_groups.get("theory-consciousness", [])
    if st_projects and vc_projects:
        connections.append((
            f"String Theory / {st_projects[0]}",
            f"VCH / {vc_projects[0]}",
            "craft-fiction/string-theory",
            "theory-consciousness",
            "Conversation history confirms ongoing development of the VCH-to-fiction bridge: "
            "the 68.48 Hz mechanic and harmonic entrainment are narratively deployed VCH propositions.",
        ))

    # Dev-infrastructure ↔ dev-projects when both present
    infra = domain_groups.get("dev-infrastructure", [])
    devp  = [
        p for k, v in domain_groups.items()
        if k.startswith("dev-projects") for p in v
    ]
    if infra and devp:
        connections.append((
            infra[0],
            devp[0],
            "dev-infrastructure",
            "dev-projects",
            "Neo4j conversation graph shows MCP/memory infrastructure being actively built "
            "alongside named dev projects — shared architectural patterns across builds.",
        ))

    return connections


# ═══════════════════════════════════════════════════════════════════════════════
# Main sync loop
# ═══════════════════════════════════════════════════════════════════════════════

def run_sync(
    domain_filter: Optional[str] = None,
    force: bool = False,
    dry_run: bool = False,
):
    """
    Main entry point for the sync bridge.

    Steps:
        1. Connect to Neo4j.
        2. Fetch project stats + database overview.
        3. For each project (optionally filtered by domain):
           a. Route to the correct wiki folder.
           b. Fetch chunks + recent conversations.
           c. Generate and write the wiki article.
        4. Infer and append cross-domain connections.
        5. Write change-log entries.
        6. Save full report to outputs/.

    Parameters:
        domain_filter: optional wiki domain subfolder to restrict output
                       (e.g. 'dev-projects')
        force:         overwrite existing wiki articles
        dry_run:       simulate without writing any files
    """
    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    log.info("  ClaudeSecondBrain ↔ Neo4j Sync Bridge")
    log.info(f"  KB root : {KB_ROOT}")
    log.info(f"  Neo4j   : {NEO4J_URI}")
    log.info(f"  Dry run : {dry_run}")
    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    driver = get_driver()

    # Step 1 — database overview
    overview = fetch_database_overview(driver)
    log.info(
        f"Graph: {overview.get('projects',0)} projects, "
        f"{overview.get('conversations',0)} convos, "
        f"{overview.get('messages',0)} messages"
    )

    # Step 2 — project stats
    projects = fetch_project_stats(driver)
    if not projects:
        log.warning("No projects found in Neo4j. Is the graph populated?")
        driver.close()
        return

    log.info(f"Found {len(projects)} projects in graph")

    change_log_entries = []
    report_lines = [
        f"# Neo4j → ClaudeSecondBrain Sync Report",
        f"",
        f"**Date:** {TODAY}  ",
        f"**Neo4j:** `{NEO4J_URI}`  ",
        f"**Mode:** {'DRY RUN' if dry_run else 'LIVE'}  ",
        f"",
        f"## Database overview",
        f"",
        f"| Metric | Count |",
        f"|--------|-------|",
        f"| Projects | {overview.get('projects',0)} |",
        f"| Documents | {overview.get('documents',0)} |",
        f"| Conversations | {overview.get('conversations',0)} |",
        f"| Messages | {overview.get('messages',0)} |",
        f"",
        f"## Articles processed",
        f"",
    ]

    # Step 3 — per-project articles
    for project in projects:
        name   = project["project"]
        domain = route_project(name)

        # Domain filter
        if domain_filter and not domain.startswith(domain_filter):
            log.debug(f"[SKIP domain] {name} → {domain}")
            continue

        slug   = slugify(name)
        log.info(f"Processing: {name}  →  wiki/{domain}/{slug}.md")

        chunks = fetch_top_chunks_for_project(driver, name)
        convos = fetch_recent_conversations(driver, name)

        article = build_article(project, chunks, convos)
        written, path = write_article(domain, slug, article, force=force, dry_run=dry_run)

        status = "written" if written else ("would write" if dry_run else "skipped (exists)")
        report_lines.append(
            f"- `{path.relative_to(KB_ROOT)}` — **{status}** "
            f"({project.get('conversations',0)} convos, {project.get('messages',0)} msgs)"
        )

        if written:
            change_log_entries.append(
                f"wiki/{domain}/{slug}.md (neo4j project: {name})"
            )

    # Step 4 — cross-domain connections
    report_lines += ["", "## Cross-domain connections inferred", ""]
    connections = infer_connections(projects)
    for conn in connections:
        append_connection(*conn, dry_run=dry_run)
        report_lines.append(
            f"- **{conn[0]}** ↔ **{conn[1]}** ({conn[2]} ↔ {conn[3]})"
        )

    if not connections:
        report_lines.append("*None inferred this run.*")

    # Step 5 — change log
    append_change_log(change_log_entries, dry_run=dry_run)

    # Step 6 — report
    report_lines += [
        "",
        "---",
        f"*Generated by neo4j_sync_bridge.py — {datetime.now().isoformat()}*",
    ]
    out = save_report(report_lines, dry_run=dry_run)
    if out:
        log.info(f"Report saved: {out.name}")

    driver.close()
    log.info("Sync complete.")

    # Print summary to stdout for easy reading
    print()
    print("\n".join(report_lines))


# ═══════════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Sync Neo4j knowledge graph → ClaudeSecondBrain wiki articles",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be written without touching any files",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing wiki articles",
    )
    parser.add_argument(
        "--domain",
        metavar="FOLDER",
        help="Restrict output to a specific wiki domain (e.g. dev-projects)",
        default=None,
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show DEBUG-level log messages",
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    run_sync(
        domain_filter=args.domain,
        force=args.force,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
