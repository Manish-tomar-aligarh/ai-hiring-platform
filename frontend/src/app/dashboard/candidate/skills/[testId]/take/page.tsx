'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { skills, type SkillTest } from '@/lib/api';

export default function TakeSkillTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;
  const [test, setTest] = useState<SkillTest | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!testId) return;
    skills
      .getTest(testId)
      .then(setTest)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load test'))
      .finally(() => setLoading(false));
  }, [testId]);

  const handleStart = async () => {
    if (!testId) return;
    setError('');
    setLoading(true);
    try {
      const attempt = await skills.startAttempt(testId);
      setAttemptId(attempt.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start attempt');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    setError('');
    setSubmitting(true);
    try {
      const result = await skills.submitAttempt(attemptId, answers);
      setScore(result.score ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !test) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 animate-pulse">Loading test…</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <Link href="/dashboard/candidate/skills" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 mb-4 transition-colors">
          ← Skill tests
        </Link>
        <div className="rounded-2xl glass border border-red-500/20 p-6 text-red-400">Test not found.</div>
      </div>
    );
  }

  const questions = test.questions ?? [];
  const hasStarted = !!attemptId;

  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/candidate/skills" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">
          ← Skill tests
        </Link>
        <h1 className="text-xl font-semibold text-white">{test.title}</h1>
        <p className="text-slate-400 text-sm mt-1 mb-6">
          {test.type.toUpperCase()} · {test.durationMinutes} minutes · {questions.length} question(s)
        </p>
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 mb-6">
            {error}
          </div>
        )}
        <button
          onClick={handleStart}
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition"
        >
          {loading ? 'Starting…' : 'Start test'}
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Link href="/dashboard/candidate/skills" className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 mb-6 transition-colors">
          ← Back to Skill tests
        </Link>
        <div className="rounded-2xl glass border border-emerald-500/30 bg-emerald-500/10 p-8 text-center hover-lift">
          <h2 className="text-xl font-bold text-white">Test submitted</h2>
          {score != null && (
            <p className="text-4xl font-bold gradient-text-emerald mt-4">Score: {score}%</p>
          )}
          <Link
            href="/dashboard/candidate/skills"
            className="inline-block mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 btn-shine"
          >
            View all attempts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/candidate/skills" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">
        ← Skill tests
      </Link>
      <h1 className="text-xl font-semibold text-white">{test.title}</h1>
      <p className="text-slate-400 text-sm mt-1 mb-6">
        Answer the questions below and submit when done.
      </p>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 mb-6">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-slate-500 text-sm">This test has no questions yet.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {questions.map((q, index) => (
            <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="font-medium text-white">
                {index + 1}. {q.question}
              </p>
              {q.options && q.options.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name={`q-${index}`}
                        value={opt}
                        checked={answers[index] === opt}
                        onChange={() => setAnswers((prev) => ({ ...prev, [index]: opt }))}
                        className="rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500"
                      />
                      {opt}
                    </label>
                  ))}
                </ul>
              ) : (
                <input
                  type="text"
                  value={answers[index] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                  placeholder="Your answer"
                  className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting…' : 'Submit test'}
            </button>
            <Link
              href="/dashboard/candidate/skills"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
