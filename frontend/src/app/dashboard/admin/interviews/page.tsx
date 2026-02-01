'use client';

import { useEffect, useState } from 'react';
import { admin } from '@/lib/api';

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInterviews = () => {
    setLoading(true);
    admin.getInterviews()
      .then(setInterviews)
      .catch((err) => setError(err.message || 'Failed to load interviews'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview record?')) return;
    try {
      await admin.deleteInterview(id);
      setInterviews(interviews.filter(i => i.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete interview');
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text-red">Interview Management</h1>
          <p className="text-slate-400 mt-2">Oversee all interview sessions.</p>
        </div>
        <button onClick={loadInterviews} className="text-sm text-cyan-400 hover:underline">Refresh List</button>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-xl mb-6">{error}</div>}

      <div className="rounded-2xl glass border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Job Role</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading interviews...</td></tr>
              ) : interviews.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No interviews found.</td></tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{interview.candidate?.fullName || 'Unknown'}</div>
                      <div className="text-slate-500 text-xs">{interview.candidate?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {interview.job?.title || 'General'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(interview.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        interview.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(interview.id)}
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
