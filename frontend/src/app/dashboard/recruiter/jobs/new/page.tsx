'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          requiredSkills: requiredSkills ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          location: location || undefined,
        }),
      });
      router.push('/dashboard/recruiter');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/recruiter" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">← Dashboard</Link>
      <h1 className="text-xl font-semibold text-white">Post a job</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
            placeholder="Senior Backend Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
            placeholder="Job description..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Required skills (comma-separated)</label>
          <input
            type="text"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
            placeholder="Node.js, TypeScript, PostgreSQL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
            placeholder="Remote / NYC"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition"
        >
          {loading ? 'Creating…' : 'Create job'}
        </button>
      </form>
    </div>
  );
}
