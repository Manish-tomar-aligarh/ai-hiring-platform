'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jobs, resumes } from '@/lib/api';

export default function CandidateDashboardPage() {
  const [jobsList, setJobsList] = useState<Array<{ id: string; title: string; description: string; requiredSkills?: string[] }>>([]);
  const [resumesList, setResumesList] = useState<Array<{ id: string; fileName: string; parsingStatus: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    jobs.list().then(setJobsList).catch(() => setJobsList([]));
    resumes.list().then(setResumesList).catch(() => setResumesList([]));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF allowed');
      return;
    }
    setError('');
    setUploading(true);
    try {
      await resumes.upload(file);
      setResumesList((prev) => [{ id: '', fileName: file.name, parsingStatus: 'pending' }, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Candidate Dashboard</h1>
        <p className="text-slate-400 mt-2">Upload resume, take skill tests, apply to jobs</p>
      </div>

      <section className="rounded-2xl glass border border-white/10 p-6 hover-lift">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
          Resume
        </h2>
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 animate-fade-in">
            {error}
          </div>
        )}
        <label className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-violet-500/40 bg-violet-500/5 px-5 py-3 text-sm font-medium text-violet-300 cursor-pointer hover:border-violet-400 hover:bg-violet-500/10 transition-all duration-300 btn-shine">
          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={uploading} />
          {uploading ? 'Uploading…' : '📄 Upload PDF resume'}
        </label>
        <ul className="mt-5 space-y-3">
          {resumesList.length === 0 && <li className="text-slate-500 text-sm">No resumes yet. Upload a PDF.</li>}
          {resumesList.map((r, i) => (
            <li key={r.id || r.fileName} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 border border-white/5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <span className="text-slate-300 font-medium">{r.fileName}</span>
              <span className={`rounded-lg px-3 py-1 text-xs font-medium ${r.parsingStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : r.parsingStatus === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {r.parsingStatus}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl glass border border-white/10 p-6 hover-lift">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 rounded-full bg-gradient-to-b from-cyan-500 to-emerald-500" />
          Skill tests & interviews
        </h2>
        <p className="text-slate-400 text-sm mb-6">Take MCQs and coding tests, then complete AI video interview for a credibility badge.</p>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/dashboard/candidate/skills"
            className="rounded-xl bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 px-5 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 hover:shadow-glow-violet btn-shine"
          >
            Skill tests
          </Link>
          <Link
            href="/dashboard/candidate/interviews"
            className="rounded-xl border-2 border-cyan-500/40 bg-cyan-500/5 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/15 hover:border-cyan-400/60 transition-all duration-300"
          >
            AI interviews
          </Link>
        </div>
      </section>

      <section className="rounded-2xl glass border border-white/10 p-6 hover-lift">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
          Open jobs
        </h2>
        {jobsList.length === 0 && <p className="text-slate-500 text-sm">No jobs listed yet.</p>}
        <ul className="space-y-4">
          {jobsList.map((job, i) => (
            <li key={job.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-violet-500/30 hover:bg-white/10 transition-all duration-300 animate-slide-in-right" style={{ animationDelay: `${i * 0.08}s` }}>
              <div>
                <span className="font-semibold text-white">{job.title}</span>
                {job.requiredSkills?.length ? (
                  <p className="text-slate-500 text-xs mt-1">{job.requiredSkills.join(', ')}</p>
                ) : null}
              </div>
              <Link
                href={`/dashboard/candidate/jobs/${job.id}`}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 btn-shine"
              >
                View & apply
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
