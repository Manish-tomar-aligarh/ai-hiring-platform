'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/30 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-[90px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="relative z-10 border-b border-white/10 glass px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold gradient-text">Smart Hiring</span>
        <nav className="flex gap-6">
          <Link href="/login" className="text-slate-400 hover:text-white transition-all duration-300 hover:scale-105">
            Log in
          </Link>
          <Link
            href="/register"
            className="relative rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 hover:shadow-glow-violet btn-shine"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <h1 className="text-4xl md:text-7xl font-bold max-w-4xl mb-6 animate-slide-up gradient-text leading-tight">
          AI-Powered Smart Hiring & Skill Verification
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-12 animate-slide-up stagger-1">
          Resume screening, auto-generated skill tests, and AI video interviews — all in one platform. Built for scale.
        </p>
        <div className="flex flex-wrap gap-5 justify-center animate-slide-up stagger-2">
          <Link
            href="/register?role=candidate"
            className="group relative rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 p-[2px] hover:shadow-glow-violet transition-all duration-500 hover:scale-105"
          >
            <span className="flex rounded-2xl bg-[#0a0a0f] px-8 py-4 font-semibold text-white group-hover:bg-transparent transition-all duration-300">
              I&apos;m a Candidate
            </span>
          </Link>
          <Link
            href="/register?role=recruiter"
            className="rounded-2xl glass border border-cyan-500/30 px-8 py-4 font-semibold text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover-lift"
          >
            I&apos;m a Recruiter
          </Link>
        </div>
        <ul className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl animate-fade-in">
          {[
            { title: 'Candidates', desc: 'Upload resume, take skill tests, complete AI interview, earn credibility badge.', color: 'from-violet-500 to-fuchsia-500', delay: 'stagger-1' },
            { title: 'Recruiters', desc: 'Post jobs, view AI-matched candidates, skill authenticity scores, auto shortlist.', color: 'from-cyan-500 to-emerald-500', delay: 'stagger-2' },
            { title: 'Scale', desc: 'NestJS, PostgreSQL, Redis, Docker, API-first design.', color: 'from-amber-500 to-orange-500', delay: 'stagger-3' },
          ].map((card, i) => (
            <li
              key={i}
              className={`rounded-2xl glass border border-white/10 p-6 hover-lift hover:border-white/20 transition-all duration-500 animate-slide-up ${card.delay}`}
            >
              <span className={`font-semibold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>{card.title}</span>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{card.desc}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="relative z-10 border-t border-white/10 glass px-6 py-4 text-center text-slate-500 text-sm">
        Smart Hiring Platform – Resume · Skills · AI Interview
      </footer>
    </div>
  );
}
