'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jobs } from '@/lib/api';

type Job = { id: string; title: string; description: string; requiredSkills?: string[]; isActive?: boolean };

export default function RecruiterDashboardPage() {
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobs.list().then(setJobsList).catch(() => setJobsList([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-emerald">Recruiter Dashboard</h1>
          <p className="text-slate-400 mt-2">Post jobs, view applications, shortlist candidates</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/recruiter/interviews"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all duration-300"
          >
            View Interviews
          </Link>
          <Link
            href="/dashboard/recruiter/jobs/new"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 hover:shadow-glow-emerald btn-shine shrink-0"
          >
            Post job
          </Link>
        </div>
      </div>

      <section className="rounded-2xl glass border border-white/10 p-6 hover-lift">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
          Your jobs
        </h2>
        {loading && <p className="text-slate-500 text-sm animate-pulse">Loading…</p>}
        {!loading && jobsList.length === 0 && (
          <p className="text-slate-500 text-sm">No jobs yet. Post your first job to see AI-matched candidates and skill authenticity scores.</p>
        )}
        <ul className="space-y-4">
          {jobsList.map((job, i) => (
            <li key={job.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-300 animate-slide-in-right" style={{ animationDelay: `${i * 0.06}s` }}>
              <div>
                <span className="font-semibold text-white">{job.title}</span>
                {job.requiredSkills?.length ? (
                  <p className="text-slate-500 text-xs mt-1">{job.requiredSkills.join(', ')}</p>
                ) : null}
              </div>
              <Link
                href={`/dashboard/recruiter/jobs/${job.id}`}
                className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/60 transition-all duration-300"
              >
                View applications
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl glass border border-white/10 p-6 hover-lift">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500" />
          Analytics
        </h2>
        <p className="text-slate-400 text-sm mb-6">Dashboard for match scores, shortlist rates, and candidate credibility.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total jobs', value: jobsList.length, gradient: 'from-emerald-500 to-teal-500' },
            { label: 'Applications', value: '—', gradient: 'from-cyan-500 to-blue-500' },
            { label: 'Shortlisted', value: '—', gradient: 'from-violet-500 to-fuchsia-500' },
            { label: 'Avg match', value: '—', gradient: 'from-amber-500 to-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-all duration-300">
              <p className="text-slate-500 text-xs">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
