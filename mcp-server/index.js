import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { exec, execFile } from 'node:child_process';
import { promisify } from 'node:util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

async function getGDriveAccessToken() {
  try {
    await execAsync('/opt/homebrew/bin/rclone backend get gdrive:');
  } catch (err) {
    console.warn('Warning: rclone token refresh failed:', err.message);
  }

  const configPath = path.join(process.env.HOME, '.config/rclone/rclone.conf');
  const content = await fs.readFile(configPath, 'utf8');
  const tokenMatch = content.match(/token\s*=\s*(.*)/);
  if (!tokenMatch) {
    throw new Error('Could not find token line in rclone.conf');
  }
  const tokenData = JSON.parse(tokenMatch[1]);
  return tokenData.access_token;
}
const ROOT = path.resolve(process.env.SECONDBRAIN_ROOT || path.join(__dirname, '..'));
const PORT = Number.parseInt(process.env.PORT || process.env.MCP_PORT || '3456', 10);
const MAX_READ_BYTES = Number.parseInt(process.env.SECONDBRAIN_MAX_READ_BYTES || '200000', 10);
const MAX_SEARCH_READ_BYTES = Number.parseInt(process.env.WORKSPACE_SEARCH_MAX_READ_BYTES || '500000', 10);
const MAX_WORKSPACE_RESULTS = Number.parseInt(process.env.WORKSPACE_SEARCH_MAX_RESULTS || '50', 10);

const DEFAULT_SAFE_ROOTS = {
  secondbrain: ROOT,
  google_drive: path.join(process.env.HOME, 'Library/CloudStorage/GoogleDrive-gabemcpherson@gmail.com'),
  development: '/Volumes/Ready500/DEVELOPMENT',
  manuscripts: path.join(process.env.HOME, 'Library/CloudStorage/GoogleDrive-gabemcpherson@gmail.com/My Drive/Manuscript Masters'),
};

function loadSafeRoots() {
  const configured = process.env.SECONDBRAIN_SAFE_ROOTS_JSON
    ? JSON.parse(process.env.SECONDBRAIN_SAFE_ROOTS_JSON)
    : {};
  return Object.fromEntries(
    Object.entries({ ...DEFAULT_SAFE_ROOTS, ...configured })
      .filter(([, rootPath]) => typeof rootPath === 'string' && rootPath.trim())
      .map(([name, rootPath]) => [name, path.resolve(rootPath)])
  );
}

const SAFE_ROOTS = loadSafeRoots();
const SAFE_ROOT_NAMES = Object.keys(SAFE_ROOTS);
const SECOND_BRAIN_WRITE_PREFIXES = ['raw/', 'wiki/', 'outputs/', 'handoff/'];

const SERVER_INSTRUCTIONS =
  "ClaudeSecondBrain is Gabriel McPherson's personal knowledge base. " +
  "Full operating schema is in CHATGPT_SYSTEM_PROMPT.md at the repo root — read it first if you do not already have system instructions loaded. " +
  "Session start order: (1) read wiki/_meta/agent-protocol.md, (2) read wiki/_meta/task-ledger.md for tasks assigned to chatgpt, " +
  "(3) read wiki/_meta/decision-registry.md for settled decisions, " +
  "(4) read wiki/_agents/chatgpt/inbox.md — 🔴 HIGH PRIORITY dispatches are handled before anything else, " +
  "(5) read wiki/_meta/handoffs.md, (6) read wiki/_index.md and wiki/_connections.md. " +
  "Inbox writes and change-log entries are append-only. Do not overwrite settled decisions or manuscript files without explicit Gabriel authorization.";

const TEXT_EXTENSIONS = new Set([
  '.cjs', '.css', '.csv', '.html', '.js', '.json', '.jsx', '.md', '.mjs',
  '.py', '.sh', '.ts', '.tsx', '.txt', '.xml', '.yaml', '.yml',
]);

const LOCAL_SEARCH_EXTENSIONS = new Set([
  ...TEXT_EXTENSIONS,
  '.docx',
]);

function safePath(userPath = '.') {
  const resolvedRoot = path.resolve(ROOT);
  const resolved = path.resolve(resolvedRoot, userPath);
  const relative = path.relative(resolvedRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escape blocked: ${userPath}`);
  }
  return resolved;
}

function safeWorkspacePath(rootName, userPath = '.') {
  const rootPath = SAFE_ROOTS[rootName];
  if (!rootPath) {
    throw new Error(`Unknown safe root: ${rootName}. Allowed roots: ${SAFE_ROOT_NAMES.join(', ')}`);
  }
  const resolvedRoot = path.resolve(rootPath);
  const resolved = path.resolve(resolvedRoot, userPath || '.');
  const relative = path.relative(resolvedRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escape blocked for root ${rootName}: ${userPath}`);
  }
  return resolved;
}

function relativePath(absPath) {
  return path.relative(ROOT, absPath) || '.';
}

function workspaceRelativePath(rootName, absPath) {
  return path.relative(SAFE_ROOTS[rootName], absPath) || '.';
}

function isTextPath(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function isAllowedSecondBrainWritePath(userPath) {
  const normalized = userPath.replace(/^\/+/, '');
  return SECOND_BRAIN_WRITE_PREFIXES.some(prefix => normalized.startsWith(prefix));
}

function textResult(text, structuredContent = undefined) {
  return {
    ...(structuredContent ? { structuredContent } : {}),
    content: [{ type: 'text', text }],
  };
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readTextFile(userPath) {
  const abs = safePath(userPath);
  const stat = await fs.stat(abs);
  if (!stat.isFile()) {
    throw new Error(`${userPath} is not a file`);
  }
  if (stat.size > MAX_READ_BYTES) {
    throw new Error(`${userPath} is ${stat.size} bytes, over limit ${MAX_READ_BYTES}`);
  }
  if (!isTextPath(abs)) {
    throw new Error(`${userPath} is not a supported text file`);
  }
  return fs.readFile(abs, 'utf8');
}

async function readLocalText(absPath, maxBytes = MAX_SEARCH_READ_BYTES) {
  const stat = await fs.stat(absPath);
  if (!stat.isFile()) {
    throw new Error(`${absPath} is not a file`);
  }
  if (stat.size > maxBytes) {
    throw new Error(`${absPath} is ${stat.size} bytes, over limit ${maxBytes}`);
  }

  const ext = path.extname(absPath).toLowerCase();
  if (ext === '.docx') {
    const { stdout } = await execFileAsync('/usr/bin/textutil', ['-convert', 'txt', '-stdout', absPath], {
      maxBuffer: maxBytes * 4,
    });
    return stdout;
  }

  if (ext === '.html' || ext === '.htm') {
    const content = await fs.readFile(absPath, 'utf8');
    return content
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (!isTextPath(absPath)) {
    throw new Error(`${absPath} is not a supported local text file`);
  }
  return fs.readFile(absPath, 'utf8');
}

async function walk(dir, options, results = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'npm-cache') {
      continue;
    }

    const full = path.join(dir, entry.name);
    const rel = relativePath(full);
    if (entry.isDirectory()) {
      if (options.includeDirectories) {
        results.push({ path: rel, type: 'directory' });
      }
      await walk(full, options, results);
    } else {
      results.push({ path: rel, type: 'file' });
    }
  }

  return results;
}

async function walkWorkspace(rootName, dir, options, results = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (
      entry.name === '.git' ||
      entry.name === 'node_modules' ||
      entry.name === 'npm-cache' ||
      entry.name === '.Trash' ||
      entry.name === '.DS_Store'
    ) {
      continue;
    }

    const full = path.join(dir, entry.name);
    const rel = workspaceRelativePath(rootName, full);
    if (entry.isDirectory()) {
      if (options.includeDirectories) {
        results.push({ path: rel, type: 'directory' });
      }
      await walkWorkspace(rootName, full, options, results);
    } else {
      results.push({ path: rel, type: 'file' });
    }
  }

  return results;
}

async function recentFiles(dirPath, limit) {
  const abs = safePath(dirPath);
  const entries = await walk(abs, { includeDirectories: false });
  const files = [];
  for (const entry of entries) {
    const absEntry = safePath(entry.path);
    const stat = await fs.stat(absEntry);
    files.push({
      path: entry.path,
      size: stat.size,
      modified: stat.mtime.toISOString(),
    });
  }
  return files.sort((a, b) => b.modified.localeCompare(a.modified)).slice(0, limit);
}

function snippet(content, query, maxChars = 500) {
  const lower = content.toLowerCase();
  const index = lower.indexOf(query.toLowerCase());
  if (index < 0) return content.slice(0, maxChars);
  const start = Math.max(0, index - Math.floor(maxChars / 2));
  const end = Math.min(content.length, start + maxChars);
  return content.slice(start, end);
}

function extractDriveFileId(urlOrFileId) {
  const value = String(urlOrFileId || '').trim();
  if (!value) {
    throw new Error('Missing Google Drive URL or file ID');
  }

  const patterns = [
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) {
    return value;
  }

  throw new Error(`Could not extract Google Drive file ID from: ${urlOrFileId}`);
}

async function driveFetch(pathname, options = {}) {
  const accessToken = await getGDriveAccessToken();
  const url = pathname.startsWith('http')
    ? pathname
    : `https://www.googleapis.com/drive/v3/${pathname.replace(/^\/+/, '')}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Drive API error ${res.status}: ${text}`);
  }
  return res;
}

async function docsFetch(pathname, options = {}) {
  const accessToken = await getGDriveAccessToken();
  const url = pathname.startsWith('http')
    ? pathname
    : `https://docs.googleapis.com/v1/${pathname.replace(/^\/+/, '')}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Docs API error ${res.status}: ${text}`);
  }
  return res;
}

async function getDriveMetadata(urlOrFileId) {
  const fileId = extractDriveFileId(urlOrFileId);
  const fields = encodeURIComponent('id,name,mimeType,modifiedTime,createdTime,size,parents,webViewLink');
  const res = await driveFetch(`files/${fileId}?fields=${fields}&supportsAllDrives=true`);
  return res.json();
}

async function exportDriveDoc(urlOrFileId, format = 'text') {
  const fileId = extractDriveFileId(urlOrFileId);
  const metadata = await getDriveMetadata(fileId);
  const exportMimeType = format === 'markdown' ? 'text/markdown' : 'text/plain';
  const fallbackMimeType = 'text/plain';

  if (metadata.mimeType?.startsWith('application/vnd.google-apps.')) {
    const exportUrl = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}/export`);
    exportUrl.searchParams.set('mimeType', exportMimeType);
    let res;
    try {
      res = await driveFetch(exportUrl.toString());
    } catch (error) {
      if (exportMimeType === fallbackMimeType) throw error;
      exportUrl.searchParams.set('mimeType', fallbackMimeType);
      res = await driveFetch(exportUrl.toString());
    }
    return { metadata, text: await res.text(), exportedMimeType: exportUrl.searchParams.get('mimeType') };
  }

  const res = await driveFetch(`files/${fileId}?alt=media&supportsAllDrives=true`);
  return { metadata, text: await res.text(), exportedMimeType: metadata.mimeType };
}

async function searchDrive(query, limit = 10) {
  const escaped = query.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const q = encodeURIComponent(`trashed = false and (name contains '${escaped}' or fullText contains '${escaped}')`);
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,webViewLink,size),nextPageToken');
  const pageSize = Math.min(Math.max(limit, 1), MAX_WORKSPACE_RESULTS);
  const res = await driveFetch(`files?q=${q}&pageSize=${pageSize}&fields=${fields}&supportsAllDrives=true&includeItemsFromAllDrives=true`);
  const data = await res.json();
  return data.files || [];
}

function textFromStructuralElements(elements = []) {
  let text = '';
  for (const element of elements) {
    if (element.paragraph?.elements) {
      for (const paragraphElement of element.paragraph.elements) {
        if (paragraphElement.textRun?.content) {
          text += paragraphElement.textRun.content;
        }
      }
    }
    if (element.table?.tableRows) {
      for (const row of element.table.tableRows) {
        for (const cell of row.tableCells || []) {
          text += textFromStructuralElements(cell.content || []);
        }
      }
    }
    if (element.tableOfContents?.content) {
      text += textFromStructuralElements(element.tableOfContents.content);
    }
  }
  return text;
}

function documentEndIndex(document) {
  const bodyContent = document.body?.content || [];
  const indexes = bodyContent.map(element => element.endIndex).filter(Number.isFinite);
  return indexes.length ? Math.max(...indexes) : 1;
}

function countOccurrences(haystack, needle, matchCase = true) {
  if (!needle) return 0;
  const source = matchCase ? haystack : haystack.toLowerCase();
  const target = matchCase ? needle : needle.toLowerCase();
  let count = 0;
  let index = 0;
  while ((index = source.indexOf(target, index)) !== -1) {
    count += 1;
    index += target.length;
  }
  return count;
}

async function getGoogleDocument(urlOrFileId) {
  const fileId = extractDriveFileId(urlOrFileId);
  const res = await docsFetch(`documents/${fileId}`);
  return res.json();
}

async function batchUpdateDocument(urlOrFileId, requests) {
  const fileId = extractDriveFileId(urlOrFileId);
  const res = await docsFetch(`documents/${fileId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests }),
  });
  return res.json();
}

function provenanceBlock({ source, metadata, importedAt, savedPath }) {
  return [
    '---',
    `Source: ${source}`,
    metadata?.id ? `File ID: ${metadata.id}` : undefined,
    metadata?.name ? `Title: ${metadata.name}` : undefined,
    metadata?.mimeType ? `MIME Type: ${metadata.mimeType}` : undefined,
    metadata?.modifiedTime ? `Modified: ${metadata.modifiedTime}` : undefined,
    `Imported: ${importedAt}`,
    savedPath ? `Path saved: ${savedPath}` : undefined,
    metadata?.webViewLink ? `Web URL: ${metadata.webViewLink}` : undefined,
    '---',
    '',
  ].filter(line => line !== undefined).join('\n');
}

function createServer() {
  try {
    const server = new McpServer(
      {
        name: 'unified-secondbrain-mcp-server',
        version: '1.2.0',
        websiteUrl: 'https://github.com/gabrielmcp/ClaudeSecondBrain',
      },
      { instructions: SERVER_INSTRUCTIONS }
    );

  // ─── Semantic Tools (secondbrain.*) ──────────────────────────────────────────

  server.registerTool(
    'secondbrain.search',
    {
      title: 'Search SecondBrain',
      description: 'Search wiki, outputs, and raw text files by file name and optional content query.',
      inputSchema: {
        query: z.string().describe('Text to search for in filenames and text file contents'),
        scope: z.enum(['wiki', 'raw', 'outputs', 'all']).default('wiki'),
        limit: z.number().int().min(1).max(50).default(10),
      },
      outputSchema: {
        results: z.array(z.object({
          path: z.string(),
          matchType: z.enum(['filename', 'content']),
          snippet: z.string().optional(),
        })),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ query, scope, limit }) => {
      const roots = scope === 'all' ? ['wiki', 'outputs', 'raw'] : [scope];
      const results = [];
      const startTime = Date.now();
      const MAX_SEARCH_TIME = 10000; // 10 seconds max

      for (const root of roots) {
        const rootAbs = safePath(root);
        if (!(await pathExists(rootAbs))) continue;
        
        // Get all files first (fast)
        const entries = await walk(rootAbs, { includeDirectories: false });
        
        // First pass: filename matches (fast)
        for (const entry of entries) {
          if (results.length >= limit) break;
          if (Date.now() - startTime > MAX_SEARCH_TIME) {
            console.warn(`[Search] Timeout after ${MAX_SEARCH_TIME}ms`);
            break;
          }
          
          const nameMatch = entry.path.toLowerCase().includes(query.toLowerCase());
          if (nameMatch) {
            results.push({ path: entry.path, matchType: 'filename' });
          }
        }
        
        // Second pass: content matches if we still need more results (slower)
        if (results.length < limit) {
          for (const entry of entries) {
            if (results.length >= limit) break;
            if (Date.now() - startTime > MAX_SEARCH_TIME) {
              console.warn(`[Search] Timeout after ${MAX_SEARCH_TIME}ms`);
              break;
            }
            
            // Skip if already matched by filename
            if (results.some(r => r.path === entry.path && r.matchType === 'filename')) {
              continue;
            }
            
            if (!isTextPath(entry.path)) continue;
            
            try {
              const content = await readTextFile(entry.path);
              if (content.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  path: entry.path,
                  matchType: 'content',
                  snippet: snippet(content, query),
                });
              }
            } catch {
              // Skip unreadable/binary/oversized files during search.
            }
          }
        }
        
        if (Date.now() - startTime > MAX_SEARCH_TIME) {
          console.warn(`[Search] Search timeout for root ${root}`);
          break;
        }
      }

      return textResult(JSON.stringify(results, null, 2), { results });
    }
  );

  server.registerTool(
    'secondbrain.read',
    {
      title: 'Read SecondBrain File',
      description: 'Read a UTF-8 text file inside ClaudeSecondBrain by relative path.',
      inputSchema: {
        path: z.string().describe('Relative path from the ClaudeSecondBrain repo root'),
      },
      outputSchema: {
        path: z.string(),
        content: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ path: filePath }) => {
      const content = await readTextFile(filePath);
      return textResult(content, { path: filePath, content });
    }
  );

  server.registerTool(
    'secondbrain.write_inbox',
    {
      title: 'Write Inbox Item',
      description: 'Append a timestamped item to wiki/inbox.md. This tool never overwrites existing content.',
      inputSchema: {
        title: z.string().describe('Short title for the inbox item'),
        content: z.string().describe('Markdown content to append'),
        source: z.string().optional().describe('Optional source label or URL'),
      },
      outputSchema: {
        path: z.string(),
        appended: z.boolean(),
      },
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ title, content, source }) => {
      const inboxPath = 'wiki/inbox.md';
      const abs = safePath(inboxPath);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      const entry = [
        '',
        `## ${new Date().toISOString()} - ${title}`,
        source ? `Source: ${source}` : undefined,
        '',
        content.trim(),
        '',
      ].filter(line => line !== undefined).join('\n');
      await fs.appendFile(abs, entry, 'utf8');
      return textResult(`Appended inbox item to ${inboxPath}`, { path: inboxPath, appended: true });
    }
  );

  server.registerTool(
    'secondbrain.append_note',
    {
      title: 'Append Note',
      description: 'Append markdown to an existing note or create a new note inside wiki/.',
      inputSchema: {
        path: z.string().describe('Path under wiki/, for example wiki/dev-infrastructure/note.md'),
        content: z.string().describe('Markdown content to append'),
        heading: z.string().optional().describe('Optional heading inserted before the content'),
      },
      outputSchema: {
        path: z.string(),
        appended: z.boolean(),
      },
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ path: notePath, content, heading }) => {
      if (!notePath.startsWith('wiki/')) {
        throw new Error('append_note is restricted to paths under wiki/');
      }
      const abs = safePath(notePath);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      const text = `\n${heading ? `\n## ${heading}\n` : ''}${content.trim()}\n`;
      await fs.appendFile(abs, text, 'utf8');
      return textResult(`Appended note to ${notePath}`, { path: notePath, appended: true });
    }
  );

  server.registerTool(
    'secondbrain.link_notes',
    {
      title: 'Link Notes',
      description: 'Append a cross-domain connection entry to wiki/_connections.md.',
      inputSchema: {
        from: z.string().describe('Source note path or concept'),
        to: z.string().describe('Target note path or concept'),
        relationship: z.string().describe('Brief explanation of the relationship'),
      },
      outputSchema: {
        path: z.string(),
        appended: z.boolean(),
      },
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
    async ({ from, to, relationship }) => {
      const connectionsPath = 'wiki/_connections.md';
      const abs = safePath(connectionsPath);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      const entry = `\n- ${from} -> ${to}: ${relationship}\n`;
      const existing = await fs.readFile(abs, 'utf8').catch(() => '');
      if (!existing.includes(entry.trim())) {
        await fs.appendFile(abs, entry, 'utf8');
      }
      return textResult(`Linked notes in ${connectionsPath}`, { path: connectionsPath, appended: true });
    }
  );

  server.registerTool(
    'secondbrain.recent_changes',
    {
      title: 'Recent SecondBrain Changes',
      description: 'Return recent file modifications and the tail of wiki/_meta/change-log.md.',
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(10),
      },
      outputSchema: {
        files: z.array(z.object({
          path: z.string(),
          size: z.number(),
          modified: z.string(),
        })),
        changeLogTail: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ limit }) => {
      const files = await recentFiles('wiki', limit);
      const changeLog = await readTextFile('wiki/_meta/change-log.md').catch(() => '');
      const changeLogTail = changeLog.split('\n').slice(-80).join('\n');
      return textResult(JSON.stringify({ files, changeLogTail }, null, 2), { files, changeLogTail });
    }
  );

  server.registerTool(
    'secondbrain.verify',
    {
      title: 'Verify SecondBrain',
      description: 'Check core index/connection/change-log files, inbox availability, and repo-root path safety.',
      inputSchema: {},
      outputSchema: {
        ok: z.boolean(),
        root: z.string(),
        checks: z.array(z.object({
          name: z.string(),
          ok: z.boolean(),
          detail: z.string(),
        })),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async () => {
      const checks = [];
      for (const required of ['wiki/_index.md', 'wiki/_connections.md', 'wiki/_meta/change-log.md']) {
        const exists = await pathExists(safePath(required));
        checks.push({ name: required, ok: exists, detail: exists ? 'present' : 'missing' });
      }
      const inbox = safePath('wiki/inbox.md');
      checks.push({
        name: 'wiki/inbox.md',
        ok: await pathExists(inbox) || await pathExists(path.dirname(inbox)),
        detail: await pathExists(inbox) ? 'present' : 'will be created on first write',
      });
      checks.push({ name: 'root', ok: ROOT.endsWith('ClaudeSecondBrain'), detail: ROOT });

      const structured = { ok: checks.every(check => check.ok), root: ROOT, checks };
      return textResult(JSON.stringify(structured, null, 2), structured);
    }
  );

  server.registerTool(
    'secondbrain.status_digest',
    {
      title: 'SecondBrain Status Digest',
      description: 'Return a curated, fixed-shape operational status snapshot: change-log tail, Claude agent inbox summary (counts and priority flags only, no raw file paths), open task-ledger items, and MCP server identity. This tool never returns arbitrary file paths, absolute filesystem locations, or unbounded file contents -- only pre-approved structured status fields. Prefer this over secondbrain.recent_changes or workspace.read_file when a status/health snapshot is all that is needed.',
      inputSchema: {
        changeLogLines: z.number().int().min(1).max(200).default(40).describe('Number of trailing lines to include from the change log'),
        inboxLimit: z.number().int().min(1).max(50).default(10).describe('Number of most recent Claude inbox entries to summarize'),
      },
      outputSchema: {
        server: z.object({
          name: z.string(),
          version: z.string(),
          rootLabel: z.string(),
        }),
        changeLogTail: z.string(),
        claudeInbox: z.object({
          totalEntries: z.number(),
          highPriorityCount: z.number(),
          recentSubjects: z.array(z.string()),
        }),
        taskLedger: z.object({
          openCount: z.number(),
          openTasks: z.array(z.object({
            id: z.string(),
            title: z.string(),
            status: z.string(),
            owner: z.string(),
            priority: z.string(),
          })),
        }),
        generatedAt: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ changeLogLines, inboxLimit }) => {
      const changeLog = await readTextFile('wiki/_meta/change-log.md').catch(() => '');
      const changeLogTail = changeLog.split('\n').slice(-changeLogLines).join('\n');

      const inboxRaw = await readTextFile('wiki/_agents/claude/inbox.md').catch(() => '');
      const inboxEntries = inboxRaw.split(/\n(?=## )/).filter(block => block.trim().startsWith('## '));
      const recentInboxEntries = inboxEntries.slice(-inboxLimit);
      const claudeInbox = {
        totalEntries: inboxEntries.length,
        highPriorityCount: inboxEntries.filter(block => /HIGH PRIORITY/i.test(block)).length,
        recentSubjects: recentInboxEntries.map(block => {
          const headerMatch = block.match(/^## (.+)$/m);
          return headerMatch ? headerMatch[1].trim() : 'untitled entry';
        }),
      };

      const ledgerRaw = await readTextFile('wiki/_meta/task-ledger.md').catch(() => '');
      const taskBlocks = ledgerRaw.split(/\n(?=###? TASK[-\s])/i).filter(block => /TASK[-\s]/i.test(block));
      const openTasks = [];
      for (const block of taskBlocks) {
        const idMatch = block.match(/TASK[-\s]?([\w-]+)/i);
        const titleMatch = block.match(/^#+\s*TASK[-\s]?[\w-]*\s*[-–—]\s*(.+)$/mi);
        const statusMatch = block.match(/Status:\s*(\S+)/i);
        const ownerMatch = block.match(/Owner:\s*(.+)/i);
        const priorityMatch = block.match(/Priority:\s*(\S+)/i);
        const status = statusMatch ? statusMatch[1].toLowerCase() : 'unknown';
        if (['complete', 'cancelled', 'canceled'].includes(status)) continue;
        openTasks.push({
          id: idMatch ? `TASK-${idMatch[1]}` : 'unknown',
          title: titleMatch ? titleMatch[1].trim() : 'untitled task',
          status,
          owner: ownerMatch ? ownerMatch[1].trim() : 'unassigned',
          priority: priorityMatch ? priorityMatch[1].toLowerCase() : 'normal',
        });
      }

      const structured = {
        server: { name: 'unified-secondbrain-mcp-server', version: '1.2.0', rootLabel: 'ClaudeSecondBrain' },
        changeLogTail,
        claudeInbox,
        taskLedger: { openCount: openTasks.length, openTasks },
        generatedAt: new Date().toISOString(),
      };
      return textResult(JSON.stringify(structured, null, 2), structured);
    }
  );

  server.registerTool(
    'workspace.list_directory',
    {
      title: 'List Safe Workspace Directory',
      description: 'List files and folders inside a configured safe root.',
      inputSchema: {
        root: z.enum(SAFE_ROOT_NAMES).describe(`Safe root to inspect: ${SAFE_ROOT_NAMES.join(', ')}`),
        path: z.string().default('.').describe('Relative path inside the safe root'),
      },
      outputSchema: {
        root: z.string(),
        path: z.string(),
        items: z.array(z.object({
          name: z.string(),
          type: z.string(),
          path: z.string(),
        })),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ root, path: dirPath }) => {
      const abs = safeWorkspacePath(root, dirPath);
      const entries = await fs.readdir(abs, { withFileTypes: true });
      const items = entries.map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: workspaceRelativePath(root, path.join(abs, entry.name)),
      }));
      const structured = { root, path: dirPath, items };
      return textResult(JSON.stringify(structured, null, 2), structured);
    }
  );

  server.registerTool(
    'workspace.read_file',
    {
      title: 'Read Safe Workspace File',
      description: 'Read a supported text-like file from a configured safe root. Supports plain text, markdown, JSON, HTML-cleaned text, and DOCX via textutil.',
      inputSchema: {
        root: z.enum(SAFE_ROOT_NAMES).describe(`Safe root to read from: ${SAFE_ROOT_NAMES.join(', ')}`),
        path: z.string().describe('Relative file path inside the safe root'),
      },
      outputSchema: {
        root: z.string(),
        path: z.string(),
        text: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ root, path: filePath }) => {
      const abs = safeWorkspacePath(root, filePath);
      const text = await readLocalText(abs, MAX_READ_BYTES);
      const structured = { root, path: filePath, text };
      return textResult(text, structured);
    }
  );

  server.registerTool(
    'workspace.read_file_range',
    {
      title: 'Read Safe Workspace File (Chunked Range)',
      description: 'Read a byte or line window from a large text file in a configured safe root. ' +
        'Use this instead of workspace.read_file when the file exceeds the read limit (e.g. large manuscript .txt exports). ' +
        'Specify either byte offsets (start / length or byte_start / byte_end) or line offsets (line_start / line_count or line_start / line_end, 1-based). ' +
        'If both are provided, byte offsets take precedence. ' +
        'Returns the extracted text plus file metadata so callers can paginate.',
      inputSchema: {
        root: z.enum(SAFE_ROOT_NAMES).describe(`Safe root to read from: ${SAFE_ROOT_NAMES.join(', ')}`),
        path: z.string().describe('Relative file path inside the safe root'),
        start: z.number().int().min(0).optional().describe('Start byte offset (inclusive, 0-based). Takes precedence over byte_start.'),
        length: z.number().int().min(1).optional().describe('Byte chunk length. Used with start/byte_start. Defaults to 100000.'),
        byte_start: z.number().int().min(0).optional().describe('Start byte offset (inclusive, 0-based)'),
        byte_end: z.number().int().min(1).optional().describe('End byte offset (exclusive). Defaults to byte_start + 100000 if not provided.'),
        line_start: z.number().int().min(1).optional().describe('Start line number (1-based, inclusive). Used when byte offsets are absent.'),
        line_end: z.number().int().min(1).optional().describe('End line number (1-based, inclusive). Defaults to line_start + 200 if not provided.'),
        line_count: z.number().int().min(1).optional().describe('Number of lines to read. Used with line_start. Takes precedence over line_end.'),
      },
      outputSchema: {
        root: z.string(),
        path: z.string(),
        file_size_bytes: z.number(),
        total_lines: z.number().optional(),
        byte_start: z.number(),
        byte_end: z.number(),
        text: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ root, path: filePath, start, length, byte_start, byte_end, line_start, line_end, line_count }) => {
      const abs = safeWorkspacePath(root, filePath);
      const stat = await fs.stat(abs);
      if (!stat.isFile()) throw new Error(`${filePath} is not a file`);

      const CHUNK_LIMIT = 200000; // max bytes per range request

      // --- byte-offset mode ---
      const effectiveStart = start ?? byte_start;
      if (effectiveStart !== undefined) {
        const bStart = effectiveStart;
        const bLength = length ?? (byte_end !== undefined ? (byte_end - bStart) : CHUNK_LIMIT);
        const bEnd = Math.min(bStart + Math.min(bLength, CHUNK_LIMIT), stat.size);
        const readLen = bEnd - bStart;
        if (readLen <= 0) throw new Error(`effectiveStart (${bStart}) must be less than end (${bEnd})`);

        const buf = Buffer.alloc(readLen);
        const fh = await fs.open(abs, 'r');
        try {
          await fh.read(buf, 0, readLen, bStart);
        } finally {
          await fh.close();
        }
        const text = buf.toString('utf8');
        const structured = { root, path: filePath, file_size_bytes: stat.size, byte_start: bStart, byte_end: bEnd, text };
        return textResult(text, structured);
      }

      // --- line-offset mode ---
      const lStart = line_start ?? 1;
      let lEnd;
      if (line_count !== undefined) {
        lEnd = lStart + line_count - 1;
      } else {
        lEnd = line_end ?? (lStart + 200);
      }
      if (lStart < 1) throw new Error('line_start must be >= 1');
      if (lEnd < lStart) throw new Error('line_end must be >= line_start');

      const raw = await fs.readFile(abs, 'utf8'); // full read to count lines — only safe for <~50MB
      const allLines = raw.split('\n');
      const totalLines = allLines.length;
      const sliced = allLines.slice(lStart - 1, lEnd).join('\n');

      // compute approximate byte offsets for the slice
      const bytesBefore = Buffer.byteLength(allLines.slice(0, lStart - 1).join('\n') + (lStart > 1 ? '\n' : ''), 'utf8');
      const bytesSlice = Buffer.byteLength(sliced, 'utf8');

      const structured = {
        root,
        path: filePath,
        file_size_bytes: stat.size,
        total_lines: totalLines,
        byte_start: bytesBefore,
        byte_end: bytesBefore + bytesSlice,
        text: sliced,
      };
      return textResult(sliced, structured);
    }
  );

  server.registerTool(
    'workspace.get_file_info',
    {
      title: 'Get Safe Workspace File Info',
      description: 'Get metadata for a file or folder inside a configured safe root.',
      inputSchema: {
        root: z.enum(SAFE_ROOT_NAMES).describe(`Safe root to inspect: ${SAFE_ROOT_NAMES.join(', ')}`),
        path: z.string().default('.').describe('Relative path inside the safe root'),
      },
      outputSchema: {
        root: z.string(),
        path: z.string(),
        type: z.string(),
        size: z.number(),
        modified: z.string(),
        created: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ root, path: filePath }) => {
      const abs = safeWorkspacePath(root, filePath);
      const stat = await fs.stat(abs);
      const structured = {
        root,
        path: filePath,
        type: stat.isDirectory() ? 'directory' : 'file',
        size: stat.size,
        modified: stat.mtime.toISOString(),
        created: stat.birthtime.toISOString(),
      };
      return textResult(JSON.stringify(structured, null, 2), structured);
    }
  );

  server.registerTool(
    'workspace.search',
    {
      title: 'Search Safe Workspace Root',
      description: 'Search filenames and supported text-like contents inside a configured safe root. Google Drive roots also search native Drive Docs through the Drive API.',
      inputSchema: {
        root: z.enum(SAFE_ROOT_NAMES).describe(`Safe root to search: ${SAFE_ROOT_NAMES.join(', ')}`),
        query: z.string().min(1).describe('Search query'),
        path: z.string().default('.').describe('Relative path inside the safe root for local filesystem search'),
        file_types: z.array(z.string()).default([]).describe('Optional extensions without dots, plus gdoc for native Google Docs'),
        limit: z.number().int().min(1).max(MAX_WORKSPACE_RESULTS).default(20),
      },
      outputSchema: {
        root: z.string(),
        results: z.array(z.object({
          root: z.string(),
          path: z.string(),
          name: z.string().optional(),
          type: z.string(),
          matchType: z.string(),
          snippet: z.string().optional(),
          size: z.number().optional(),
          modified: z.string().optional(),
          fileId: z.string().optional(),
          url: z.string().optional(),
        })),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ root, query, path: searchPath, file_types, limit }) => {
      const startTime = Date.now();
      const maxTimeMs = 10000;
      const normalizedTypes = new Set(
        file_types.map(type => type.toLowerCase().replace(/^\./, '')).filter(Boolean)
      );
      const shouldIncludeType = filePath => {
        if (normalizedTypes.size === 0) return true;
        const ext = path.extname(filePath).toLowerCase().replace(/^\./, '');
        return normalizedTypes.has(ext);
      };
      const results = [];

      if ((root === 'google_drive' || root === 'manuscripts') && (normalizedTypes.size === 0 || normalizedTypes.has('gdoc'))) {
        try {
          const driveResults = await searchDrive(query, limit);
          for (const file of driveResults) {
            if (results.length >= limit) break;
            results.push({
              root,
              path: file.name,
              name: file.name,
              type: file.mimeType,
              matchType: 'drive',
              fileId: file.id,
              url: file.webViewLink,
              modified: file.modifiedTime,
              size: file.size ? Number(file.size) : undefined,
            });
          }
        } catch (error) {
          results.push({
            root,
            path: '(google-drive-api)',
            type: 'error',
            matchType: 'error',
            snippet: error.message,
          });
        }
      }

      const rootPath = safeWorkspacePath(root, searchPath);
      const queryLower = query.toLowerCase();

      async function visit(dir) {
        if (results.length >= limit || Date.now() - startTime > maxTimeMs) return;
        let entries;
        try {
          entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
          return;
        }

        for (const entry of entries) {
          if (results.length >= limit || Date.now() - startTime > maxTimeMs) return;
          if (
            entry.name === '.git' ||
            entry.name === 'node_modules' ||
            entry.name === 'npm-cache' ||
            entry.name === '.Trash' ||
            entry.name === '.DS_Store'
          ) {
            continue;
          }

          const full = path.join(dir, entry.name);
          const rel = workspaceRelativePath(root, full);
          if (entry.isDirectory()) {
            await visit(full);
            continue;
          }

          if (!shouldIncludeType(rel)) continue;

          const stat = await fs.stat(full).catch(() => null);
          const nameMatches = rel.toLowerCase().includes(queryLower);
          if (nameMatches) {
            results.push({
              root,
              path: rel,
              name: entry.name,
              type: path.extname(entry.name).toLowerCase().replace(/^\./, '') || 'file',
              matchType: 'filename',
              size: stat?.size,
              modified: stat?.mtime?.toISOString(),
            });
            if (results.length >= limit) return;
            continue;
          }

          if (!LOCAL_SEARCH_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

          try {
            const content = await readLocalText(full);
            if (content.toLowerCase().includes(queryLower)) {
              results.push({
                root,
                path: rel,
                name: entry.name,
                type: path.extname(entry.name).toLowerCase().replace(/^\./, '') || 'text',
                matchType: 'content',
                snippet: snippet(content, query),
                size: stat?.size,
                modified: stat?.mtime?.toISOString(),
              });
            }
          } catch {
            // Ignore files that cannot be read or converted during search.
          }
        }
      }

      await visit(rootPath);
      const structured = { root, results: results.slice(0, limit) };
      return textResult(JSON.stringify(structured, null, 2), structured);
    }
  );

  server.registerTool(
    'drive.get_file_metadata',
    {
      title: 'Get Google Drive File Metadata',
      description: 'Resolve a Google Drive URL or file ID and return Drive metadata.',
      inputSchema: {
        url_or_file_id: z.string().describe('Google Drive/Docs URL or raw file ID'),
      },
      outputSchema: {
        id: z.string(),
        name: z.string(),
        mimeType: z.string(),
        modifiedTime: z.string().optional(),
        webViewLink: z.string().optional(),
      },
      annotations: { readOnlyHint: true, openWorldHint: true, destructiveHint: false },
    },
    async ({ url_or_file_id }) => {
      const metadata = await getDriveMetadata(url_or_file_id);
      return textResult(JSON.stringify(metadata, null, 2), metadata);
    }
  );

  server.registerTool(
    'drive.search',
    {
      title: 'Search Google Drive',
      description: 'Search Google Drive by file name and full text using the Drive API.',
      inputSchema: {
        query: z.string().min(1).describe('Search query'),
        limit: z.number().int().min(1).max(MAX_WORKSPACE_RESULTS).default(20),
      },
      outputSchema: {
        files: z.array(z.object({
          id: z.string(),
          name: z.string(),
          mimeType: z.string(),
          modifiedTime: z.string().optional(),
          webViewLink: z.string().optional(),
        })),
      },
      annotations: { readOnlyHint: true, openWorldHint: true, destructiveHint: false },
    },
    async ({ query, limit }) => {
      const files = await searchDrive(query, limit);
      return textResult(JSON.stringify(files, null, 2), { files });
    }
  );

  server.registerTool(
    'drive.read_doc',
    {
      title: 'Read Google Drive Doc',
      description: 'Export a native Google Doc, or download a Drive text file, as plain text for AI reading.',
      inputSchema: {
        url_or_file_id: z.string().describe('Google Docs/Drive URL or raw file ID'),
        format: z.enum(['text', 'markdown']).default('text').describe('Preferred export format for native Google Docs'),
      },
      outputSchema: {
        metadata: z.object({
          id: z.string(),
          name: z.string(),
          mimeType: z.string(),
          modifiedTime: z.string().optional(),
          webViewLink: z.string().optional(),
        }),
        exportedMimeType: z.string(),
        text: z.string(),
      },
      annotations: { readOnlyHint: true, openWorldHint: true, destructiveHint: false },
    },
    async ({ url_or_file_id, format }) => {
      const result = await exportDriveDoc(url_or_file_id, format);
      return textResult(result.text, result);
    }
  );

  server.registerTool(
    'secondbrain.import_drive_doc',
    {
      title: 'Import Drive Doc Snapshot',
      description: 'Export a Google Drive document and save a provenance-preserving snapshot into an allowed SecondBrain path.',
      inputSchema: {
        url_or_file_id: z.string().describe('Google Docs/Drive URL or raw file ID'),
        target_path: z.string().describe('SecondBrain path to write, normally raw/<slug>.md'),
        format: z.enum(['text', 'markdown']).default('text').describe('Preferred export format for native Google Docs'),
        snapshot: z.boolean().default(true).describe('When true, write the snapshot to target_path. When false, only return the text.'),
        overwrite: z.boolean().default(false).describe('When false, refuse to overwrite an existing snapshot file.'),
      },
      outputSchema: {
        path: z.string(),
        written: z.boolean(),
        metadata: z.object({
          id: z.string(),
          name: z.string(),
          mimeType: z.string(),
          modifiedTime: z.string().optional(),
          webViewLink: z.string().optional(),
        }),
        text: z.string(),
      },
      annotations: { readOnlyHint: false, openWorldHint: true, destructiveHint: false },
    },
    async ({ url_or_file_id, target_path, format, snapshot, overwrite }) => {
      const normalizedTarget = target_path.replace(/^\/+/, '');
      if (!isAllowedSecondBrainWritePath(normalizedTarget)) {
        throw new Error(`Refusing to write outside allowed SecondBrain paths: ${SECOND_BRAIN_WRITE_PREFIXES.join(', ')}`);
      }

      const result = await exportDriveDoc(url_or_file_id, format);
      const importedAt = new Date().toISOString();
      const body = [
        provenanceBlock({
          source: 'Google Drive',
          metadata: result.metadata,
          importedAt,
          savedPath: normalizedTarget,
        }),
        result.text.trim(),
        '',
      ].join('\n');

      if (snapshot) {
        const abs = safePath(normalizedTarget);
        if (!overwrite && await pathExists(abs)) {
          throw new Error(`Refusing to overwrite existing file: ${normalizedTarget}. Pass overwrite: true to replace it.`);
        }
        await fs.mkdir(path.dirname(abs), { recursive: true });
        await fs.writeFile(abs, body, 'utf8');
      }

      const structured = {
        path: normalizedTarget,
        written: Boolean(snapshot),
        metadata: result.metadata,
        text: body,
      };
      return textResult(JSON.stringify({
        path: normalizedTarget,
        written: Boolean(snapshot),
        metadata: result.metadata,
      }, null, 2), structured);
    }
  );

  server.registerTool(
    'drive.append_doc',
    {
      title: 'Append To Google Doc',
      description: 'Append text to the end of a native Google Doc. This does not overwrite existing document content.',
      inputSchema: {
        url_or_file_id: z.string().describe('Google Docs URL or raw file ID'),
        content: z.string().min(1).describe('Text to append'),
        add_newline_before: z.boolean().default(true).describe('Insert a newline before the appended content'),
        add_newline_after: z.boolean().default(true).describe('Insert a newline after the appended content'),
      },
      outputSchema: {
        documentId: z.string(),
        title: z.string(),
        insertedAt: z.number(),
        insertedLength: z.number(),
      },
      annotations: { readOnlyHint: false, openWorldHint: true, destructiveHint: false },
    },
    async ({ url_or_file_id, content, add_newline_before, add_newline_after }) => {
      const fileId = extractDriveFileId(url_or_file_id);
      const metadata = await getDriveMetadata(fileId);
      if (metadata.mimeType !== 'application/vnd.google-apps.document') {
        throw new Error(`drive.append_doc requires a native Google Doc. Got ${metadata.mimeType}`);
      }

      const document = await getGoogleDocument(fileId);
      const endIndex = documentEndIndex(document);
      const insertIndex = Math.max(1, endIndex - 1);
      const insertedText = `${add_newline_before ? '\n' : ''}${content}${add_newline_after ? '\n' : ''}`;

      await batchUpdateDocument(fileId, [{
        insertText: {
          location: { index: insertIndex },
          text: insertedText,
        },
      }]);

      const structured = {
        documentId: fileId,
        title: metadata.name,
        insertedAt: insertIndex,
        insertedLength: insertedText.length,
      };
      return textResult(JSON.stringify(structured, null, 2), structured);
    }
  );

  server.registerTool(
    'drive.replace_doc_text',
    {
      title: 'Replace Exact Text In Google Doc',
      description: 'Replace exact text in a native Google Doc only after verifying the expected match count. No blind full-document overwrite.',
      inputSchema: {
        url_or_file_id: z.string().describe('Google Docs URL or raw file ID'),
        old_text: z.string().min(1).describe('Exact text to find'),
        new_text: z.string().describe('Replacement text'),
        match_case: z.boolean().default(true).describe('Whether matching is case-sensitive'),
        expected_matches: z.number().int().min(1).max(100).default(1).describe('Required number of matches before replacement is allowed'),
      },
      outputSchema: {
        documentId: z.string(),
        title: z.string(),
        matchCount: z.number(),
        replacedText: z.string(),
      },
      annotations: { readOnlyHint: false, openWorldHint: true, destructiveHint: false },
    },
    async ({ url_or_file_id, old_text, new_text, match_case, expected_matches }) => {
      const fileId = extractDriveFileId(url_or_file_id);
      const metadata = await getDriveMetadata(fileId);
      if (metadata.mimeType !== 'application/vnd.google-apps.document') {
        throw new Error(`drive.replace_doc_text requires a native Google Doc. Got ${metadata.mimeType}`);
      }

      const document = await getGoogleDocument(fileId);
      const documentText = textFromStructuralElements(document.body?.content || []);
      const matchCount = countOccurrences(documentText, old_text, match_case);
      if (matchCount !== expected_matches) {
        throw new Error(`Refusing replacement: found ${matchCount} matches, expected ${expected_matches}.`);
      }

      await batchUpdateDocument(fileId, [{
        replaceAllText: {
          containsText: {
            text: old_text,
            matchCase: match_case,
          },
          replaceText: new_text,
        },
      }]);

      const structured = {
        documentId: fileId,
        title: metadata.name,
        matchCount,
        replacedText: old_text,
      };
      return textResult(JSON.stringify(structured, null, 2), structured);
    }
  );

  server.registerTool(
    'drive.create_doc',
    {
      title: 'Create Google Doc',
      description: 'Create a new Google Doc, optionally insert initial content, and optionally move it into a Drive folder.',
      inputSchema: {
        title: z.string().min(1).describe('New document title'),
        content: z.string().default('').describe('Initial text content'),
        parent_folder_id: z.string().optional().describe('Optional Drive folder ID to move the new document into'),
      },
      outputSchema: {
        documentId: z.string(),
        title: z.string(),
        url: z.string().optional(),
        parentFolderId: z.string().optional(),
      },
      annotations: { readOnlyHint: false, openWorldHint: true, destructiveHint: false },
    },
    async ({ title, content, parent_folder_id }) => {
      const createRes = await docsFetch('documents', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      const document = await createRes.json();
      const documentId = document.documentId;

      if (content.trim()) {
        await batchUpdateDocument(documentId, [{
          insertText: {
            location: { index: 1 },
            text: content.endsWith('\n') ? content : `${content}\n`,
          },
        }]);
      }

      if (parent_folder_id) {
        const metadata = await getDriveMetadata(documentId);
        const patchUrl = new URL(`https://www.googleapis.com/drive/v3/files/${documentId}`);
        patchUrl.searchParams.set('addParents', parent_folder_id);
        if (metadata.parents?.length) {
          patchUrl.searchParams.set('removeParents', metadata.parents.join(','));
        }
        patchUrl.searchParams.set('fields', 'id,name,parents,webViewLink');
        await driveFetch(patchUrl.toString(), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }

      const metadata = await getDriveMetadata(documentId);
      const structured = {
        documentId,
        title: metadata.name || title,
        url: metadata.webViewLink,
        parentFolderId: parent_folder_id,
      };
      return textResult(JSON.stringify(structured, null, 2), structured);
    }
  );

  // ─── Low-Level Filesystem Tools (for backwards compatibility/Gemini) ─────────

  server.tool(
    'list_directory',
    'List the files and subdirectories at a path inside ClaudeSecondBrain.',
    { dirPath: z.string().default('.').describe('Relative path from repo root') },
    async ({ dirPath }) => {
      const abs = safePath(dirPath);
      const entries = await fs.readdir(abs, { withFileTypes: true });
      const items = entries.map(e => ({
        name: e.name,
        type: e.isDirectory() ? 'directory' : 'file',
        path: path.relative(ROOT, path.join(abs, e.name)),
      }));
      return { content: [{ type: 'text', text: JSON.stringify(items, null, 2) }] };
    }
  );

  server.tool(
    'read_file',
    'Read the full text content of a file inside ClaudeSecondBrain.',
    { filePath: z.string().describe('Relative path from repo root') },
    async ({ filePath }) => {
      const abs = safePath(filePath);
      const content = await fs.readFile(abs, 'utf8');
      return { content: [{ type: 'text', text: content }] };
    }
  );

  server.tool(
    'write_file',
    'Write or overwrite a file inside ClaudeSecondBrain. Creates parent directories if needed.',
    {
      filePath: z.string().describe('Relative path from repo root'),
      content: z.string().describe('Full text content to write'),
    },
    async ({ filePath, content }) => {
      const abs = safePath(filePath);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, content, 'utf8');
      return { content: [{ type: 'text', text: `Written: ${filePath}` }] };
    }
  );

  server.tool(
    'append_file',
    'Append text to a file inside ClaudeSecondBrain. Ideal for updating change-log.md.',
    {
      filePath: z.string().describe('Relative path from repo root'),
      content: z.string().describe('Text to append'),
    },
    async ({ filePath, content }) => {
      const abs = safePath(filePath);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.appendFile(abs, content, 'utf8');
      return { content: [{ type: 'text', text: `Appended to: ${filePath}` }] };
    }
  );

  server.tool(
    'rename_file',
    'Rename or move a file within ClaudeSecondBrain. Used to mark raw files _done after processing.',
    {
      fromPath: z.string().describe('Current relative path'),
      toPath: z.string().describe('Target relative path'),
    },
    async ({ fromPath, toPath }) => {
      const absFrom = safePath(fromPath);
      const absTo = safePath(toPath);
      await fs.mkdir(path.dirname(absTo), { recursive: true });
      await fs.rename(absFrom, absTo);
      return { content: [{ type: 'text', text: `Renamed: ${fromPath} → ${toPath}` }] };
    }
  );

  server.tool(
    'create_directory',
    'Create a directory (and parent dirs) inside ClaudeSecondBrain.',
    { dirPath: z.string().describe('Relative path from repo root') },
    async ({ dirPath }) => {
      const abs = safePath(dirPath);
      await fs.mkdir(abs, { recursive: true });
      return { content: [{ type: 'text', text: `Created: ${dirPath}` }] };
    }
  );

  server.tool(
    'search_files',
    'Recursively find files inside ClaudeSecondBrain whose names match a pattern.',
    {
      pattern: z.string().describe('Substring to match against filenames (case-insensitive)'),
      dirPath: z.string().default('.').describe('Subtree to search, relative to repo root'),
    },
    async ({ pattern, dirPath }) => {
      const abs = safePath(dirPath);
      const results = [];

      async function walkDir(dir) {
        let entries;
        try { entries = await fs.readdir(dir, { withFileTypes: true }); }
        catch { return; }
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            await walkDir(full);
          } else if (e.name.toLowerCase().includes(pattern.toLowerCase())) {
            results.push(path.relative(ROOT, full));
          }
        }
      }

      await walkDir(abs);
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
  );

  server.tool(
    'get_file_info',
    'Get metadata (size, type, modified time) for a file or directory inside ClaudeSecondBrain.',
    { filePath: z.string().describe('Relative path from repo root') },
    async ({ filePath }) => {
      const abs = safePath(filePath);
      const stat = await fs.stat(abs);
      const info = {
        path: filePath,
        type: stat.isDirectory() ? 'directory' : 'file',
        size: stat.size,
        modified: stat.mtime.toISOString(),
        created: stat.birthtime.toISOString(),
      };
      return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
    }
  );

  server.tool(
    'move_drive_file',
    'Move a Google Drive file to a target folder by updating its parents.',
    {
      fileId: z.string().describe('The ID of the file to move'),
      targetFolderId: z.string().describe('The ID of the target folder to move the file into'),
      removeParentId: z.string().optional().describe('Optional parent folder ID to remove (if not provided, auto-detected)'),
    },
    async ({ fileId, targetFolderId, removeParentId }) => {
      const accessToken = await getGDriveAccessToken();

      // 1. Get current parents if removeParentId is not provided
      let previousParents = removeParentId;
      if (!previousParents) {
        const getRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!getRes.ok) {
          const errText = await getRes.text();
          throw new Error(`Failed to fetch file metadata: ${getRes.status} - ${errText}`);
        }
        const fileData = await getRes.json();
        previousParents = fileData.parents?.join(',');
      }

      // 2. Update parents
      const patchUrl = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`);
      patchUrl.searchParams.set('addParents', targetFolderId);
      if (previousParents) {
        patchUrl.searchParams.set('removeParents', previousParents);
      }
      patchUrl.searchParams.set('fields', 'id,name,parents,webViewLink');

      const patchRes = await fetch(patchUrl.toString(), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!patchRes.ok) {
        const errText = await patchRes.text();
        throw new Error(`Failed to move file in Google Drive: ${patchRes.status} - ${errText}`);
      }

      const result = await patchRes.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'read_file_range',
    'Read a byte or line window from a large text file in a configured safe root. Specify either start/length or line_start/line_count.',
    {
      root: z.enum(SAFE_ROOT_NAMES).describe(`Safe root to read from: ${SAFE_ROOT_NAMES.join(', ')}`),
      path: z.string().describe('Relative file path inside the safe root'),
      start: z.number().int().min(0).optional().describe('Start byte offset (inclusive, 0-based). Takes precedence over byte_start.'),
      length: z.number().int().min(1).optional().describe('Byte chunk length. Used with start/byte_start. Defaults to 100000.'),
      byte_start: z.number().int().min(0).optional().describe('Start byte offset (inclusive, 0-based)'),
      byte_end: z.number().int().min(1).optional().describe('End byte offset (exclusive). Defaults to byte_start + 100000 if not provided.'),
      line_start: z.number().int().min(1).optional().describe('Start line number (1-based, inclusive). Used when byte offsets are absent.'),
      line_end: z.number().int().min(1).optional().describe('End line number (1-based, inclusive). Defaults to line_start + 200 if not provided.'),
      line_count: z.number().int().min(1).optional().describe('Number of lines to read. Used with line_start. Takes precedence over line_end.'),
    },
    async ({ root, path: filePath, start, length, byte_start, byte_end, line_start, line_end, line_count }) => {
      const abs = safeWorkspacePath(root, filePath);
      const stat = await fs.stat(abs);
      if (!stat.isFile()) throw new Error(`${filePath} is not a file`);

      const CHUNK_LIMIT = 200000; // max bytes per range request

      // --- byte-offset mode ---
      const effectiveStart = start ?? byte_start;
      if (effectiveStart !== undefined) {
        const bStart = effectiveStart;
        const bLength = length ?? (byte_end !== undefined ? (byte_end - bStart) : CHUNK_LIMIT);
        const bEnd = Math.min(bStart + Math.min(bLength, CHUNK_LIMIT), stat.size);
        const readLen = bEnd - bStart;
        if (readLen <= 0) throw new Error(`effectiveStart (${bStart}) must be less than end (${bEnd})`);

        const buf = Buffer.alloc(readLen);
        const fh = await fs.open(abs, 'r');
        try {
          await fh.read(buf, 0, readLen, bStart);
        } finally {
          await fh.close();
        }
        const text = buf.toString('utf8');
        const structured = { root, path: filePath, file_size_bytes: stat.size, byte_start: bStart, byte_end: bEnd, text };
        return {
          content: [{ type: 'text', text }],
          structuredContent: structured,
        };
      }

      // --- line-offset mode ---
      const lStart = line_start ?? 1;
      let lEnd;
      if (line_count !== undefined) {
        lEnd = lStart + line_count - 1;
      } else {
        lEnd = line_end ?? (lStart + 200);
      }
      if (lStart < 1) throw new Error('line_start must be >= 1');
      if (lEnd < lStart) throw new Error('line_end must be >= line_start');

      const raw = await fs.readFile(abs, 'utf8'); // full read to count lines
      const allLines = raw.split('\n');
      const totalLines = allLines.length;
      const sliced = allLines.slice(lStart - 1, lEnd).join('\n');

      // compute approximate byte offsets for the slice
      const bytesBefore = Buffer.byteLength(allLines.slice(0, lStart - 1).join('\n') + (lStart > 1 ? '\n' : ''), 'utf8');
      const bytesSlice = Buffer.byteLength(sliced, 'utf8');

      const structured = {
        root,
        path: filePath,
        file_size_bytes: stat.size,
        total_lines: totalLines,
        byte_start: bytesBefore,
        byte_end: bytesBefore + bytesSlice,
        text: sliced,
      };
      return {
        content: [{ type: 'text', text: sliced }],
        structuredContent: structured,
      };
    }
  );

    return server;
  } catch (error) {
    console.error('[MCP] Failed to create server:', error);
    throw new Error(`Server creation failed: ${error.message}`);
  }
}

const app = express();

// Global timeout middleware (30 seconds)
app.use((req, res, next) => {
  const TIMEOUT = 30000; // 30 seconds
  
  // Set timeout for response
  res.setTimeout(TIMEOUT, () => {
    if (!res.headersSent) {
      console.error(`[Timeout] Request ${req.method} ${req.path} timed out after ${TIMEOUT}ms`);
      res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request timed out'
      });
    }
  });
  
  // Set timeout for socket
  req.socket.setTimeout(TIMEOUT);
  
  next();
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Transports trackers
const sseTransports = new Map();
const streamableTransports = {};

// Session cleanup function
function cleanupStaleSessions() {
  const now = Date.now();
  const staleThreshold = 5 * 60 * 1000; // 5 minutes
  
  // Clean up SSE sessions
  for (const [sessionId, transport] of sseTransports.entries()) {
    if (transport.closed) {
      sseTransports.delete(sessionId);
      console.log(`[Cleanup] Removed closed SSE session: ${sessionId}`);
    }
  }
  
  // Clean up Streamable HTTP sessions
  for (const sessionId in streamableTransports) {
    const session = streamableTransports[sessionId];
    if (!session || !session.transport || session.transport.closed) {
      delete streamableTransports[sessionId];
      console.log(`[Cleanup] Removed closed Streamable session: ${sessionId}`);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupStaleSessions, 60 * 1000);

// Health check with session status
app.get('/health', (_req, res) => {
  const sseSessions = Array.from(sseTransports.entries()).map(([id, transport]) => ({
    id,
    closed: transport.closed || false,
  }));
  
  const streamableSessions = Object.entries(streamableTransports).map(([id, session]) => ({
    id,
    hasTransport: !!session?.transport,
    transportClosed: session?.transport?.closed || true,
    hasServer: !!session?.server,
  }));
  
  res.json({
    status: 'ok',
    server: 'unified-secondbrain-mcp-server',
    root: ROOT,
    sseSessions: {
      total: sseSessions.length,
      active: sseSessions.filter(s => !s.closed).length,
      details: sseSessions,
    },
    streamableSessions: {
      total: streamableSessions.length,
      active: streamableSessions.filter(s => s.hasTransport && !s.transportClosed).length,
      details: streamableSessions,
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.type('text/plain').send('Unified SecondBrain MCP server. Supports /sse (SSE) and /mcp (Streamable HTTP).');
});

// ─── SSE Transport (for Gemini / standard clients) ─────────────────────────────

app.get('/sse', async (req, res) => {
  try {
    const transport = new SSEServerTransport('/messages', res);
    const connServer = createServer();
    
    // Set up cleanup before connecting
    const cleanup = () => {
      if (transport.sessionId) {
        sseTransports.delete(transport.sessionId);
        console.log(`[SSE] Client disconnected — session ${transport.sessionId}`);
      }
      try {
        transport.close();
      } catch (e) {
        // Ignore close errors
      }
    };
    
    res.on('close', cleanup);
    res.on('error', cleanup);
    
    // Store transport
    sseTransports.set(transport.sessionId, transport);
    
    // Connect with timeout
    const connectPromise = connServer.connect(transport);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SSE connection timeout')), 5000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log(`[SSE] Client connected — session ${transport.sessionId}`);
    
  } catch (error) {
    console.error(`[SSE] Connection error:`, error);
    if (!res.headersSent) {
      res.status(500).send('SSE connection failed');
    }
  }
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = sseTransports.get(sessionId);

  if (!transport) {
    return res.status(404).json({ error: `No active session: ${sessionId}` });
  }

  await transport.handlePostMessage(req, res);
});

// ─── Streamable HTTP Transport (for ChatGPT / Atlas) ───────────────────────────

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  try {
    let transport;
    let connServer;
    
    if (sessionId && streamableTransports[sessionId]) {
      // Existing session
      transport = streamableTransports[sessionId].transport;
      connServer = streamableTransports[sessionId].server;
      
      // Verify the transport is still valid
      if (!transport || transport.closed) {
        delete streamableTransports[sessionId];
        throw new Error(`Transport for session ${sessionId} is closed`);
      }
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New session initialization
      connServer = createServer();
      
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (initializedSessionId) => {
          console.log(`[MCP] Session initialized: ${initializedSessionId}`);
          if (transport && connServer) {
            streamableTransports[initializedSessionId] = { transport, server: connServer };
          } else {
            console.error(`[MCP] Failed to store session ${initializedSessionId}: transport or server missing`);
          }
        },
      });
      
      transport.onclose = () => {
        const id = transport?.sessionId;
        if (id) {
          console.log(`[MCP] Session closed: ${id}`);
          delete streamableTransports[id];
        }
      };
      
      // Connect with timeout and error handling
      const connectPromise = connServer.connect(transport);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log(`[MCP] New session connected, waiting for ID...`);
      
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Bad Request: no valid MCP session' },
        id: null,
      });
      return;
    }
    
    await transport.handleRequest(req, res, req.body);
    
  } catch (error) {
    console.error('MCP Streamable HTTP POST error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { 
          code: -32603, 
          message: `Internal server error: ${error.message}`,
          data: { sessionId }
        },
        id: null,
      });
    }
  }
});

app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !streamableTransports[sessionId]) {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Invalid or missing MCP session ID' },
      id: null,
    });
    return;
  }
  
  const session = streamableTransports[sessionId];
  if (!session?.transport || session.transport.closed) {
    delete streamableTransports[sessionId];
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Session transport is closed' },
      id: null,
    });
    return;
  }
  
  try {
    await session.transport.handleRequest(req, res);
  } catch (error) {
    console.error(`[MCP] GET error for session ${sessionId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !streamableTransports[sessionId]) {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Invalid or missing MCP session ID' },
      id: null,
    });
    return;
  }
  
  const session = streamableTransports[sessionId];
  try {
    if (session?.transport && !session.transport.closed) {
      await session.transport.handleRequest(req, res);
    }
    // Always clean up the session
    delete streamableTransports[sessionId];
    console.log(`[MCP] Session deleted: ${sessionId}`);
    
    if (!res.headersSent) {
      res.status(200).json({
        jsonrpc: '2.0',
        result: { sessionId, deleted: true },
        id: null,
      });
    }
  } catch (error) {
    console.error(`[MCP] DELETE error for session ${sessionId}:`, error);
    // Still clean up on error
    delete streamableTransports[sessionId];
    
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// ─── Start HTTP Server ─────────────────────────────────────────────────────────

const httpServer = app.listen(PORT, error => {
  if (error) {
    console.error('Failed to start ClaudeSecondBrain MCP server:', error);
    process.exit(1);
  }
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Unified SecondBrain MCP Server Listening                 ║
╠══════════════════════════════════════════════════════════════╣
║  SSE endpoint         →  http://localhost:${PORT}/sse           ║
║  SSE messages         →  http://localhost:${PORT}/messages      ║
║  Streamable HTTP path →  http://localhost:${PORT}/mcp           ║
║  Health endpoint      →  http://localhost:${PORT}/health        ║
║  Root path            →  ${ROOT.slice(0, 31)}...  ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

async function shutdown() {
  console.log('Shutting down Unified SecondBrain MCP server...');
  for (const sessionId of Object.keys(streamableTransports)) {
    const session = streamableTransports[sessionId];
    if (session?.transport) {
      await session.transport.close().catch(() => {});
    }
    delete streamableTransports[sessionId];
  }
  for (const sessionId of sseTransports.keys()) {
    const transport = sseTransports.get(sessionId);
    if (transport) await transport.close().catch(() => {});
    sseTransports.delete(sessionId);
  }
  httpServer.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
