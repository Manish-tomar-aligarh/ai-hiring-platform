'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { interviews, type Interview } from '@/lib/api';

export default function CandidateInterviewsPage() {
  const [list, setList] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const load = () => {
    setError('');
    interviews
      .list()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSchedule = async () => {
    setError('');
    setScheduling(true);
    try {
      const created = await interviews.schedule();
      setList((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/dashboard/candidate" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
        <span>←</span> Dashboard
      </Link>
      <h1 className="text-3xl font-bold gradient-text-cyan">AI video interviews</h1>
      <p className="text-slate-400 mt-2 mb-8">
        Schedule an AI interview, answer questions (type or speak), and get a relevance & sentiment score.
      </p>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 mb-6 animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleSchedule}
          disabled={scheduling}
          className="rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-3 font-semibold text-white hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 transition-all duration-300 hover:shadow-glow-cyan btn-shine"
        >
          {scheduling ? 'Scheduling…' : 'Schedule new interview'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          Loading…
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl glass border border-cyan-500/20 p-8 text-center text-slate-400 text-sm">
          No interviews yet. Click &quot;Schedule new interview&quot; to get AI-generated questions and submit your answers.
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((interview, i) => (
            <li
              key={interview.id}
              className="flex items-center justify-between rounded-2xl glass border border-white/10 p-5 hover:border-cyan-500/30 hover-lift transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div>
                <span className="font-semibold text-white">
                  Interview {interview.job?.title ? `– ${interview.job.title}` : '(general)'}
                </span>
                <p className="text-slate-500 text-xs mt-1">
                  {new Date(interview.scheduledAt).toLocaleString()} · {interview.status}
                  {interview.overallScore != null && interview.status === 'completed' && (
                    <> · Score: {interview.overallScore}%</>
                  )}
                </p>
              </div>
              {interview.status !== 'completed' ? (
                <Link
                  href={`/dashboard/candidate/interviews/${interview.id}/take`}
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-cyan-500 hover:to-emerald-500 transition-all duration-300 btn-shine"
                >
                  Take interview
                </Link>
              ) : (
                <span className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-400">
                  Completed
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
