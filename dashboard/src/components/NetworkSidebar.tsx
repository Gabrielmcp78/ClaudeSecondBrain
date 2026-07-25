/**
 * NetworkSidebar v3 — Node inspector with real content-tree navigation
 *
 * Modes:
 *   - Default: domain legend + connection narratives list (each domain is
 *     itself a clickable entry point into its full wiki tree)
 *   - Node selected: metadata, inbound/outbound connections, "browse
 *     domain tree" + "read source article" actions
 *   - Connection selected: full narrative, source/target paths, open
 *     either article or either domain's tree
 *   - Article/tree expanded: inline browser that handles BOTH single wiki
 *     articles and directory listings — clicking a folder drills in,
 *     clicking a file reads it, and a breadcrumb trail lets you climb
 *     back out. This is what turns "click an article" into "click
 *     through the connected content tree": a node's article is rarely
 *     the whole story — its neighboring files usually are.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  X, ArrowRight, ExternalLink, Map, FileText, ChevronLeft, Loader2,
  BookOpen, ArrowUpRight, Hash, Folder, FolderOpen, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import type { Connection } from '../types';
import { DOMAIN_COLORS } from '../types';

interface Props {
  connections: Connection[];
  selectedNodeId: string | null;
  selectedConnectionIdx: number | null;
  onSelectNode: (id: string | null) => void;
  onSelectConnection: (idx: number | null) => void;
  /** Lifted to App.tsx so double-clicking a node on the graph canvas can
   *  open the same viewer this sidebar renders. Pass null to close it —
   *  '' (empty string) is a valid, distinct value meaning "browse the
   *  wiki root", so closing must never be conflated with a falsy path. */
  articlePath: string | null;
  onOpenArticle: (path: string | null) => void;
}

interface WikiFile {
  type: 'file';
  path: string;
  content: string;
  size: number;
  modified: string;
}

interface WikiDirItem { name: string; type: 'dir' | 'file'; path: string }
interface WikiDir {
  type: 'directory';
  path: string;
  items: WikiDirItem[];
}

type WikiNode = WikiFile | WikiDir;

// ── Markdown renderer (no external dep) ───────────────────────────────────

function renderMarkdown(md: string): string {
  let html = md
    .replace(/^# (.+)$/gm, '<h1 class="text-base font-semibold text-white/90 mt-5 mb-2 pb-1 border-b border-white/10">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-semibold text-white/80 mt-4 mb-1.5">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xs font-semibold text-white/70 mt-3 mb-1">$1</h3>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/85 font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-white/70 italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[10px] bg-white/[0.07] text-indigo-300 px-1.5 py-0.5 rounded">$1</code>')
    .replace(/^---$/gm, '<hr class="border-white/10 my-3" />')
    .replace(/^[-*] (.+)$/gm, '<div class="flex gap-2 text-white/58 text-xs mb-1"><span class="shrink-0 mt-0.5 text-white/30">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="flex gap-2 text-white/58 text-xs mb-1"><span class="shrink-0 mt-0.5 text-white/30">›</span><span>$1</span></div>')
    .replace(/^> (.+)$/gm, '<div class="border-l-2 border-indigo-400/40 pl-3 text-white/50 text-xs italic my-2">$1</div>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '<span class="text-indigo-300/80">$1</span>')
    .replace(/\n\n/g, '</p><p class="text-white/58 text-xs leading-relaxed mb-2">')
    .replace(/\n/g, '<br/>');

  return `<p class="text-white/58 text-xs leading-relaxed mb-2">${html}</p>`;
}

/** Breadcrumb trail for a wiki path — every ancestor folder is clickable,
 *  the actual "click through the connected content tree" mechanism. */
function Breadcrumb({ path, onNavigate }: { path: string; onNavigate: (p: string) => void }) {
  const segments = path.split('/').filter(Boolean);
  return (
    <div className="flex items-center flex-wrap gap-1 font-mono text-[9px] text-white/35">
      <button onClick={() => onNavigate('')} className="hover:text-indigo-300 transition shrink-0">wiki</button>
      {segments.map((seg, i) => {
        const segPath = segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        return (
          <span key={segPath} className="flex items-center gap-1 shrink-0">
            <ChevronRightIcon size={9} className="text-white/20" />
            <button
              onClick={() => onNavigate(segPath)}
              className={`hover:text-indigo-300 transition truncate max-w-[110px] ${isLast ? 'text-white/60' : ''}`}
              title={seg}
            >
              {seg.replace(/\.md$/, '')}
            </button>
          </span>
        );
      })}
    </div>
  );
}

// ── Article / tree viewer ───────────────────────────────────────────────────
// Handles both outcomes of GET /api/wiki/*: a single markdown file, or a
// directory listing. Previously only the file case was handled — opening
// a domain or folder path dead-ended. Now a directory renders as a real
// clickable tree, and clicking any child (folder or file) navigates
// deeper without leaving the sidebar.

function ArticleViewer({
  wikiPath,
  onBack,
}: {
  wikiPath: string;
  onBack: () => void;
}) {
  const [currentPath, setCurrentPath] = useState(wikiPath);
  const [node, setNode] = useState<WikiNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only re-seed from the incoming prop when a NEW entry point is opened
  // from outside (a different node/connection click) — internal folder
  // navigation manages currentPath itself below.
  useEffect(() => { setCurrentPath(wikiPath); }, [wikiPath]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setNode(null);
    const url = currentPath ? `/api/wiki/${currentPath}` : '/api/wiki/';
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then((data: WikiNode) => { setNode(data); setLoading(false); })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, [currentPath]);

  const navigate = useCallback((path: string) => setCurrentPath(path), []);

  const filename = currentPath.split('/').pop() ?? currentPath;
  const domain = currentPath.split('/')[0] ?? '';
  const color = DOMAIN_COLORS[domain] ?? '#475569';
  const parentPath = currentPath.split('/').slice(0, -1).join('/');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 shrink-0 gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 hover:text-white/80 transition shrink-0"
        >
          <ChevronLeft size={12} /> Back
        </button>
        {node?.type === 'file' && (
          <a
            href={`/wiki/${currentPath}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/65 transition shrink-0"
          >
            <ExternalLink size={10} /> Raw
          </a>
        )}
      </div>

      <div className="mb-3 shrink-0">
        <Breadcrumb path={currentPath} onNavigate={navigate} />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-white/40 text-xs font-mono py-4">
          <Loader2 size={13} className="animate-spin" /> Loading…
        </div>
      )}

      {error && (
        <div className="text-red-400 text-xs font-mono py-4">Error: {error}</div>
      )}

      {node?.type === 'directory' && (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <div className="glass-inner rounded-xl px-3 py-2.5 shrink-0 flex items-center gap-2">
            <FolderOpen size={14} style={{ color }} />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-white/88 truncate">{filename || 'wiki'}</div>
              <div className="font-mono text-[9px] text-white/30">{node.items.length} item{node.items.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {currentPath && (
              <button
                onClick={() => navigate(parentPath)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg glass-row-hover text-white/40 hover:text-white/75 transition text-xs font-mono"
              >
                <ChevronLeft size={12} /> ..
              </button>
            )}
            {node.items
              .slice()
              .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1))
              .map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg glass-inner hover:bg-white/[0.06] transition text-left"
                >
                  {item.type === 'dir'
                    ? <Folder size={13} className="shrink-0" style={{ color }} />
                    : <FileText size={13} className="shrink-0 text-white/35" />}
                  <span className="text-xs text-white/75 truncate flex-1">{item.name.replace(/\.md$/, '')}</span>
                  <ChevronRightIcon size={11} className="text-white/20 shrink-0" />
                </button>
              ))}
            {node.items.length === 0 && (
              <p className="text-white/25 font-mono text-xs px-1 py-2">Empty folder.</p>
            )}
          </div>
        </div>
      )}

      {node?.type === 'file' && (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <div className="glass-inner rounded-xl px-3 py-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono text-[9px] uppercase" style={{ color }}>{domain}</div>
              {parentPath !== currentPath && (
                <button onClick={() => navigate(parentPath)} className="flex items-center gap-1 text-[9px] font-mono text-white/30 hover:text-indigo-300 transition shrink-0">
                  <Folder size={9} /> Browse folder
                </button>
              )}
            </div>
            <div className="font-semibold text-sm text-white/88">{filename.replace('.md', '')}</div>
            <div className="font-mono text-[9px] text-white/25 mt-0.5">
              {Math.round(node.size / 1024 * 10) / 10} KB
              {node.modified && ` · ${new Date(node.modified).toLocaleDateString()}`}
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto glass-inner rounded-xl p-4 min-h-0"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(node.content) }}
          />
        </div>
      )}
    </div>
  );
}

// ── Node Inspector ─────────────────────────────────────────────────────────

function NodeInspector({
  nodeId,
  connections,
  onSelectNode,
  onSelectConnection,
  onOpenArticle,
}: {
  nodeId: string;
  connections: Connection[];
  onSelectNode: (id: string | null) => void;
  onSelectConnection: (idx: number | null) => void;
  onOpenArticle: (path: string) => void;
}) {
  const outbound = connections.map((c, idx) => ({ c, idx })).filter(({ c }) => c.source === nodeId);
  const inbound  = connections.map((c, idx) => ({ c, idx })).filter(({ c }) => c.target === nodeId);
  const label    = nodeId.split('/').pop() ?? nodeId;
  const parts    = nodeId.split('/');
  const domain   = parts[0] || 'unknown';
  const color    = DOMAIN_COLORS[domain] ?? '#475569';

  const wikiPath = connections.find(c => c.source === nodeId)?.sourcePath
    ?? connections.find(c => c.target === nodeId)?.targetPath
    ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color }}>{domain}</div>
          <h3 className="text-base font-semibold text-white/90 leading-snug">{label}</h3>
          {parts.length > 1 && (
            <div className="font-mono text-xs text-white/35 mt-0.5 break-all">{nodeId}</div>
          )}
        </div>
        <button onClick={() => onSelectNode(null)} className="p-1.5 glass-row-hover rounded-lg text-white/35 hover:text-white/80 transition shrink-0">
          <X size={13} />
        </button>
      </div>

      {/* Primary actions — a node is never just a title line: it opens
          either straight into its own article, or into the full tree of
          content around it. */}
      <div className="grid grid-cols-1 gap-2">
        {wikiPath && (
          <button
            onClick={() => onOpenArticle(wikiPath)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs uppercase transition bg-indigo-500/12 hover:bg-indigo-500/22 text-indigo-300 border border-indigo-400/20"
          >
            <BookOpen size={12} /> Read source article
          </button>
        )}
        <button
          onClick={() => onOpenArticle(domain)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs uppercase transition glass-inner hover:bg-white/[0.06] text-white/60 hover:text-white/85"
        >
          <FolderOpen size={12} style={{ color }} /> Browse {domain} tree
        </button>
      </div>

      {/* Connection counts */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        {[['Out', outbound.length], ['In', inbound.length], ['Total', outbound.length + inbound.length]].map(([label, val]) => (
          <div key={label as string} className="flex flex-col items-center px-3 py-2 glass-inner rounded-xl">
            <span className="text-lg font-bold text-white/85">{val}</span>
            <span className="text-white/30">{label}</span>
          </div>
        ))}
      </div>

      {outbound.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase text-white/35 mb-2 flex items-center gap-1">
            <ArrowUpRight size={10} /> Links to ({outbound.length})
          </div>
          <div className="space-y-2">
            {outbound.map(({ c, idx }) => {
              const tgtLabel = c.target.split('/').pop() ?? c.target;
              const tColor = DOMAIN_COLORS[c.targetDomain ?? 'unknown'] ?? '#475569';
              return (
                <div key={idx} className="glass-inner rounded-xl px-3 py-2.5 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: tColor }} />
                    <div className="flex-1 min-w-0">
                      <button onClick={() => onSelectConnection(idx)} className="text-xs font-semibold text-white/80 hover:text-white transition text-left">
                        {tgtLabel}
                      </button>
                      {c.description && <p className="text-[10px] text-white/48 leading-snug mt-0.5">{c.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 pl-3.5">
                    {c.targetPath && (
                      <button
                        onClick={() => onOpenArticle(c.targetPath!)}
                        className="flex items-center gap-1 text-[9px] font-mono text-indigo-400/70 hover:text-indigo-300 transition"
                      >
                        <FileText size={9} /> View article
                      </button>
                    )}
                    <button
                      onClick={() => onSelectNode(c.target)}
                      className="flex items-center gap-1 text-[9px] font-mono text-white/30 hover:text-white/60 transition"
                    >
                      <Hash size={9} /> Navigate to node
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {inbound.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase text-white/35 mb-2 flex items-center gap-1">
            <ArrowRight size={10} className="rotate-180" /> Linked from ({inbound.length})
          </div>
          <div className="space-y-2">
            {inbound.map(({ c, idx }) => {
              const srcLabel = c.source.split('/').pop() ?? c.source;
              const sColor = DOMAIN_COLORS[c.sourceDomain ?? 'unknown'] ?? '#475569';
              return (
                <div key={idx} className="glass-inner rounded-xl px-3 py-2.5 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: sColor }} />
                    <div className="flex-1 min-w-0">
                      <button onClick={() => onSelectConnection(idx)} className="text-xs font-medium text-white/72 hover:text-white transition text-left">
                        {srcLabel}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 pl-3.5">
                    {c.sourcePath && (
                      <button
                        onClick={() => onOpenArticle(c.sourcePath!)}
                        className="flex items-center gap-1 text-[9px] font-mono text-indigo-400/70 hover:text-indigo-300 transition"
                      >
                        <FileText size={9} /> View article
                      </button>
                    )}
                    <button
                      onClick={() => onSelectNode(c.source)}
                      className="flex items-center gap-1 text-[9px] font-mono text-white/30 hover:text-white/60 transition"
                    >
                      <Hash size={9} /> Navigate to node
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Connection Inspector ───────────────────────────────────────────────────

function ConnectionInspector({
  connection,
  onClose,
  onSelectNode,
  onOpenArticle,
}: {
  connection: Connection;
  onClose: () => void;
  onSelectNode: (id: string | null) => void;
  onOpenArticle: (path: string) => void;
}) {
  const srcLabel = connection.source.split('/').pop() ?? connection.source;
  const tgtLabel = connection.target.split('/').pop() ?? connection.target;
  const srcColor = DOMAIN_COLORS[connection.sourceDomain ?? 'unknown'] ?? '#475569';
  const tgtColor = DOMAIN_COLORS[connection.targetDomain ?? 'unknown'] ?? '#475569';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs uppercase text-indigo-300">Connection</span>
        <button onClick={onClose} className="p-1.5 glass-row-hover rounded-lg text-white/35 hover:text-white/80 transition">
          <X size={13} />
        </button>
      </div>

      <div className="glass-inner rounded-xl p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: `${srcColor}15`, border: `1px solid ${srcColor}30` }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: srcColor }} />
            <span className="text-white/82 font-medium">{srcLabel}</span>
          </div>
          <ArrowRight size={12} className="text-white/25 shrink-0" />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: `${tgtColor}15`, border: `1px solid ${tgtColor}30` }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tgtColor }} />
            <span className="text-white/82 font-medium">{tgtLabel}</span>
          </div>
        </div>

        {connection.description && (
          <p className="text-xs text-white/65 leading-relaxed">{connection.description}</p>
        )}
      </div>

      {/* Domain info — clickable straight into that domain's tree */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button onClick={() => onOpenArticle(connection.sourceDomain)} className="glass-inner hover:bg-white/[0.06] rounded-xl p-2.5 text-left transition">
          <span className="font-mono text-[9px] text-white/30 uppercase block mb-1">Source domain</span>
          <span className="font-mono text-sm font-semibold" style={{ color: srcColor }}>{connection.sourceDomain}</span>
        </button>
        <button onClick={() => onOpenArticle(connection.targetDomain)} className="glass-inner hover:bg-white/[0.06] rounded-xl p-2.5 text-left transition">
          <span className="font-mono text-[9px] text-white/30 uppercase block mb-1">Target domain</span>
          <span className="font-mono text-sm font-semibold" style={{ color: tgtColor }}>{connection.targetDomain}</span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="font-mono text-[9px] text-white/30 uppercase">Open source material</div>
        <div className="grid grid-cols-2 gap-2">
          {connection.sourcePath && (
            <button
              onClick={() => onOpenArticle(connection.sourcePath!)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl glass-inner text-xs font-mono text-white/55 hover:text-white/85 transition"
              style={{ borderColor: `${srcColor}30` }}
            >
              <BookOpen size={11} style={{ color: srcColor }} /> Source article
            </button>
          )}
          {connection.targetPath && (
            <button
              onClick={() => onOpenArticle(connection.targetPath!)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl glass-inner text-xs font-mono text-white/55 hover:text-white/85 transition"
            >
              <BookOpen size={11} style={{ color: tgtColor }} /> Target article
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { onClose(); onSelectNode(connection.source); }}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl glass-inner text-[10px] font-mono text-white/40 hover:text-white/70 transition"
          >
            <Hash size={10} /> Source node
          </button>
          <button
            onClick={() => { onClose(); onSelectNode(connection.target); }}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl glass-inner text-[10px] font-mono text-white/40 hover:text-white/70 transition"
          >
            <Hash size={10} /> Target node
          </button>
        </div>
        <a
          href="/wiki/_connections.md"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl glass-inner text-[10px] font-mono text-white/35 hover:text-white/65 transition"
        >
          <Map size={10} /> Full connection map <ExternalLink size={9} />
        </a>
      </div>
    </div>
  );
}

// ── Domain Legend ──────────────────────────────────────────────────────────

function DomainLegend({
  connections,
  onSelectConnection,
  onOpenArticle,
}: {
  connections: Connection[];
  onSelectConnection: (idx: number | null) => void;
  onOpenArticle: (path: string) => void;
}) {
  const domains = Array.from(
    new Set(connections.flatMap(c => [c.sourceDomain, c.targetDomain]))
  ).filter(Boolean);

  if (domains.length === 0) {
    return (
      <div className="space-y-3">
        <div className="font-mono text-xs uppercase text-white/35 tracking-wider">Knowledge Graph</div>
        <p className="text-sm text-white/45 leading-relaxed">
          No connections in <code className="font-mono bg-white/[0.06] px-1 py-0.5 rounded">wiki/_connections.md</code> yet.
        </p>
        <button
          onClick={() => onOpenArticle('')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs uppercase transition glass-inner hover:bg-white/[0.06] text-white/60 hover:text-white/85"
        >
          <FolderOpen size={12} /> Browse wiki tree
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="font-mono text-[10px] uppercase text-white/35 tracking-wider mb-2">Domains</div>
        <div className="grid grid-cols-2 gap-1.5">
          {domains.map(d => (
            <button
              key={d}
              onClick={() => onOpenArticle(d)}
              className="flex items-center gap-2 text-xs px-2.5 py-2 glass-inner hover:bg-white/[0.06] rounded-lg transition text-left"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DOMAIN_COLORS[d] ?? '#475569' }} />
              <span className="text-white/60 truncate flex-1">{d}</span>
              <ChevronRightIcon size={10} className="text-white/20 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-white/38 leading-relaxed">
        Click any node to inspect its connections and open source articles, or double-click a node on the canvas to jump straight in. Click a domain above to browse its full content tree.
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase text-white/35 tracking-wider mb-2">
          All connections ({connections.length})
        </div>
        <div className="space-y-2">
          {connections.map((connection, idx) => {
            const srcLabel = connection.source.split('/').pop() ?? connection.source;
            const tgtLabel = connection.target.split('/').pop() ?? connection.target;
            const srcColor = DOMAIN_COLORS[connection.sourceDomain ?? 'unknown'] ?? '#475569';
            const tgtColor = DOMAIN_COLORS[connection.targetDomain ?? 'unknown'] ?? '#475569';
            return (
              <div key={`${connection.source}-${connection.target}-${idx}`} className="glass-inner rounded-xl px-3 py-3 space-y-2">
                <button onClick={() => onSelectConnection(idx)} className="w-full text-left space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: srcColor }} />
                    <span className="font-medium text-white/78">{srcLabel}</span>
                    <ArrowRight size={10} className="text-white/25 shrink-0" />
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tgtColor }} />
                    <span className="font-medium text-white/78">{tgtLabel}</span>
                  </div>
                  {connection.description && (
                    <p className="text-[10px] text-white/45 leading-snug pl-3">{connection.description}</p>
                  )}
                </button>
                <div className="flex gap-2 pl-3">
                  {connection.sourcePath && (
                    <button
                      onClick={() => onOpenArticle(connection.sourcePath!)}
                      className="flex items-center gap-1 text-[9px] font-mono text-indigo-400/65 hover:text-indigo-300 transition"
                    >
                      <FileText size={9} /> {srcLabel}
                    </button>
                  )}
                  {connection.targetPath && connection.targetPath !== connection.sourcePath && (
                    <button
                      onClick={() => onOpenArticle(connection.targetPath!)}
                      className="flex items-center gap-1 text-[9px] font-mono text-indigo-400/65 hover:text-indigo-300 transition"
                    >
                      <FileText size={9} /> {tgtLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────

export default function NetworkSidebar({
  connections,
  selectedNodeId,
  selectedConnectionIdx,
  onSelectNode,
  onSelectConnection,
  articlePath,
  onOpenArticle,
}: Props) {
  return (
    <div className="glass-panel rounded-xl p-5 h-full min-h-0 overflow-y-auto min-w-[280px] flex flex-col gap-4">
      {articlePath !== null ? (
        <ArticleViewer wikiPath={articlePath} onBack={() => onOpenArticle(null)} />
      ) : selectedNodeId ? (
        <NodeInspector
          nodeId={selectedNodeId}
          connections={connections}
          onSelectNode={onSelectNode}
          onSelectConnection={onSelectConnection}
          onOpenArticle={onOpenArticle}
        />
      ) : selectedConnectionIdx !== null && connections[selectedConnectionIdx] ? (
        <ConnectionInspector
          connection={connections[selectedConnectionIdx]}
          onClose={() => onSelectConnection(null)}
          onSelectNode={onSelectNode}
          onOpenArticle={onOpenArticle}
        />
      ) : (
        <DomainLegend
          connections={connections}
          onSelectConnection={onSelectConnection}
          onOpenArticle={onOpenArticle}
        />
      )}
    </div>
  );
}
