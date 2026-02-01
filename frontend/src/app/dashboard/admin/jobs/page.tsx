'use client';

import { useEffect, useState } from 'react';
import { admin } from '@/lib/api';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = () => {
    setLoading(true);
    admin.getJobs()
      .then(setJobs)
      .catch((err) => setError(err.message || 'Failed to load jobs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await admin.deleteJob(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text-red">Job Management</h1>
          <p className="text-slate-400 mt-2">Monitor and manage job postings.</p>
        </div>
        <button onClick={loadJobs} className="text-sm text-cyan-400 hover:underline">Refresh List</button>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-xl mb-6">{error}</div>}

      <div className="rounded-2xl glass border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Posted By</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading jobs...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No jobs found.</td></tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{job.title}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {job.postedBy?.fullName || 'Unknown'}
                      <div className="text-xs text-slate-500">{job.postedBy?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{job.type}</td>
                    <td className="px-6 py-4 text-slate-400">{job.location}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-400 hover:text-red-300 font-medium hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
