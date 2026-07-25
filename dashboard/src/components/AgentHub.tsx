/**
 * AgentHub v2 — Situational Command & Control
 *
 * Architecture:
 *   - Hierarchy strip: Gabriel at top, agents ranked below with live role/status
 *   - Per-agent panels: full task list, inbox reader, outbox reader, dispatch composer
 *   - Command dispatch: send prioritized directed messages with task refs
 *   - Task delegation: create new tasks assigned to any agent from the hub
 *   - Inter-agent visibility: each agent's outbox surfaces what they've reported
 *   - No information hidden behind collapsed stubs; all data scannable at a glance
 *
 * Agent roster is fully data-driven via `agentConfigs` (GET /api/agents/registry
 * — see server/agentRegistry.ts). There is no hardcoded agent list anywhere in
 * this file anymore; adding or removing an agent (Cursor was removed this way)
 * happens in Setup → Agents, not in code.
 *
 * `canDispatch` / `canDelegate` gate the write actions per the viewer's role —
 * a Viewer-permission member gets a fully read-only Agent Hub.
 */

import { useState, useCallback } from 'react';
import {
  ChevronDown, ChevronRight, Send, Plus, AlertTriangle,
  CheckCircle2, Clock, Circle, XCircle, Inbox, Megaphone,
  ArrowUpRight, Zap, RefreshCw, Eye, FileText, Lock
} from 'lucide-react';
import type { AgentStatus, Task, AgentConfig, InboxEntry } from '../types';
import { buildAgentMaps } from '../types';

interface Props {
  agents: AgentStatus[];
  tasks: Task[];
  agentConfigs: AgentConfig[];
  onRefresh: () => void;
  canDispatch: boolean;
  canDelegate: boolean;
  commanderName: string;
}

// ── Sub-types ──────────────────────────────────────────────────────────────

type Panel = 'tasks' | 'inbox' | 'outbox' | 'dispatch' | 'delegate';
type Priority = 'high' | 'normal' | 'low';

interface InboxContent { agent: string; content: string; entries: InboxEntry[] }
interface OutboxContent { agent: string; content: string }

// ── Helpers ────────────────────────────────────────────────────────────────

function isActive(agent: AgentStatus): boolean {
  if (!agent.lastActive || agent.lastActive === '—') return false;
  // status.md's "Last active" line is free text agents append context to
  // (e.g. "2026-07-16 (dashboard bug-fix session)"), which `new Date()`
  // fails to parse and silently reports as inactive with no error. Pull
  // out the leading YYYY-MM-DD token first so a trailing annotation can't
  // quietly turn an active agent into a "dormant" one.
  const dateMatch = agent.lastActive.match(/\d{4}-\d{2}-\d{2}/);
  const last = new Date(dateMatch ? dateMatch[0] : agent.lastActive);
  if (Number.isNaN(last.getTime())) return false;
  return (Date.now() - last.getTime()) / 1000 / 3600 < 24;
}

function taskStatusIcon(status: Task['status']) {
  switch (status) {
    case 'in-progress': return <Zap size={11} className="text-indigo-400 shrink-0" />;
    case 'complete':    return <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />;
    case 'blocked':     return <AlertTriangle size={11} className="text-red-400 shrink-0" />;
    case 'cancelled':   return <XCircle size={11} className="text-white/25 shrink-0" />;
    default:            return <Circle size={11} className="text-white/35 shrink-0" />;
  }
}

function priorityBadge(p: Priority) {
  const map = { high: 'text-red-400 bg-red-400/10', normal: 'text-yellow-400 bg-yellow-400/10', low: 'text-white/35 bg-white/5' };
  return (
    <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded ${map[p]}`}>{p}</span>
  );
}

/** One inbox message rendered as a scannable card — date, sender, priority,
 *  and the message body with its line breaks preserved — instead of the
 *  entire inbox.md dumped as one run-on paragraph of raw markdown. */
function InboxEntryCard({ entry }: { entry: InboxEntry }) {
  const priorityStyle = entry.priority === 'high'
    ? 'text-red-400 bg-red-400/10'
    : entry.priority === 'low'
      ? 'text-white/35 bg-white/5'
      : entry.priority
        ? 'text-yellow-400 bg-yellow-400/10'
        : '';

  return (
    <div className="glass-inner rounded-lg px-3 py-2.5 space-y-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-white/80 font-medium text-xs truncate">{entry.from}</span>
          <span className="font-mono text-[9px] text-white/30 shrink-0">{entry.date}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {entry.taskRef && (
            <span className="font-mono text-[9px] text-indigo-300/70 bg-indigo-400/10 px-1.5 py-0.5 rounded">{entry.taskRef}</span>
          )}
          {entry.priority && (
            <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded ${priorityStyle}`}>{entry.priority}</span>
          )}
        </div>
      </div>
      <p className="text-white/60 text-[11px] leading-relaxed whitespace-pre-wrap">{entry.message || '(no message body)'}</p>
    </div>
  );
}

async function api<T>(method: string, url: string, body?: object): Promise<T | null> {
  try {
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return r.ok ? (r.json() as Promise<T>) : null;
  } catch { return null; }
}

// ── Markdown to simple HTML (no deps) ─────────────────────────────────────

function mdToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h3 class="text-white/75 font-semibold text-sm mt-4 mb-1">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="text-white/60 font-semibold text-xs mt-3 mb-1">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/85">$1</strong>')
    .replace(/^---$/gm, '<hr class="border-white/10 my-3" />')
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 text-white/55 text-xs mb-0.5"><span>•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, ' ');
}

// ── Agent Panel ────────────────────────────────────────────────────────────

function AgentPanel({
  agent,
  tasks,
  colors,
  labels,
  canDispatch,
  canDelegate,
  openPanel,
  onTogglePanel,
  onRefresh,
}: {
  agent: AgentStatus;
  tasks: Task[];
  colors: Record<string, string>;
  labels: Record<string, string>;
  canDispatch: boolean;
  canDelegate: boolean;
  openPanel: Panel | null;
  onTogglePanel: (p: Panel | null) => void;
  onRefresh: () => void;
}) {
  const color = colors[agent.name] ?? '#475569';
  const active = isActive(agent);
  const agentTasks = tasks.filter(t => t.owner.toLowerCase().includes(agent.name));
  const openTasks = agentTasks.filter(t => t.status !== 'complete' && t.status !== 'cancelled');
  const blockedTasks = agentTasks.filter(t => t.status === 'blocked');

  // Inbox / outbox content cache
  const [inboxContent, setInboxContent] = useState<InboxContent | null>(null);
  const [outboxContent, setOutboxContent] = useState<OutboxContent | null>(null);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingOutbox, setLoadingOutbox] = useState(false);

  // Dispatch state
  const [dispatchMsg, setDispatchMsg] = useState('');
  const [dispatchPriority, setDispatchPriority] = useState<Priority>('normal');
  const [dispatchTaskRef, setDispatchTaskRef] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<'ok' | 'err' | null>(null);

  // Delegate state
  const [delegateTitle, setDelegateTitle] = useState('');
  const [delegatePriority, setDelegatePriority] = useState<Priority>('normal');
  const [delegateProject, setDelegateProject] = useState('ClaudeSecondBrain');
  const [delegateNotes, setDelegateNotes] = useState('');
  const [delegating, setDelegating] = useState(false);
  const [delegateResult, setDelegateResult] = useState<'ok' | 'err' | null>(null);

  const loadInbox = useCallback(async () => {
    if (inboxContent) return;
    setLoadingInbox(true);
    const r = await api<InboxContent>('GET', `/api/agents/${agent.name}/inbox`);
    if (r) setInboxContent(r);
    setLoadingInbox(false);
  }, [agent.name, inboxContent]);

  const loadOutbox = useCallback(async () => {
    if (outboxContent) return;
    setLoadingOutbox(true);
    const r = await api<OutboxContent>('GET', `/api/agents/${agent.name}/outbox`);
    if (r) setOutboxContent(r);
    setLoadingOutbox(false);
  }, [agent.name, outboxContent]);

  const handlePanelToggle = (p: Panel) => {
    if (openPanel === p) { onTogglePanel(null); return; }
    onTogglePanel(p);
    if (p === 'inbox') loadInbox();
    if (p === 'outbox') loadOutbox();
  };

  const handleDispatch = async () => {
    if (!dispatchMsg.trim()) return;
    setDispatching(true);
    const r = await api('POST', `/api/agents/${agent.name}/dispatch`, {
      message: dispatchMsg,
      priority: dispatchPriority,
      taskRef: dispatchTaskRef,
    });
    setDispatchResult(r ? 'ok' : 'err');
    if (r) { setDispatchMsg(''); setDispatchTaskRef(''); setInboxContent(null); }
    setDispatching(false);
    setTimeout(() => setDispatchResult(null), 3500);
    onRefresh();
  };

  const handleDelegate = async () => {
    if (!delegateTitle.trim()) return;
    setDelegating(true);
    const r = await api('POST', '/api/tasks', {
      title: delegateTitle,
      owner: agent.name,
      priority: delegatePriority,
      project: delegateProject,
      notes: delegateNotes,
    });
    setDelegateResult(r ? 'ok' : 'err');
    if (r) { setDelegateTitle(''); setDelegateNotes(''); }
    setDelegating(false);
    setTimeout(() => setDelegateResult(null), 3500);
    onRefresh();
  };

  const panelDefs: [Panel, string, React.FC<{ size?: number; className?: string }>, boolean][] = [
    ['tasks', 'Tasks', FileText, true],
    ['inbox', 'Inbox', Inbox, true],
    ['outbox', 'Reports', Eye, true],
    ['dispatch', 'Dispatch', Send, canDispatch],
    ['delegate', 'Delegate', Plus, canDelegate],
  ];

  return (
    <div
      className="glass-panel rounded-xl overflow-hidden flex flex-col"
      style={{ borderTopColor: color, borderTopWidth: 2 }}
    >
      {/* ── Header bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b glass-divider">
        <div className="relative shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-base"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {labels[agent.name]?.[0] ?? '?'}
          </div>
          {active && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full pulse-dot" style={{ backgroundColor: color }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-sm text-white/90">{labels[agent.name] ?? agent.name}</div>
          <div className="font-mono text-[9px] text-white/35 uppercase flex items-center gap-2">
            <span style={{ color: active ? color : undefined }}>{active ? '● Active' : '○ Dormant'}</span>
            {agent.currentTask && agent.currentTask !== '—' && (
              <span className="truncate max-w-[180px] text-white/40">{agent.currentTask}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {blockedTasks.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-red-400/10 text-red-400">
              <AlertTriangle size={9} /> {blockedTasks.length}
            </span>
          )}
          {agent.inboxCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono" style={{ backgroundColor: `${color}18`, color }}>
              <Inbox size={9} /> {agent.inboxCount}
            </span>
          )}
          <span className="font-mono text-[9px] text-white/25">{openTasks.length} tasks</span>
        </div>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-4 divide-x glass-divider border-b glass-divider">
        {[
          ['Open', openTasks.length, 'text-white/70'],
          ['In progress', agentTasks.filter(t => t.status === 'in-progress').length, 'text-indigo-400'],
          ['Blocked', blockedTasks.length, blockedTasks.length > 0 ? 'text-red-400' : 'text-white/30'],
          ['Done', agentTasks.filter(t => t.status === 'complete').length, 'text-emerald-400'],
        ].map(([label, val, cls]) => (
          <div key={label as string} className="flex flex-col items-center py-2">
            <span className={`font-display text-lg font-bold ${cls}`}>{val}</span>
            <span className="font-mono text-[8px] text-white/30 uppercase">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Panel toggles ── */}
      <div className="flex border-b glass-divider">
        {panelDefs.map(([id, label, Icon, enabled]) => (
          <button
            key={id}
            onClick={() => enabled && handlePanelToggle(id)}
            disabled={!enabled}
            title={enabled ? undefined : 'Your role does not have this permission'}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-mono uppercase transition ${
              !enabled ? 'text-white/15 cursor-not-allowed' :
              openPanel === id ? 'bg-white/[0.06] text-white/85' : 'text-white/32 hover:text-white/60 hover:bg-white/[0.03]'
            }`}
            style={enabled && openPanel === id ? { color } : undefined}
          >
            {enabled ? <Icon size={10} /> : <Lock size={10} />}
            {label}
          </button>
        ))}
      </div>

      {/* ── Panel content ── */}
      {openPanel && (
        <div className="p-4 max-h-80 overflow-y-auto text-sm space-y-3">

          {/* TASKS panel */}
          {openPanel === 'tasks' && (
            <div className="space-y-2">
              {agentTasks.length === 0 && (
                <p className="text-white/35 text-xs font-mono">No tasks assigned to {labels[agent.name] ?? agent.name}.</p>
              )}
              {agentTasks.map(t => (
                <div key={t.id} className="glass-inner rounded-lg px-3 py-2.5 space-y-1">
                  <div className="flex items-center gap-2">
                    {taskStatusIcon(t.status)}
                    <span className="text-white/82 font-medium text-xs flex-1 min-w-0 truncate">{t.title}</span>
                    {priorityBadge(t.priority as Priority)}
                  </div>
                  <div className="font-mono text-[9px] text-white/30 flex items-center gap-2 pl-5">
                    <span className="uppercase">{t.status}</span>
                    <span>·</span>
                    <span>{t.project}</span>
                    {t.id && <span>· {t.id}</span>}
                  </div>
                  {t.notes && t.notes !== '—' && (
                    <p className="text-white/45 text-[10px] pl-5 leading-snug whitespace-pre-wrap">{t.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* INBOX panel — structured, newest-first message cards rather
              than the raw inbox.md markdown dumped as one paragraph. */}
          {openPanel === 'inbox' && (
            <div className="space-y-2">
              {loadingInbox && <p className="text-white/35 text-xs font-mono">Loading inbox…</p>}
              {!loadingInbox && inboxContent && inboxContent.entries.length === 0 && (
                <p className="text-white/35 text-xs font-mono">No entries yet.</p>
              )}
              {!loadingInbox && inboxContent?.entries.map((entry, i) => (
                <InboxEntryCard key={i} entry={entry} />
              ))}
            </div>
          )}

          {/* OUTBOX panel */}
          {openPanel === 'outbox' && (
            <div>
              {loadingOutbox && <p className="text-white/35 text-xs font-mono">Loading reports…</p>}
              {!loadingOutbox && outboxContent && (
                <div
                  className="text-xs text-white/60 leading-relaxed space-y-1"
                  dangerouslySetInnerHTML={{ __html: mdToHtml(outboxContent.content || '*(no reports yet)*') }}
                />
              )}
            </div>
          )}

          {/* DISPATCH panel */}
          {openPanel === 'dispatch' && canDispatch && (
            <div className="space-y-3">
              <p className="text-[10px] text-white/40 font-mono">Send a directed dispatch to {labels[agent.name] ?? agent.name}'s inbox.</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  {(['high', 'normal', 'low'] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setDispatchPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono uppercase transition border ${dispatchPriority === p ? 'bg-white/[0.08] border-white/20 text-white/85' : 'glass-inner text-white/30 border-transparent hover:text-white/55'}`}
                    >
                      {p === 'high' ? '🔴' : p === 'low' ? '⚪' : '🟡'} {p}
                    </button>
                  ))}
                </div>
                <input
                  className="w-full glass-inner rounded-lg px-3 py-2 text-xs font-mono text-white/70 placeholder-white/25 outline-none"
                  placeholder="Task ref (optional, e.g. TASK-001)…"
                  value={dispatchTaskRef}
                  onChange={e => setDispatchTaskRef(e.target.value)}
                />
                <textarea
                  className="w-full glass-inner rounded-lg p-3 text-xs text-white/75 placeholder-white/25 font-sans resize-none outline-none focus:border-indigo-400/40 transition"
                  rows={4}
                  placeholder={`Instructions for ${labels[agent.name] ?? agent.name}…`}
                  value={dispatchMsg}
                  onChange={e => setDispatchMsg(e.target.value)}
                />
                <button
                  onClick={handleDispatch}
                  disabled={dispatching || !dispatchMsg.trim()}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase transition disabled:opacity-40 ${
                    dispatchResult === 'ok' ? 'bg-emerald-500/20 text-emerald-300' :
                    dispatchResult === 'err' ? 'bg-red-500/20 text-red-400' :
                    'hover:bg-white/[0.06] text-white/70'
                  }`}
                  style={!dispatchResult && !dispatching ? { borderColor: `${color}40`, border: '1px solid' } : undefined}
                >
                  {dispatching ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
                  {dispatching ? 'Sending…' : dispatchResult === 'ok' ? 'Dispatched ✓' : dispatchResult === 'err' ? 'Failed ✗' : `Dispatch to ${labels[agent.name] ?? agent.name}`}
                </button>
              </div>
            </div>
          )}

          {/* DELEGATE panel */}
          {openPanel === 'delegate' && canDelegate && (
            <div className="space-y-3">
              <p className="text-[10px] text-white/40 font-mono">Create a new task assigned to {labels[agent.name] ?? agent.name} in the task ledger.</p>
              <div className="space-y-2">
                <input
                  className="w-full glass-inner rounded-lg px-3 py-2 text-xs text-white/75 placeholder-white/25 font-sans outline-none"
                  placeholder="Task title…"
                  value={delegateTitle}
                  onChange={e => setDelegateTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  {(['high', 'normal', 'low'] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setDelegatePriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono uppercase transition border ${delegatePriority === p ? 'bg-white/[0.08] border-white/20 text-white/85' : 'glass-inner text-white/30 border-transparent hover:text-white/55'}`}
                    >
                      {p === 'high' ? '🔴' : p === 'low' ? '⚪' : '🟡'} {p}
                    </button>
                  ))}
                </div>
                <input
                  className="w-full glass-inner rounded-lg px-3 py-2 text-xs font-mono text-white/70 placeholder-white/25 outline-none"
                  placeholder="Project (default: ClaudeSecondBrain)…"
                  value={delegateProject}
                  onChange={e => setDelegateProject(e.target.value)}
                />
                <textarea
                  className="w-full glass-inner rounded-lg p-3 text-xs text-white/75 placeholder-white/25 font-sans resize-none outline-none"
                  rows={3}
                  placeholder="Notes / acceptance criteria…"
                  value={delegateNotes}
                  onChange={e => setDelegateNotes(e.target.value)}
                />
                <button
                  onClick={handleDelegate}
                  disabled={delegating || !delegateTitle.trim()}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase transition disabled:opacity-40 ${
                    delegateResult === 'ok' ? 'bg-emerald-500/20 text-emerald-300' :
                    delegateResult === 'err' ? 'bg-red-500/20 text-red-400' :
                    'hover:bg-white/[0.06] text-white/70'
                  }`}
                  style={!delegateResult && !delegating ? { borderColor: `${color}40`, border: '1px solid' } : undefined}
                >
                  {delegating ? <RefreshCw size={11} className="animate-spin" /> : <Plus size={11} />}
                  {delegating ? 'Creating…' : delegateResult === 'ok' ? 'Task created ✓' : delegateResult === 'err' ? 'Failed ✗' : `Delegate to ${labels[agent.name] ?? agent.name}`}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ── Broadcast Composer ─────────────────────────────────────────────────────

function BroadcastComposer({
  agentIds, colors, labels, onRefresh,
}: {
  agentIds: string[]; colors: Record<string, string>; labels: Record<string, string>; onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [targets, setTargets] = useState<Set<string>>(new Set(agentIds));
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<'ok' | 'err' | null>(null);

  const toggleTarget = (name: string) => {
    setTargets(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleBroadcast = async () => {
    if (!message.trim() || targets.size === 0) return;
    setSending(true);
    const results = await Promise.all(
      [...targets].map(agent =>
        api('POST', `/api/agents/${agent}/dispatch`, { message, priority, broadcast: true })
      )
    );
    setResult(results.every(Boolean) ? 'ok' : 'err');
    if (results.some(Boolean)) { setMessage(''); }
    setSending(false);
    setTimeout(() => setResult(null), 4000);
    onRefresh();
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/[0.03] transition"
      >
        <div className="flex items-center gap-3">
          <Megaphone size={16} className="text-indigo-300" />
          <div>
            <div className="font-display font-semibold text-sm text-white/88">Broadcast to All Agents</div>
            <div className="font-mono text-[9px] text-white/35 uppercase">Global dispatch — reaches every active inbox</div>
          </div>
        </div>
        {open ? <ChevronDown size={14} className="text-white/35" /> : <ChevronRight size={14} className="text-white/35" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t glass-divider pt-4">
          {/* Target toggles */}
          <div className="flex gap-2 flex-wrap">
            {agentIds.map(name => {
              const color = colors[name] ?? '#475569';
              const on = targets.has(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleTarget(name)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-mono uppercase transition border ${on ? 'bg-white/[0.07] border-white/15 text-white/85' : 'glass-inner text-white/25 border-transparent'}`}
                  style={on ? { borderColor: `${color}50`, color } : undefined}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: on ? color : '#475569' }} />
                  {labels[name] ?? name}
                </button>
              );
            })}
          </div>

          {/* Priority */}
          <div className="flex gap-2">
            {(['high', 'normal', 'low'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono uppercase transition border ${priority === p ? 'bg-white/[0.08] border-white/20 text-white/85' : 'glass-inner text-white/30 border-transparent hover:text-white/55'}`}
              >
                {p === 'high' ? '🔴' : p === 'low' ? '⚪' : '🟡'} {p}
              </button>
            ))}
          </div>

          <textarea
            className="w-full glass-inner rounded-lg p-3 text-sm text-white/75 placeholder-white/25 font-sans resize-none outline-none focus:border-indigo-400/40 transition"
            rows={4}
            placeholder="Broadcast message to all selected agents…"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />

          <button
            onClick={handleBroadcast}
            disabled={sending || !message.trim() || targets.size === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs uppercase transition disabled:opacity-40 ${
              result === 'ok' ? 'bg-emerald-500/20 text-emerald-300' :
              result === 'err' ? 'bg-red-500/20 text-red-400' :
              'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-400/20'
            }`}
          >
            {sending ? <RefreshCw size={12} className="animate-spin" /> : <Megaphone size={12} />}
            {sending ? 'Sending…' : result === 'ok' ? `Broadcast sent to ${targets.size} agents ✓` : result === 'err' ? 'Some dispatches failed' : `Broadcast to ${targets.size} agent${targets.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Hierarchy Strip ────────────────────────────────────────────────────────

function HierarchyStrip({
  agents, tasks, agentIds, colors, labels, commanderName,
}: {
  agents: AgentStatus[]; tasks: Task[]; agentIds: string[];
  colors: Record<string, string>; labels: Record<string, string>; commanderName: string;
}) {
  const inProgressTotal = tasks.filter(t => t.status === 'in-progress').length;
  const blockedTotal = tasks.filter(t => t.status === 'blocked').length;
  const activeAgents = agents.filter(isActive);

  return (
    <div className="glass-panel rounded-xl px-5 py-4 flex items-center gap-6 overflow-x-auto">
      {/* Commander node — whoever is signed in as Owner/Admin conceptually
          sits above the agent roster; label reflects the current session. */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center border border-amber-400/30">
          <span className="text-amber-300 font-display font-bold text-lg">{commanderName?.[0] ?? 'G'}</span>
        </div>
        <div>
          <div className="font-display font-bold text-sm text-white/92">{commanderName}</div>
          <div className="font-mono text-[9px] text-amber-300/60 uppercase">Commander</div>
        </div>
      </div>

      {/* Divider + connector */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-px w-8 bg-white/15" />
        <ArrowUpRight size={12} className="text-white/20 rotate-90" />
        <div className="h-px w-8 bg-white/15" />
      </div>

      {/* Agent nodes */}
      <div className="flex items-center gap-3 flex-1 flex-wrap">
        {agentIds.map(name => {
          const agent = agents.find(a => a.name === name);
          const color = colors[name] ?? '#475569';
          const active = agent ? isActive(agent) : false;
          const agentTasks = tasks.filter(t => t.owner.toLowerCase().includes(name));
          const blocked = agentTasks.filter(t => t.status === 'blocked').length;

          return (
            <div key={name} className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: `${color}12`, border: `1px solid ${color}28` }}
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center font-display font-bold text-xs" style={{ backgroundColor: `${color}20`, color }}>
                    {labels[name]?.[0]}
                  </div>
                  {active && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full pulse-dot" style={{ backgroundColor: color }} />}
                </div>
                <div>
                  <div className="font-mono text-[10px] font-semibold" style={{ color }}>{labels[name] ?? name}</div>
                  <div className="font-mono text-[8px] text-white/30">
                    {agentTasks.filter(t => t.status !== 'complete' && t.status !== 'cancelled').length} tasks
                    {blocked > 0 && <span className="text-red-400 ml-1">· {blocked} blocked</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {agentIds.length === 0 && (
          <span className="text-white/25 font-mono text-[11px]">No active agents — add one in Setup → Agents.</span>
        )}
      </div>

      {/* System summary */}
      <div className="flex items-center gap-4 shrink-0 pl-4 border-l glass-divider">
        <div className="text-center">
          <div className="font-display text-xl font-bold text-indigo-400">{inProgressTotal}</div>
          <div className="font-mono text-[8px] text-white/30 uppercase">In progress</div>
        </div>
        <div className="text-center">
          <div className={`font-display text-xl font-bold ${blockedTotal > 0 ? 'text-red-400' : 'text-white/30'}`}>{blockedTotal}</div>
          <div className="font-mono text-[8px] text-white/30 uppercase">Blocked</div>
        </div>
        <div className="text-center">
          <div className="font-display text-xl font-bold text-emerald-400">{activeAgents.length}</div>
          <div className="font-mono text-[8px] text-white/30 uppercase">Active agents</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────

export default function AgentHub({ agents, tasks, agentConfigs, onRefresh, canDispatch, canDelegate, commanderName }: Props) {
  // Track which panel is open per agent
  const [openPanels, setOpenPanels] = useState<Record<string, Panel | null>>({});

  const { colors, labels } = buildAgentMaps(agentConfigs);
  // Active agents, in registry order — this replaces the old hardcoded
  // `['claude', 'chatgpt', 'gemini', 'cursor']` array everywhere in this file.
  const agentOrder = agentConfigs.filter(a => a.active).map(a => a.id);
  const orderedAgents = agentOrder
    .map(name => agents.find(a => a.name === name))
    .filter((a): a is AgentStatus => !!a);

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-wider uppercase text-white/75">Agent Hub</h2>
        <div className="flex items-center gap-2">
          {!canDispatch && (
            <span className="flex items-center gap-1 text-[9px] font-mono uppercase text-white/25">
              <Lock size={9} /> Read-only
            </span>
          )}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 glass-btn rounded-lg text-white/45 hover:text-white/80 transition text-[10px] font-mono"
          >
            <RefreshCw size={10} /> Refresh
          </button>
        </div>
      </div>

      {/* Hierarchy overview */}
      <HierarchyStrip agents={agents} tasks={tasks} agentIds={agentOrder} colors={colors} labels={labels} commanderName={commanderName} />

      {/* Agent panels — 2-col on xl, 1-col on smaller */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {orderedAgents.map(agent => (
          <AgentPanel
            key={agent.name}
            agent={agent}
            tasks={tasks}
            colors={colors}
            labels={labels}
            canDispatch={canDispatch}
            canDelegate={canDelegate}
            openPanel={openPanels[agent.name] ?? null}
            onTogglePanel={p => setOpenPanels(prev => ({ ...prev, [agent.name]: p }))}
            onRefresh={onRefresh}
          />
        ))}
        {orderedAgents.length === 0 && (
          <p className="text-white/25 font-mono text-xs">No active agents. Add one in Setup → Agents.</p>
        )}
      </div>

      {/* Broadcast composer */}
      {canDispatch && <BroadcastComposer agentIds={agentOrder} colors={colors} labels={labels} onRefresh={onRefresh} />}
    </div>
  );
}
