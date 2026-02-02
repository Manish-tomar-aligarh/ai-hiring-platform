'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      let redirect = searchParams.get('redirect');
      if (!redirect) {
        if (res.user.role === 'admin') redirect = '/dashboard/admin';
        else if (res.user.role === 'recruiter') redirect = '/dashboard/recruiter';
        else redirect = '/dashboard/candidate';
      }
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-[#0a0a0f] to-cyan-950/20" />
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="rounded-3xl glass-strong border border-white/20 p-8 shadow-glow-violet/30">
          <h1 className="text-3xl font-bold gradient-text mb-2">Log in</h1>
          <p className="text-slate-400 text-sm mb-8">Smart Hiring – Skill Verification Platform</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 animate-fade-in">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 transition-all duration-300 hover:shadow-glow-violet btn-shine"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-8 text-center text-slate-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-violet-400 hover:text-fuchsia-400 font-medium transition-colors">
              Sign up
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
