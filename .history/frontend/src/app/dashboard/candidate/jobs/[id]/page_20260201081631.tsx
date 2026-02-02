'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jobs } from '@/lib/api';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [job, setJob] = useState<{ id: string; title: string; description: string; requiredSkills?: string[]; location?: string } | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    jobs.get(id).then(setJob).catch(() => setJob(null));
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    setError('');
    try {
      await jobs.apply(id);
      router.push('/dashboard/candidate');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apply failed');
    } finally {
      setApplying(false);
    }
  };

  if (!job) return <div className="max-w-2xl mx-auto py-8 text-slate-400">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/candidate" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">← Dashboard</Link>
      <h1 className="text-2xl font-semibold text-white">{job.title}</h1>
      {job.requiredSkills?.length ? (
        <p className="text-slate-500 text-sm mt-1">{job.requiredSkills.join(', ')}</p>
      ) : null}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-slate-300 whitespace-pre-wrap">{job.description}</p>
      </div>
      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2">{error}</div>
      )}
      <button
        onClick={handleApply}
        disabled={applying}
        className="mt-6 rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition"
      >
        {applying ? 'Applying…' : 'Apply'}
      </button>
    </div>
  );
}
