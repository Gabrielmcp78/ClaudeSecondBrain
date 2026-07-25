/**
 * AgentsPanel — Setup → Agents
 *
 * The "standard setup pathway" for adding an agent: fill in a label, pick
 * whether it's a native desktop app or a web app, give it a focus target
 * (an app URL scheme like `claude-app://focus`, or a plain https:// URL),
 * and submit. The server slugifies the id, assigns a fallback color if
 * none is chosen, and scaffolds wiki/_agents/<id>/{status,inbox,outbox}.md
 * automatically (see server/agentRegistry.ts). No code changes needed to
 * bring a new agent online — this replaces the old hardcoded 4-agent
 * array (which included Cursor; Cursor is simply not in the registry
 * anymore, though its wiki history is untouched on disk).
 */

import { useEffect, useState } from 'react';
import { Plus, Trash2, Power, Bot, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import type { AgentConfig } from '../../types';

export default function AgentsPanel({ canManage }: { canManage: boolean }) {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<'native' | 'web'>('web');
  const [focusTarget, setFocusTarget] = useState('');
  const [color, setColor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get<AgentConfig[]>('/api/agents/registry');
    setAgents(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const { data, error } = await api.post<{ ok: boolean }>('/api/agents/registry', { label, kind, focusTarget, color: color || undefined });
    setSubmitting(false);
    if (!data?.ok) { setFormError(error || 'Could not add agent.'); return; }
    setLabel(''); setFocusTarget(''); setColor(''); setFormOpen(false);
    load();
  };

  const toggleActive = async (agent: AgentConfig) => {
    await api.patch(`/api/agents/registry/${agent.id}`, { active: !agent.active });
    load();
  };

  const removeAgent = async (agent: AgentConfig) => {
    if (!confirm(`Remove ${agent.label} from the active roster? Its wiki history (inbox/outbox/status) is kept on disk and it can be re-added later.`)) return;
    await api.del(`/api/agents/registry/${agent.id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-white/40 leading-relaxed max-w-lg">
          Agents registered here appear in the Agent Hub, receive dispatches, and get their own wiki inbox/outbox/status files.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 glass-btn rounded-lg text-white/45 hover:text-white/80 transition text-[10px] font-mono">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {canManage && (
            <button onClick={() => setFormOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-400/20 transition text-[10px] font-mono uppercase">
              <Plus size={11} /> Add Agent
            </button>
          )}
        </div>
      </div>

      {formOpen && canManage && (
        <form onSubmit={handleAdd} className="glass-panel rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Label</span>
              <input className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none" placeholder="e.g. Perplexity" value={label} onChange={e => setLabel(e.target.value)} required />
            </label>
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Color (optional)</span>
              <input className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none font-mono" placeholder="#8b5cf6" value={color} onChange={e => setColor(e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Kind</span>
              <select className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none" value={kind} onChange={e => setKind(e.target.value as 'native' | 'web')}>
                <option value="web">Web app (opens a URL)</option>
                <option value="native">Native desktop app (custom focus handler)</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Focus target</span>
              <input className="mt-1 w-full glass-inner rounded-lg px-3 py-2 text-sm text-white/85 outline-none font-mono" placeholder={kind === 'web' ? 'https://...' : 'appname-app://focus'} value={focusTarget} onChange={e => setFocusTarget(e.target.value)} required />
            </label>
          </div>
          {formError && <p className="text-[11px] text-red-400 font-mono">{formError}</p>}
          <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/25 text-[11px] font-mono uppercase transition disabled:opacity-40">
            {submitting ? 'Adding…' : 'Register agent'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map(agent => (
          <div key={agent.id} className="glass-panel rounded-xl p-4 flex items-center gap-3" style={{ borderTopColor: agent.color, borderTopWidth: 2, opacity: agent.active ? 1 : 0.45 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${agent.color}22`, color: agent.color }}>
              <Bot size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-sm text-white/88">{agent.label}</div>
              <div className="font-mono text-[9px] text-white/35 truncate">{agent.id} · {agent.kind} · {agent.focusTarget}</div>
            </div>
            {canManage && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(agent)} title={agent.active ? 'Deactivate' : 'Activate'} className="p-1.5 rounded-lg glass-btn text-white/40 hover:text-white/80 transition">
                  <Power size={12} />
                </button>
                <button onClick={() => removeAgent(agent)} title="Remove" className="p-1.5 rounded-lg glass-btn text-white/40 hover:text-red-400 transition">
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
        {agents.length === 0 && !loading && (
          <p className="text-white/25 font-mono text-xs">No agents registered.</p>
        )}
      </div>
    </div>
  );
}
