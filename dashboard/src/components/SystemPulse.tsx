/**
 * SystemPulse — header stat bar
 * Shows live article count, raw queue depth, connection count, last ingest.
 */

import type { SystemStats } from '../types';

type Tab = 'graph' | 'agents' | 'tasks' | 'command' | 'setup';

interface Props {
  stats: SystemStats | null;
  loading: boolean;
  /** Jump the main tab bar to wherever this stat's detail actually lives. */
  onNavigate?: (tab: Tab) => void;
}

const Stat = ({
  label, value, accent, onClick,
}: { label: string; value: string | number; accent?: string; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    title={onClick ? `Go to ${label}` : undefined}
    className={`flex flex-col items-center px-4 py-1.5 border-r glass-divider last:border-r-0 transition ${
      onClick ? 'cursor-pointer hover:bg-white/[0.05]' : 'cursor-default'
    }`}
  >
    <span className={`font-display text-lg font-semibold leading-none ${accent ?? 'text-white/75'}`}>
      {value}
    </span>
    <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase mt-1">{label}</span>
  </button>
);

export default function SystemPulse({ stats, loading, onNavigate }: Props) {
  if (loading && !stats) {
    return (
      <div className="hidden md:flex items-center gap-0 glass-panel rounded-xl overflow-hidden">
        {['Articles', 'Raw Queue', 'Connections', 'Last Ingest'].map(l => (
          <Stat key={l} label={l} value="—" />
        ))}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center glass-panel rounded-xl overflow-hidden">
      {/* Articles and Connections both live on the Knowledge Graph tab —
          articles are the graph's nodes, connections are its edges. */}
      <Stat label="Articles"    value={stats?.articleCount ?? '—'} accent="text-indigo-300"
            onClick={onNavigate ? () => onNavigate('graph') : undefined} />
      {/* Raw Queue and Last Ingest are both surfaced in Command → Raw Queue
          / System Snapshot. */}
      <Stat label="Raw Queue"   value={stats?.rawQueueSize ?? '—'} accent={stats?.rawQueueSize ? 'text-amber-300' : 'text-white/40'}
            onClick={onNavigate ? () => onNavigate('command') : undefined} />
      <Stat label="Connections" value={stats?.connectionCount ?? '—'} accent="text-emerald-300"
            onClick={onNavigate ? () => onNavigate('graph') : undefined} />
      <Stat label="Last Ingest" value={stats?.lastIngest ?? '—'}
            onClick={onNavigate ? () => onNavigate('command') : undefined} />
    </div>
  );
}
