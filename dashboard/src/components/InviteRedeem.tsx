/**
 * InviteRedeem — landing screen for `/?invite=<token>`.
 *
 * This is the onboarding surface for a human member who is NOT on
 * Gabriel's local network: whoever invited them shares this URL through
 * any channel (text, email, Slack — the dashboard doesn't send email
 * itself, see Setup → Members). Opening it from anywhere the dashboard
 * host is reachable lets them set their own password and land in the
 * dashboard already signed in, scoped to whatever role and project access
 * they were invited with.
 */

import { useEffect, useState } from 'react';
import { Brain, KeyRound, UserPlus } from 'lucide-react';
import { api } from '../lib/api';

interface InvitePreview { name: string; email: string; roleName: string; remote: boolean }

export default function InviteRedeem({ token, onDone }: { token: string; onDone: () => void }) {
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<InvitePreview>(`/api/invites/${token}`).then(({ data, error }) => {
      if (data) { setPreview(data); setName(data.name); }
      else setLoadError(error || 'Invite not found.');
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { data, error: err } = await api.post<{ ok: boolean }>(`/api/invites/${token}/redeem`, { name, password });
    setSubmitting(false);
    if (!data?.ok) { setError(err || 'Could not activate account.'); return; }
    onDone();
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass-panel rounded-2xl p-7 space-y-6 animate-fade-in">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-2xl glass-btn">
            <UserPlus size={24} className="text-emerald-300" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold uppercase tracking-wider text-white/92">You're invited</h1>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">SecondBrain Dashboard</p>
          </div>
        </div>

        {loadError && (
          <p className="text-center text-[12px] text-red-400 font-mono">{loadError}</p>
        )}

        {preview && !loadError && (
          <>
            <div className="glass-inner rounded-lg px-3 py-2.5 text-[11px] text-white/60 space-y-1">
              <div className="flex justify-between"><span className="text-white/35">Email</span><span>{preview.email}</span></div>
              <div className="flex justify-between"><span className="text-white/35">Role</span><span className="text-indigo-300">{preview.roleName}</span></div>
              {preview.remote && <div className="flex justify-between"><span className="text-white/35">Access</span><span className="text-amber-300">Remote member</span></div>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Your name</span>
                <div className="mt-1 flex items-center gap-2 glass-inner rounded-lg px-3 py-2.5">
                  <Brain size={13} className="text-white/30" />
                  <input className="bg-transparent outline-none text-sm text-white/85 flex-1" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </label>
              <label className="block">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Choose a password</span>
                <div className="mt-1 flex items-center gap-2 glass-inner rounded-lg px-3 py-2.5">
                  <KeyRound size={13} className="text-white/30" />
                  <input type="password" className="bg-transparent outline-none text-sm text-white/85 flex-1" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                </div>
              </label>
              {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/25 transition disabled:opacity-40"
              >
                {submitting ? 'Activating…' : 'Activate account & sign in'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
