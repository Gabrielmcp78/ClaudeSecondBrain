/**
 * App.tsx — SecondBrain Dashboard root
 *
 * Five tabs: Graph · Agents · Tasks · Command · Setup.
 * Persistent SystemPulse header shows live stats on every tab.
 * Data fetched from Express API on :10888 (proxied in dev from :10889).
 *
 * Everything below the header is now behind a session gate (AuthProvider /
 * useAuth): unauthenticated visitors see Login (or the one-time Owner
 * bootstrap screen), a `?invite=<token>` URL routes to account activation
 * for newly invited members (local or remote), and authenticated visitors
 * see the dashboard scoped to their role's permissions.
 */

import { useState, useEffect, useCallback } from 'react';
import { Brain, Network, Users, ListTodo, Terminal, RefreshCw, Settings, LogOut } from 'lucide-react';
import SystemPulse from './components/SystemPulse';
import NetworkGraph from './components/NetworkGraph';
import NetworkSidebar from './components/NetworkSidebar';
import AgentHub from './components/AgentHub';
import TaskBoard from './components/TaskBoard';
import CommandRail from './components/CommandRail';
import SetupHub from './components/SetupHub';
import Login from './components/Login';
import InviteRedeem from './components/InviteRedeem';
import { AuthProvider, useAuth } from './context/AuthContext';
import { fetchJSON } from './lib/api';
import type { SystemStats, AgentStatus, Task, Handoff, Decision, Connection, AgentConfig } from './types';

type Tab = 'graph' | 'agents' | 'tasks' | 'command' | 'setup';

function SplashLoading() {
  return (
    <div className="min-h-screen app-bg flex items-center justify-center">
      <RefreshCw size={20} className="animate-spin text-white/30" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { authenticated, loading, refresh } = useAuth();
  const inviteToken = new URLSearchParams(window.location.search).get('invite');

  if (loading) return <SplashLoading />;

  if (inviteToken) {
    return (
      <InviteRedeem
        token={inviteToken}
        onDone={() => {
          window.history.replaceState({}, '', window.location.pathname);
          refresh();
        }}
      />
    );
  }

  if (!authenticated) return <Login />;
  return <Dashboard />;
}

const TABS: { id: Tab; label: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'graph',   label: 'Knowledge Graph', Icon: Network },
  { id: 'agents',  label: 'Agent Hub',        Icon: Users },
  { id: 'tasks',   label: 'Tasks',            Icon: ListTodo },
  { id: 'command', label: 'Command',          Icon: Terminal },
];

function Dashboard() {
  const { member, role, hasPermission, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('graph');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [rawQueue, setRawQueue] = useState<string[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionIdx, setSelectedConnectionIdx] = useState<number | null>(null);
  // Lifted so double-clicking a node directly on the graph canvas can open
  // its article in the sidebar — the graph and the sidebar share one
  // "what article is open" state instead of the sidebar owning it alone.
  const [articlePath, setArticlePath] = useState<string | null>(null);

  const canViewAgents = hasPermission('view_agents');
  const canSetup = hasPermission('manage_agents') || hasPermission('manage_members') || hasPermission('manage_roles');

  const refresh = useCallback(async () => {
    setLoading(true);
    const [s, a, ac, t, h, d, c, r] = await Promise.all([
      fetchJSON<SystemStats>('/api/system'),
      canViewAgents ? fetchJSON<AgentStatus[]>('/api/agents') : Promise.resolve([]),
      canViewAgents ? fetchJSON<AgentConfig[]>('/api/agents/registry') : Promise.resolve([]),
      fetchJSON<Task[]>('/api/tasks'),
      fetchJSON<Handoff[]>('/api/handoffs'),
      fetchJSON<Decision[]>('/api/decisions'),
      fetchJSON<Connection[]>('/api/graph'),
      fetchJSON<string[]>('/api/raw-queue'),
    ]);
    if (s) setStats(s);
    if (a) setAgents(a);
    if (ac) setAgentConfigs(ac);
    if (t) setTasks(t);
    if (h) setHandoffs(h);
    if (d) setDecisions(d);
    if (c) setConnections(c);
    if (r) setRawQueue(r);
    setLastRefresh(new Date());
    setLoading(false);
  }, [canViewAgents]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="h-screen overflow-hidden app-bg text-white/90 font-sans flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="border-b glass-chrome px-6 py-3 shrink-0">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl glass-btn">
              <Brain size={20} className="text-indigo-300" />
            </div>
            <div>
              <h1 className="font-display text-lg tracking-wider font-semibold uppercase text-white/92">
                SecondBrain
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                Command &amp; Control · Port 10888
              </p>
            </div>
          </div>

          <SystemPulse stats={stats} loading={loading} onNavigate={setTab} />

          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 glass-btn rounded-lg text-white/55 hover:text-white/85 transition text-xs font-mono disabled:opacity-40"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading…' : `Refreshed ${lastRefresh.toLocaleTimeString()}`}
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l glass-divider">
              <div className="text-right">
                <div className="text-xs font-medium text-white/75 leading-tight">{member?.name}</div>
                <div className="font-mono text-[9px] text-indigo-300/70 uppercase tracking-wider leading-tight">{role?.name}</div>
              </div>
              <button onClick={logout} title="Sign out" className="p-2 glass-btn rounded-lg text-white/40 hover:text-red-300 transition">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab Bar ──────────────────────────────────────────────────── */}
      <nav className="border-b glass-chrome px-6 shrink-0">
        <div className="max-w-screen-2xl mx-auto flex gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono tracking-wider uppercase border-b-2 transition ${
                tab === id
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-white/35 hover:text-white/65 hover:border-white/20'
              }`}
            >
              <Icon size={13} />
              {label}
              {id === 'tasks' && tasks.filter(t => t.status === 'in-progress').length > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[9px] font-semibold border border-indigo-400/20">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </span>
              )}
              {id === 'agents' && agents.some(a => a.inboxCount > 0) && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-dot accent-pulse" style={{ color: '#fb923c' }} />
              )}
            </button>
          ))}
          {canSetup && (
            <button
              onClick={() => setTab('setup')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono tracking-wider uppercase border-b-2 transition ${
                tab === 'setup'
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-white/35 hover:text-white/65 hover:border-white/20'
              }`}
            >
              <Settings size={13} /> Setup
            </button>
          )}
        </div>
      </nav>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 max-w-screen-2xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">

        {/* Graph tab */}
        {tab === 'graph' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 h-full min-h-0 lg:min-h-[600px] animate-fade-in">
            <NetworkGraph
              connections={connections}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              selectedConnectionIdx={selectedConnectionIdx}
              onSelectConnection={setSelectedConnectionIdx}
              onOpenArticle={setArticlePath}
            />
            <NetworkSidebar
              connections={connections}
              selectedNodeId={selectedNodeId}
              selectedConnectionIdx={selectedConnectionIdx}
              onSelectNode={setSelectedNodeId}
              onSelectConnection={setSelectedConnectionIdx}
              articlePath={articlePath}
              onOpenArticle={setArticlePath}
            />
          </div>
        )}

        {/* Agents tab */}
        {tab === 'agents' && canViewAgents && (
          <div className="animate-fade-in">
            <AgentHub
              agents={agents}
              tasks={tasks}
              agentConfigs={agentConfigs}
              onRefresh={refresh}
              canDispatch={hasPermission('dispatch_agents')}
              canDelegate={hasPermission('delegate_tasks')}
              commanderName={member?.name ?? 'Commander'}
            />
          </div>
        )}

        {/* Tasks tab */}
        {tab === 'tasks' && (
          <div className="animate-fade-in">
            <TaskBoard tasks={tasks} />
          </div>
        )}

        {/* Command tab */}
        {tab === 'command' && (
          <div className="animate-fade-in">
            <CommandRail
              handoffs={handoffs}
              decisions={decisions}
              rawQueue={rawQueue}
              stats={stats}
            />
          </div>
        )}

        {/* Setup tab */}
        {tab === 'setup' && canSetup && (
          <div className="animate-fade-in">
            <SetupHub tasks={tasks} />
          </div>
        )}

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t glass-chrome px-6 py-2 shrink-0">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <span className="font-mono text-[9px] text-white/22 tracking-wider">
            SECONDBRAIN DASHBOARD · v2.0 · LOCALHOST:10888
          </span>
          <span className="font-mono text-[9px] text-white/22">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </footer>

    </div>
  );
}
