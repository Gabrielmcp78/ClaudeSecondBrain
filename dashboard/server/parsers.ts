/**
 * parsers.ts — SecondBrain markdown parsers
 * Converts raw markdown from wiki/_meta/ and _agents/ into typed objects
 * for the dashboard API layer.
 */

import fs from 'fs';
import path from 'path';
import { listActiveAgentIds } from './agentRegistry.js';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked' | 'cancelled';
  owner: string;
  requestedBy: string;
  project: string;
  priority: 'high' | 'normal' | 'low';
  outputs: string[];
  notes: string;
  raw: string;
}

export interface Handoff {
  date: string;
  from: string;
  to: string;
  completed: string[];
  doNotDo: string[];
  nextMove: string;
  openQuestions: string[];
}

export interface Decision {
  id: string;
  date: string;
  decidedBy: string;
  context: string;
  decision: string;
  appliesTo: string[];
  rationale: string;
  reopeningCondition: string;
}

export interface AgentStatus {
  name: string;
  lastActive: string;
  currentTask: string;
  awaiting: string;
  inboxCount: number;
  inboxMessages: string[];
  outboxCount: number;
}

export interface InboxEntry {
  /** Raw date/timestamp string from the "## <date> — <from>" header. */
  date: string;
  from: string;
  priority: 'high' | 'normal' | 'low' | null;
  taskRef: string;
  message: string;
}

export interface Connection {
  source: string;
  target: string;
  sourceDomain: string;
  targetDomain: string;
  description: string;
  sourcePath: string | null;
  targetPath: string | null;
}

export interface SystemStats {
  articleCount: number;
  rawQueueSize: number;
  processedCount: number;
  connectionCount: number;
  lastIngest: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function extractField(text: string, field: string): string {
  // Tolerates both the legacy plain "Field: value" style and the bold
  // "**Field:** value" style agents have been writing into task-ledger.md.
  const match = text.match(new RegExp(`^\\*{0,2}${field}:\\*{0,2}\\s*(.+)`, 'm'));
  return match ? match[1].trim() : '';
}

/** Like extractField, but captures a multi-line body (bullet lists,
 *  paragraphs) instead of stopping at end-of-line — used for narrative
 *  fields like Resolution/Progress that don't fit on one line. Stops at
 *  the next "**Label:**"-style field, a "---" rule, a new header, or EOF. */
function extractFreeformField(text: string, field: string): string {
  const re = new RegExp(
    `\\*{0,2}${field}:\\*{0,2}([\\s\\S]*?)(?=\\n\\*{0,2}[A-Z][\\w /-]{2,40}:\\*{0,2}[ \\n]|\\n---|\\n#{1,3}\\s|$)`,
    'm'
  );
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

/** Task status vocabulary in the ledger has drifted from the original
 *  5-value enum ("Status: pending") to free-text descriptions written by
 *  whichever agent closed or paused the task ("CLOSED — initial production
 *  version complete", "PAUSED — lower priority per Gabriel 2026-07-16").
 *  Normalize by keyword rather than exact match so real ledger entries
 *  actually land in a bucket instead of silently defaulting away. */
function normalizeTaskStatus(raw: string): Task['status'] {
  const s = raw.trim().toLowerCase();
  if (s.startsWith('complete') || s.startsWith('closed') || s.startsWith('done')) return 'complete';
  if (s.startsWith('in-progress') || s.startsWith('in progress') || s.startsWith('active')) return 'in-progress';
  if (s.startsWith('cancelled') || s.startsWith('canceled')) return 'cancelled';
  // "Paused" (deprioritized, not actively moving) has no dedicated bucket
  // in the dashboard's 4-column model — surfacing it as blocked keeps it
  // visibly flagged rather than disappearing into an undifferentiated
  // "pending" pile.
  if (s.startsWith('blocked') || s.startsWith('paused')) return 'blocked';
  return 'pending';
}

function normalizeTaskPriority(raw: string): Task['priority'] {
  const s = raw.trim().toLowerCase();
  if (s.startsWith('high')) return 'high';
  if (s.startsWith('low')) return 'low';
  return 'normal';
}

/** Notes shown on the task card: prefer the closing Resolution, then an
 *  in-flight Progress note (plus its Resume-when pointer), then an Open
 *  follow-on flag, then fall back to a legacy plain Notes field. */
function deriveTaskNotes(block: string): string {
  const resolution = extractFreeformField(block, 'Resolution');
  if (resolution) return resolution;

  const progress = extractFreeformField(block, 'Progress');
  const resumeWhen = extractFreeformField(block, 'Resume when');
  if (progress) return resumeWhen ? `${progress}\n\nResume when: ${resumeWhen}` : progress;

  const openFollowOn = extractFreeformField(block, 'Open follow-on');
  if (openFollowOn) return openFollowOn;

  return extractFreeformField(block, 'Notes');
}

function normalizeArticleKey(value = ''): string {
  return value
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ArticleEntry { title: string; path: string; domain: string }

/** Parse every "- [Title](domain/path.md)" link out of wiki/_index.md.
 *  This is the single source of truth for "how many wiki articles exist" —
 *  used both to build the connections-graph title/path resolver and to
 *  compute the dashboard's live Articles stat (see parseSystemStats).
 *  Previously the Articles stat relied on a manually-maintained
 *  "Total wiki articles | N" table row that nothing kept in sync, so it
 *  silently drifted to 0 once _index.md moved to per-domain bullet lists. */
function parseArticleIndex(indexContent: string): ArticleEntry[] {
  const articles: ArticleEntry[] = [];
  const linkPattern = /^- \[([^\]]+)\]\(([^)]+\.md)\)/gm;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(indexContent)) !== null) {
    const pathValue = match[2].trim();
    articles.push({
      title: match[1].trim(),
      path: pathValue,
      domain: pathValue.split('/')[0] || 'unknown',
    });
  }
  return articles;
}

function buildArticlePathResolver(indexContent: string): (label: string) => string | null {
  const articles = parseArticleIndex(indexContent);

  const byTitle = new Map(articles.map(a => [normalizeArticleKey(a.title), a.path]));
  const byPath = new Map(articles.map(a => [normalizeArticleKey(a.path.replace(/\.md$/, '')), a.path]));
  const domains = new Set(articles.map(a => a.domain));

  return (label: string) => {
    const cleanLabel = label.replace(/\/$/, '').trim();
    if (!cleanLabel) return null;

    const directPath = cleanLabel.endsWith('.md') ? cleanLabel : `${cleanLabel}.md`;
    if (articles.some(a => a.path === directPath)) return directPath;

    const labelKey = normalizeArticleKey(cleanLabel);
    if (byTitle.has(labelKey)) return byTitle.get(labelKey)!;
    if (byPath.has(labelKey)) return byPath.get(labelKey)!;

    const labelParts = cleanLabel.split('/').map(p => p.trim()).filter(Boolean);
    const firstPart = labelParts[0] || '';
    const domainHint = domains.has(firstPart) ? firstPart : '';
    const candidateParts = domainHint ? labelParts.slice(1) : labelParts;
    const candidateTexts = [
      candidateParts.join(' / '),
      candidateParts[candidateParts.length - 1],
      cleanLabel,
    ]
      .map(normalizeArticleKey)
      .filter(Boolean);

    const matches = articles
      .filter(a => !domainHint || a.domain === domainHint)
      .filter(a => {
        const title = normalizeArticleKey(a.title);
        return candidateTexts.some(candidateText =>
          candidateText === title || candidateText.startsWith(`${title} /`) || candidateText.includes(title)
        );
      })
      .sort((a, b) => b.title.length - a.title.length);

    return matches[0]?.path ?? null;
  };
}

function extractListField(text: string, field: string): string[] {
  const lines = text.split('\n');
  const idx = lines.findIndex(l => l.trim().startsWith(`${field}:`));
  if (idx === -1) return [];
  const items: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) break;
    if (l.startsWith('##') || /^\w+:/.test(l)) break;
    if (l.startsWith('- ')) items.push(l.slice(2).trim());
  }
  return items;
}

// ── Task Ledger Parser ─────────────────────────────────────────────────────

export function parseTasks(sbRoot: string): Task[] {
  const content = readFile(path.join(sbRoot, 'wiki/_meta/task-ledger.md'));
  if (!content) return [];

  // Task headers are written as "### TASK-<id> — <title>" (the ledger's
  // "Active Tasks" / "Archive — Closed Tasks" sections are both "## "
  // headers one level up). Match both "##" and "###" so older two-hash
  // entries, if any exist, still parse.
  const blocks = content.split(/^#{2,3}\s+TASK-/m).slice(1);
  return blocks.map(block => {
    const fullBlock = '### TASK-' + block;
    const headerMatch = block.match(/^([^\n]+)/);
    const headerLine = headerMatch ? headerMatch[1] : '';
    const dashIdx = headerLine.indexOf(' — ');
    const id = 'TASK-' + (dashIdx > -1 ? headerLine.slice(0, dashIdx).trim() : headerLine.trim());
    const title = dashIdx > -1 ? headerLine.slice(dashIdx + 3).trim() : '';

    const status = normalizeTaskStatus(extractField(block, 'Status'));
    const priority = normalizeTaskPriority(extractField(block, 'Priority'));

    return {
      id,
      title,
      status,
      owner: extractField(block, 'Owner'),
      requestedBy: extractField(block, 'Requested by'),
      // Most ledger entries predate the "Project:" field (only tasks
      // created through the dashboard's own "Delegate" form set it) — this
      // whole ledger belongs to one knowledge base, so default accordingly
      // rather than showing a blank project on real work.
      project: extractField(block, 'Project') || 'ClaudeSecondBrain',
      priority,
      outputs: extractListField(block, 'Outputs'),
      notes: deriveTaskNotes(block),
      raw: fullBlock,
    };
  });
}

// ── Handoffs Parser ────────────────────────────────────────────────────────

export function parseHandoffs(sbRoot: string): Handoff[] {
  const content = readFile(path.join(sbRoot, 'wiki/_meta/handoffs.md'));
  if (!content) return [];

  const blocks = content.split(/^#{2,3}\s+/m).slice(1);
  return blocks.map(block => {
    const headerMatch = block.match(/^(\d{4}-\d{2}-\d{2}) — (.+?) → (.+)/);
    const date = headerMatch ? headerMatch[1] : '';
    const from = headerMatch ? headerMatch[2].trim() : '';
    const to = headerMatch ? headerMatch[3].trim() : '';

    const completedMatch = block.match(/Task\(s\) completed:\s*\n([\s\S]+?)(?=\n\w|\n##|$)/m);
    const completed = completedMatch
      ? completedMatch[1].split('\n').filter(l => l.trim().startsWith('- ')).map(l => l.slice(2).trim())
      : [];

    const doNotMatch = block.match(/Do not:\s*\n([\s\S]+?)(?=\n\w|\n##|$)/m);
    const doNotDo = doNotMatch
      ? doNotMatch[1].split('\n').filter(l => l.trim().startsWith('- ')).map(l => l.slice(2).trim())
      : [];

    const nextMatch = block.match(/Recommended next move:\s*\n([\s\S]+?)(?=\nOpen questions|\n##|$)/m);
    const nextMove = nextMatch ? nextMatch[1].trim() : '';

    const oqMatch = block.match(/Open questions:\s*\n([\s\S]+?)(?=\n---|\n##|$)/m);
    const openQuestions = oqMatch
      ? oqMatch[1].split('\n').filter(l => l.trim().startsWith('- ')).map(l => l.slice(2).trim())
      : [];

    return { date, from, to, completed, doNotDo, nextMove, openQuestions };
  }).reverse(); // newest first
}

// ── Decision Registry Parser ───────────────────────────────────────────────

export function parseDecisions(sbRoot: string): Decision[] {
  const content = readFile(path.join(sbRoot, 'wiki/_meta/decision-registry.md'));
  if (!content) return [];

  const blocks = content.split(/^## DECISION-/m).slice(1);
  return blocks.map(block => {
    const idMatch = block.match(/^([^\n]+)/);
    const id = 'DECISION-' + (idMatch ? idMatch[1].trim() : '');

    const decisionMatch = block.match(/^Decision:\s*\n([\s\S]+?)(?=\nApplies to:|\n##|$)/m);
    const decision = decisionMatch ? decisionMatch[1].trim() : '';

    const rationaleMatch = block.match(/^Rationale:\s*\n([\s\S]+?)(?=\nReopening|\n##|$)/m);
    const rationale = rationaleMatch ? rationaleMatch[1].trim() : '';

    const reopeningMatch = block.match(/^Reopening condition:\s*\n([\s\S]+?)(?=\n---|\n##|$)/m);
    const reopeningCondition = reopeningMatch ? reopeningMatch[1].trim() : '';

    return {
      id,
      date: extractField(block, 'Date'),
      decidedBy: extractField(block, 'Decided by'),
      context: extractField(block, 'Session context'),
      decision,
      appliesTo: extractListField(block, 'Applies to'),
      rationale,
      reopeningCondition,
    };
  }).reverse();
}

// ── Agent Status Parser ────────────────────────────────────────────────────

export function parseAgents(sbRoot: string): AgentStatus[] {
  // Agent roster is data-driven — see server/agentRegistry.ts. Adding or
  // removing an agent (e.g. Cursor's removal) is a Setup → Agents action,
  // not a code change here.
  const agentNames = listActiveAgentIds(sbRoot);

  return agentNames.map(name => {
    const statusContent = readFile(path.join(sbRoot, `wiki/_agents/${name}/status.md`));
    const inboxContent = readFile(path.join(sbRoot, `wiki/_agents/${name}/inbox.md`));
    const outboxContent = readFile(path.join(sbRoot, `wiki/_agents/${name}/outbox.md`));

    const lastActive = extractField(statusContent, 'Last active') || '—';
    const currentTask = extractField(statusContent, 'Current task') || '—';
    const awaiting = extractField(statusContent, 'Awaiting') || '—';

    // Count non-empty entries in inbox (lines starting with "## " after the header)
    const inboxEntries = (inboxContent.match(/^## /gm) || []).length;
    const inboxMessages = inboxContent
      .split(/^## /m)
      .slice(1)
      .map(b => b.split('\n')[0].trim())
      .filter(Boolean);

    const outboxEntries = (outboxContent.match(/^## /gm) || []).length;

    return {
      name,
      lastActive,
      currentTask,
      awaiting,
      inboxCount: inboxEntries,
      inboxMessages,
      outboxCount: outboxEntries,
    };
  });
}

/** Parse an agent's inbox.md into discrete, structured entries instead of
 *  a flat wall of markdown. Each entry in inbox.md follows the pattern
 *  written by both /api/agents/:agent/wake and /api/agents/:agent/dispatch:
 *
 *    ## <timestamp> — <from>
 *
 *    **Priority:** 🔴 HIGH PRIORITY
 *    **Task ref:** TASK-...
 *
 *    <message body>
 *
 *    ---
 *
 *  Returned newest-first so the dashboard reads top-to-bottom as "most
 *  recent thing needing attention first" instead of a scroll-to-the-bottom
 *  chat log. */
export function parseInboxEntries(content: string): InboxEntry[] {
  if (!content) return [];
  const blocks = content.split(/^## /m).slice(1);

  return blocks
    .map((block): InboxEntry | null => {
      const headerMatch = block.match(/^(.+?) — (.+)/);
      if (!headerMatch) return null;
      const date = headerMatch[1].trim();
      const from = headerMatch[2].trim();

      const priorityMatch = block.match(/\*{0,2}Priority:\*{0,2}\s*(.+)/);
      const priorityRaw = priorityMatch ? priorityMatch[1].trim() : '';
      let priority: InboxEntry['priority'] = null;
      if (/high/i.test(priorityRaw)) priority = 'high';
      else if (/low/i.test(priorityRaw)) priority = 'low';
      else if (priorityRaw) priority = 'normal';

      const taskRefMatch = block.match(/\*{0,2}Task ref:\*{0,2}\s*(.+)/);
      const taskRef = taskRefMatch ? taskRefMatch[1].trim() : '';

      // Message body = everything after the header line, minus the
      // Priority/Task-ref metadata lines and the trailing "---" rule.
      const bodyLines = block
        .split('\n')
        .slice(1)
        .filter(l => !/^\*{0,2}(Priority|Task ref):\*{0,2}/.test(l.trim()));
      const message = bodyLines
        .join('\n')
        .replace(/\n?-{3,}\s*$/, '')
        .trim();

      return { date, from, priority, taskRef, message };
    })
    .filter((e): e is InboxEntry => e !== null)
    .reverse();
}

// ── Connections Parser ─────────────────────────────────────────────────────

export function parseConnections(sbRoot: string): Connection[] {
  const content = readFile(path.join(sbRoot, 'wiki/_connections.md'));
  if (!content) return [];
  const resolveArticlePath = buildArticlePathResolver(readFile(path.join(sbRoot, 'wiki/_index.md')));

  const blocks = content.split(/^#{2,3}\s+/m).slice(1);
  return blocks
    .map(block => {
      // Two heading generations now live in this file:
      //   legacy, manually curated:  [Source Article] ↔ [Target Article]
      //   current, SBCC-generated:   Source Article  ↔  Target Article
      //     (no brackets — written automatically by sbcc/synthesize.py's
      //     concept_bridges output from live embedding-similarity mining;
      //     see SecondBrainCommandCenter/sbcc/graph.py). Brackets are
      //     optional below so either shape is recognized.
      // No /m flag here deliberately: the heading must be the very first
      // line of the block (immediately after the split), not just any
      // line anywhere inside it. An earlier version of this regex used
      // /m and matched the "**[Source Article] ↔ [Target Article]**"
      // example line inside the "How to read this file" instructions
      // block, producing a fake "[Source Article" node on the graph.
      const headerMatch = block.match(/^\[?(.+?)\]?\s+↔\s+\[?(.+?)\]?\s*(?:\n|$)/);
      if (!headerMatch) return null;

      const source = headerMatch[1].trim();
      const target = headerMatch[2].trim();

      // Legacy per-edge domain line, when present.
      const domainMatch = block.match(/\*?Domain:\s+(.+?)\s+↔\s+(.+?)\*?(?:\n|$)/);
      const sourceDomain = domainMatch ? domainMatch[1].trim() : 'unknown';
      const targetDomain = domainMatch ? domainMatch[2].trim() : 'unknown';

      // Description: legacy free-text "Connection:" line, or (for SBCC
      // entries, which carry no such line) the score/hit-count metadata
      // line instead — e.g. "`score 0.944 · 29 connections`".
      const connMatch = block.match(/Connection:\s+([\s\S]*?)(?=\n(?:\*?Domain:|---|\n|$))/);
      const scoreMatch = block.match(/^`score\s+([\d.]+)\s*·\s*(\d+)\s+connections?`/m);
      const description = connMatch
        ? connMatch[1].trim()
        : scoreMatch
        ? `score ${scoreMatch[1]} · ${scoreMatch[2]} connections`
        : '';

      return {
        source,
        target,
        sourceDomain,
        targetDomain,
        description,
        sourcePath: resolveArticlePath(source),
        targetPath: resolveArticlePath(target),
      };
    })
    .filter((c): c is Connection => c !== null);
}

// ── System Stats ───────────────────────────────────────────────────────────

export function parseSystemStats(sbRoot: string): SystemStats {
  const indexContent = readFile(path.join(sbRoot, 'wiki/_index.md'));
  const changeLogContent = readFile(path.join(sbRoot, 'wiki/_meta/change-log.md'));

  // Count real article links in the index rather than trusting a
  // manually-maintained summary number (see parseArticleIndex above).
  const articleCount = parseArticleIndex(indexContent).length;

  // Count unprocessed raw files (no _done suffix)
  let rawQueueSize = 0;
  let processedCount = 0;
  try {
    const rawFiles = fs.readdirSync(path.join(sbRoot, 'raw'));
    rawFiles.forEach(f => {
      if (f.endsWith('_done') || f.includes('_done.')) processedCount++;
      else if (!f.startsWith('.')) rawQueueSize++;
    });
  } catch {
    // raw/ may not exist or be inaccessible
  }

  // Count connections from _connections.md. Brackets optional — matches
  // both the legacy manually-curated heading and the current SBCC-generated
  // heading (see parseConnections above for the full format breakdown).
  const connectionsContent = readFile(path.join(sbRoot, 'wiki/_connections.md'));
  const connectionCount = (connectionsContent.match(/^#{2,3}\s+\[?.+?\]?\s+↔\s+\[?.+?\]?\s*$/gm) || []).length;

  // Last ingest date from change-log.
  //
  // change-log.md is NOT reliably oldest-at-bottom — different agents/
  // sessions prepend new entries near the top rather than appending at the
  // end, so the file's raw top-to-bottom order does not track chronology.
  // Taking the last regex match in file order (the old approach) picked up
  // whatever date header happened to be physically closest to the bottom,
  // which is coincidental, not "most recent." Confirmed live 2026-07-23:
  // the file's true last line was a 2026-07-21 entry even though multiple
  // 2026-07-22 and 2026-07-23 entries existed earlier in the file. Fixed by
  // parsing every date header found and taking the actual maximum.
  const lastIngestMatches = changeLogContent.match(/## (\d{4}-\d{2}-\d{2})/g) || [];
  const lastIngest = lastIngestMatches.length
    ? lastIngestMatches
        .map(m => m.replace('## ', ''))
        .reduce((latest, current) => (current > latest ? current : latest))
    : '—';

  return { articleCount, rawQueueSize, processedCount, connectionCount, lastIngest };
}

// ── Raw Queue ──────────────────────────────────────────────────────────────

export function parseRawQueue(sbRoot: string): string[] {
  try {
    const rawFiles = fs.readdirSync(path.join(sbRoot, 'raw'));
    return rawFiles
      .filter(f => !f.startsWith('.') && !f.includes('_done'))
      .sort();
  } catch {
    return [];
  }
}
