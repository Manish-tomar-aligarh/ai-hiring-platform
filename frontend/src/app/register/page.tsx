'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/api';

const ROLES = [
  { value: 'candidate', label: 'Candidate', gradient: 'from-violet-500 to-fuchsia-500' },
  { value: 'recruiter', label: 'Recruiter', gradient: 'from-cyan-500 to-emerald-500' },
] as const;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'recruiter' || r === 'candidate') setRole(r);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.register({ email, password, fullName, role });
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      const redirect = res.user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/candidate';
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-cyan-950/25 via-[#0a0a0f] to-fuchsia-950/20" />
      <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="rounded-3xl glass-strong border border-white/20 p-8 shadow-glow-cyan/20">
          <h1 className="text-3xl font-bold gradient-text-cyan mb-2">Create account</h1>
          <p className="text-slate-400 text-sm mb-8">Join as candidate or recruiter</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 animate-fade-in">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password (min 8)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">I am a</label>
              <div className="flex gap-3">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex-1 rounded-xl border-2 px-4 py-3.5 text-center text-sm font-medium cursor-pointer transition-all duration-300 hover-lift ${
                      role === r.value
                        ? `border-transparent bg-gradient-to-r ${r.gradient} text-white shadow-lg`
                        : 'border-white/20 text-slate-400 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} className="sr-only" />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 py-3.5 font-semibold text-white hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 transition-all duration-300 hover:shadow-glow-cyan btn-shine"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
          <p className="mt-8 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-emerald-400 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <Link href="/" className="relative z-10 mt-8 text-slate-500 text-sm hover:text-white transition-colors flex items-center gap-2">
        <span>←</span> Back to home
      </Link>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
