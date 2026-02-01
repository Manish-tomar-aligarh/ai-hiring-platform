'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { interviews, type Interview } from '@/lib/api';

export default function RecruiterInterviewsPage() {
  const [list, setList] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    interviews
      .listAll()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
        <span>←</span> Dashboard
      </Link>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text-cyan">Candidate Interviews</h1>
          <p className="text-slate-400 mt-2">
            Review AI-conducted video interviews and scores.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 mb-6 animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          Loading interviews...
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl glass border border-cyan-500/20 p-8 text-center text-slate-400 text-sm">
          No interviews found.
        </div>
      ) : (
        <div className="rounded-2xl glass border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Job Role</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">AI Score</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {list.map((interview) => (
                  <tr key={interview.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{interview.candidate?.fullName || 'Unknown'}</div>
                      <div className="text-slate-500 text-xs">{interview.candidate?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {interview.job?.title || 'General Interview'}
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
                    <td className="px-6 py-4">
                      {interview.overallScore != null ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            interview.overallScore >= 70 ? 'text-emerald-400' : 
                            interview.overallScore >= 40 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {interview.overallScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">–</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/recruiter/interviews/${interview.id}`}
                        className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
