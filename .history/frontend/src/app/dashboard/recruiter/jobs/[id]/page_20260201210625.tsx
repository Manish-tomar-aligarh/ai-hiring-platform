'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

/** ✅ Types */
type Job = {
  title: string;
};

type Application = {
  id: string;
  status: string;
  matchScore?: number;
  candidate?: {
    fullName: string;
    email: string;
  };
  appliedAt: string;
};

export default function JobApplicationsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    /** ✅ job fetch */
    api(`/jobs/${id}`)
      .then((res: any) => {
        setJob(res?.data ?? res);
      })
      .catch(() => {
        setJob(null);
      });

    /** ✅ applications fetch */
    api(`/jobs/${id}/applications`)
      .then((res: any) => {
        setApplications(res?.data ?? res);
      })
      .catch(() => {
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/recruiter"
        className="text-sm text-slate-400 hover:text-white mb-4 inline-block"
      >
        ← Dashboard
      </Link>

      <h1 className="text-xl font-semibold text-white">{job.title}</h1>
      <p className="text-slate-400 text-sm mt-1 mb-6">
        Applications — shortlist from here; match scores come from AI matching.
      </p>

      {loading && (
        <p className="text-slate-500 text-sm">Loading applications…</p>
      )}

      {!loading && applications.length === 0 && (
        <p className="text-slate-500 text-sm">No applications yet.</p>
      )}

      <ul className="space-y-3">
        {applications.map((app) => (
          <li
            key={app.id}
            className="flex items-center justify-between rounded-lg border border-slate-700/80 p-4"
          >
            <div>
              <span className="font-medium text-white">
                {app.candidate?.fullName ?? 'Candidate'}
              </span>
              <p className="text-slate-500 text-xs">
                {app.candidate?.email}
              </p>
              <span
                className={`text-xs mt-1 inline-block rounded px-2 py-0.5 ${
                  app.status === 'shortlisted'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-600/50 text-slate-400'
                }`}
              >
                {app.status}
              </span>
            </div>

            {app.matchScore != null && (
              <span className="text-slate-400 text-sm">
                Match: {app.matchScore}%
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
