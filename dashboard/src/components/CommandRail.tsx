/**
 * CommandRail — handoffs, decisions, and raw queue
 * Three-panel command overview: recent agent handoffs, settled decisions, unprocessed raw files.
 */

import { useState } from 'react';
import { ArrowRight, Lock, FileQuestion, ChevronDown, ChevronUp, Archive } from 'lucide-react';
import type { Handoff, Decision, SystemStats } from '../types';

interface Props {
  handoffs: Handoff[];
  decisions: Decision[];
  rawQueue: string[];
  stats: SystemStats | null;
}

function HandoffCard({ handoff }: { handoff: Handoff }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer glass-row-hover transition"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[9px] text-white/30 shrink-0">{handoff.date}</span>
          <ArrowRight size={10} className="text-white/20 shrink-0" />
          <span className="font-display text-xs font-medium text-white/70 truncate">
            {handoff.from} → {handoff.to}
          </span>
        </div>
        {open ? <ChevronUp size={13} className="text-slate-500 shrink-0" /> : <ChevronDown size={13} className="text-slate-500 shrink-0" />}
      </div>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t glass-divider space-y-3 text-[11px] animate-fade-in">
          {handoff.completed.length > 0 && (
            <div>
              <span className="font-mono text-[9px] text-emerald-400 uppercase block mb-1">Completed</span>
              {handoff.completed.map((c, i) => <div key={i} className="text-white/50">✓ {c}</div>)}
            </div>
          )}
          {handoff.nextMove && (
            <div>
              <span className="font-mono text-[9px] text-indigo-300 uppercase block mb-1">Recommended next</span>
              <p className="text-white/70 leading-relaxed">{handoff.nextMove}</p>
            </div>
          )}
          {handoff.doNotDo.length > 0 && (
            <div>
              <span className="font-mono text-[9px] text-red-400 uppercase block mb-1">Do not</span>
              {handoff.doNotDo.map((d, i) => <div key={i} className="text-white/50">✗ {d}</div>)}
            </div>
          )}
          {handoff.openQuestions.length > 0 && (
            <div>
              <span className="font-mono text-[9px] text-amber-300 uppercase block mb-1">Open questions</span>
              {handoff.openQuestions.map((q, i) => <div key={i} className="text-white/50">? {q}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DecisionCard({ decision }: { decision: Decision }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel rounded-xl overflow-hidden" style={{ borderTopColor: 'rgba(245,158,11,0.25)', borderTopWidth: 1 }}>
      <div
        className="flex items-start justify-between px-4 py-3 cursor-pointer glass-row-hover transition gap-3"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-start gap-2 min-w-0">
          <Lock size={11} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="font-mono text-[9px] text-amber-400 mb-0.5">{decision.id}</div>
            <p className="text-[11px] text-white/70 leading-snug line-clamp-2">{decision.decision}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[9px] text-white/25">{decision.date}</span>
          {open ? <ChevronUp size={12} className="text-white/35" /> : <ChevronDown size={12} className="text-white/35" />}
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t glass-divider space-y-2.5 text-[11px] animate-fade-in">
          <div>
            <span className="font-mono text-[9px] text-white/30 uppercase block mb-0.5">Decided by</span>
            <span className="text-white/55">{decision.decidedBy}</span>
          </div>
          {decision.rationale && (
            <div>
              <span className="font-mono text-[9px] text-white/30 uppercase block mb-0.5">Rationale</span>
              <p className="text-white/55 leading-relaxed">{decision.rationale}</p>
            </div>
          )}
          {decision.reopeningCondition && (
            <div>
              <span className="font-mono text-[9px] text-amber-400 uppercase block mb-0.5">Reopening condition</span>
              <p className="text-white/55 leading-relaxed">{decision.reopeningCondition}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommandRail({ handoffs, decisions, rawQueue, stats }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Handoffs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b glass-divider">
          <ArrowRight size={13} className="text-purple-400" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-purple-300">
            Recent Handoffs ({handoffs.length})
          </span>
        </div>
        {handoffs.length === 0
          ? <div className="text-white/25 font-mono text-xs">No handoffs yet</div>
          : handoffs.slice(0, 8).map((h, i) => <HandoffCard key={i} handoff={h} />)
        }
      </div>

      {/* Decisions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-amber-400/20">
          <Lock size={13} className="text-amber-400" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Settled Decisions ({decisions.length})
          </span>
        </div>
        {decisions.length === 0
          ? <div className="text-white/25 font-mono text-xs">No decisions registered</div>
          : decisions.map((d, i) => <DecisionCard key={i} decision={d} />)
        }
      </div>

      {/* Raw Queue + System */}
      <div className="space-y-4">
        {/* Raw Queue */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b glass-divider">
            <FileQuestion size={13} className="text-white/40" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Raw Queue ({rawQueue.length})
            </span>
          </div>
          {rawQueue.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
              ✓ Queue clear
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
              {rawQueue.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}
                >
                  <Archive size={10} className="text-amber-400 shrink-0" />
                  <span className="font-mono text-[10px] text-amber-300 truncate">{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System snapshot */}
        {stats && (
          <div className="glass-panel rounded-xl p-4 space-y-2.5">
            <div className="font-mono text-[9px] text-white/30 uppercase tracking-wider border-b glass-divider pb-2 mb-3">
              System Snapshot
            </div>
            {[
              ['Wiki Articles', stats.articleCount],
              ['Raw Processed', stats.processedCount],
              ['Pending Ingest', stats.rawQueueSize],
              ['Connections', stats.connectionCount],
              ['Last Ingest', stats.lastIngest],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-[11px]">
                <span className="text-white/35 font-mono">{label}</span>
                <span className="text-white/75 font-semibold">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
