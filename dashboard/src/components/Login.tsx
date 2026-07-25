/**
 * Login — sign-in screen, and (when no members exist yet) the first-run
 * "create the Owner account" screen. Same component, branched on
 * `bootstrapRequired` from AuthContext so there is exactly one entry
 * surface for both local and remote members.
 */

import { useState } from 'react';
import { Brain, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { bootstrapRequired, login, bootstrap } = useAuth();
  const [name, setName] = useState('Gabriel');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = bootstrapRequired
      ? await bootstrap(name, email, password)
      : await login(email, password);
    if (!result.ok) setError(result.error || 'Something went wrong.');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass-panel rounded-2xl p-7 space-y-6 animate-fade-in">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-2xl glass-btn">
            <Brain size={24} className="text-indigo-300" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold uppercase tracking-wider text-white/92">SecondBrain</h1>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">
              {bootstrapRequired ? 'Create the Owner account' : 'Sign in'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {bootstrapRequired && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-400/20 text-[11px] text-indigo-200 leading-snug">
              <ShieldCheck size={14} className="shrink-0" />
              No members exist yet. This creates the first account — it will hold the Owner role with full system access.
            </div>
          )}

          {bootstrapRequired && (
            <label className="block">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Name</span>
              <div className="mt-1 flex items-center gap-2 glass-inner rounded-lg px-3 py-2.5">
                <User size={13} className="text-white/30" />
                <input className="bg-transparent outline-none text-sm text-white/85 flex-1" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </label>
          )}

          <label className="block">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Email</span>
            <div className="mt-1 flex items-center gap-2 glass-inner rounded-lg px-3 py-2.5">
              <Mail size={13} className="text-white/30" />
              <input type="email" className="bg-transparent outline-none text-sm text-white/85 flex-1" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </label>

          <label className="block">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Password</span>
            <div className="mt-1 flex items-center gap-2 glass-inner rounded-lg px-3 py-2.5">
              <Lock size={13} className="text-white/30" />
              <input type="password" className="bg-transparent outline-none text-sm text-white/85 flex-1" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
          </label>

          {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/25 transition disabled:opacity-40"
          >
            {submitting ? 'Please wait…' : bootstrapRequired ? 'Create Owner account' : 'Sign in'}
          </button>
        </form>

        <p className="text-center font-mono text-[9px] text-white/25">
          Invited by an admin? Open the invite link they sent you instead of signing in here.
        </p>
      </div>
    </div>
  );
}
