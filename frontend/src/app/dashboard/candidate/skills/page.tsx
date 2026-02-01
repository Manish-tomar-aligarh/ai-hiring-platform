'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { skills, type SkillTest, type SkillTestAttempt } from '@/lib/api';

export default function CandidateSkillsPage() {
  const [tests, setTests] = useState<SkillTest[]>([]);
  const [attempts, setAttempts] = useState<SkillTestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([skills.listTests(), skills.getMyAttempts()])
      .then(([testsList, attemptsList]) => {
        setTests(Array.isArray(testsList) ? testsList : []);
        setAttempts(Array.isArray(attemptsList) ? attemptsList : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/dashboard/candidate" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 mb-6 transition-colors">
        <span>←</span> Dashboard
      </Link>
      <h1 className="text-3xl font-bold gradient-text">Skill tests</h1>
      <p className="text-slate-400 mt-2 mb-8">
        Take MCQ and coding tests to verify your skills and build your credibility score.
      </p>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 mb-6 animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading…
        </div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
              Available tests
            </h2>
            {tests.length === 0 ? (
              <div className="rounded-2xl glass border border-white/10 p-8 text-center text-slate-400 text-sm">
                No skill tests available yet. Tests can be added via API or Swagger at <code className="text-violet-400">/api/docs</code>.
              </div>
            ) : (
              <ul className="space-y-4">
                {tests.map((test, i) => (
                  <li
                    key={test.id}
                    className="flex items-center justify-between rounded-2xl glass border border-white/10 p-5 hover:border-violet-500/30 hover-lift transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div>
                      <span className="font-semibold text-white">{test.title}</span>
                      <p className="text-slate-500 text-xs mt-1">
                        {test.type.toUpperCase()} · {test.durationMinutes} min
                        {test.skillTags?.length ? ` · ${test.skillTags.join(', ')}` : ''}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/candidate/skills/${test.id}/take`}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 btn-shine"
                    >
                      Start test
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-gradient-to-b from-cyan-500 to-emerald-500" />
              My attempts
            </h2>
            {attempts.length === 0 ? (
              <p className="text-slate-500 text-sm">You haven’t taken any tests yet.</p>
            ) : (
              <ul className="space-y-4">
                {attempts.map((a, i) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-2xl glass border border-white/10 p-4 hover-lift transition-all duration-300 animate-slide-in-right"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div>
                      <span className="font-medium text-white">{a.skillTest?.title ?? 'Skill test'}</span>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(a.startedAt).toLocaleString()} · {a.status}
                      </p>
                    </div>
                    {a.status === 'completed' && a.score != null && (
                      <span className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-400">
                        Score: {a.score}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
