/**
 * TaskBoard — live task ledger view
 * Reads task-ledger.md via the API and displays tasks grouped by status.
 * Shows owner, priority, project, and outputs for each task.
 */

import { Clock, AlertCircle, CheckCircle2, Circle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../types';

interface Props {
  tasks: Task[];
}

const STATUS_CONFIG: Record<Task['status'], {
  label: string;
  color: string;
  bg: string;
  border: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  order: number;
}> = {
  'in-progress': { label: 'In Progress', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', Icon: Clock, order: 0 },
  'blocked':     { label: 'Blocked',     color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    Icon: AlertCircle, order: 1 },
  'pending':     { label: 'Pending',     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  Icon: Circle, order: 2 },
  'complete':    { label: 'Complete',    color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',Icon: CheckCircle2, order: 3 },
  'cancelled':   { label: 'Cancelled',   color: 'text-slate-500',  bg: 'bg-slate-800/40',  border: 'border-slate-700/30',  Icon: XCircle, order: 4 },
};

const PRIORITY_BADGE: Record<Task['priority'], string> = {
  high:   'bg-red-500/15 text-red-400 border-red-500/20',
  normal: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
  low:    'bg-slate-800/40 text-slate-500 border-slate-700/20',
};

function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[task.status];

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer glass-row-hover transition"
        onClick={() => setExpanded(e => !e)}
      >
        <cfg.Icon size={15} className={`${cfg.color} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white/80 leading-snug">{task.title}</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${PRIORITY_BADGE[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="font-mono text-[9px] text-white/30">{task.id}</span>
            {task.project && (
              <span className="font-mono text-[9px] text-white/30">
                📁 {task.project}
              </span>
            )}
            {task.owner && (
              <span className="font-mono text-[9px] text-white/30">
                👤 {task.owner}
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp size={13} className="text-white/35 shrink-0 mt-1" /> : <ChevronDown size={13} className="text-white/35 shrink-0 mt-1" />}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t glass-divider space-y-3 animate-fade-in">
          {task.outputs.length > 0 && (
            <div>
              <span className="font-mono text-[9px] text-white/30 uppercase block mb-1">Outputs</span>
              <div className="space-y-0.5">
                {task.outputs.map((o, i) => (
                  <div key={i} className="text-[10px] text-white/50 font-mono">→ {o}</div>
                ))}
              </div>
            </div>
          )}
          {task.notes && (
            <div>
              <span className="font-mono text-[9px] text-white/30 uppercase block mb-1">Notes</span>
              <p className="text-[11px] text-white/65 leading-relaxed">{task.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TaskBoard({ tasks }: Props) {
  const statusOrder: Task['status'][] = ['in-progress', 'blocked', 'pending', 'complete', 'cancelled'];

  const grouped = statusOrder.reduce<Record<Task['status'], Task[]>>((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {} as Record<Task['status'], Task[]>);

  const activeSections = statusOrder.filter(s => grouped[s].length > 0);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/25 font-mono text-sm">
        No tasks found in task-ledger.md
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-wider uppercase text-white/75">Task Ledger</h2>
        <div className="flex items-center gap-3">
          {statusOrder.filter(s => grouped[s].length > 0).map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                <span className="font-mono text-[9px] text-white/30">{grouped[s].length} {cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {activeSections.map(status => {
        const cfg = STATUS_CONFIG[status];
        return (
          <div key={status}>
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${cfg.border}`}>
              <cfg.Icon size={13} className={cfg.color} />
              <span className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}>
                {cfg.label} ({grouped[status].length})
              </span>
            </div>
            <div className="space-y-2">
              {grouped[status].map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
