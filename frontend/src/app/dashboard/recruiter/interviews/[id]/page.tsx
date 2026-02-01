'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { interviews, type Interview } from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export default function RecruiterInterviewDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    interviews
      .get(id)
      .then(setInterview)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!interview) return <div className="p-8 text-center text-slate-500">Interview not found</div>;

  const videoSrc = (interview as any).videoUrl 
    ? `${BACKEND_URL}${(interview as any).videoUrl}` 
    : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <Link href="/dashboard/recruiter/interviews" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
        <span>←</span> Back to Interviews
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Video & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
            {videoSrc ? (
              <video 
                src={videoSrc} 
                controls 
                className="w-full aspect-video bg-black"
                poster="/video-placeholder.png"
              />
            ) : (
              <div className="aspect-video flex items-center justify-center text-slate-500 bg-slate-900">
                No video recording available
              </div>
            )}
          </div>

          <div className="rounded-2xl glass border border-white/10 p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Candidate Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Name</label>
                <div className="text-slate-200 font-medium">{interview.candidate?.fullName || 'Unknown'}</div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Email</label>
                <div className="text-slate-200">{interview.candidate?.email || '–'}</div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Job Applied</label>
                <div className="text-slate-200">{interview.job?.title || 'General'}</div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Date</label>
                <div className="text-slate-200">{new Date(interview.scheduledAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-6">
          <div className="rounded-2xl glass border border-white/10 p-6 text-center">
            <div className="text-sm text-slate-400 mb-1">Overall AI Score</div>
            <div className={`text-6xl font-bold ${
              (interview.overallScore ?? 0) >= 70 ? 'text-emerald-400' : 
              (interview.overallScore ?? 0) >= 40 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {interview.overallScore ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-2">out of 100</div>
          </div>

          <div className="rounded-2xl glass border border-white/10 p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-white mb-4 sticky top-0 bg-[#0f172a] py-2 border-b border-white/10">
              Question Analysis
            </h3>
            <div className="space-y-6">
              {interview.questions?.map((q, i) => {
                const response = interview.responses?.find(r => r.questionIndex === i);
                return (
                  <div key={i} className="relative pl-4 border-l-2 border-slate-700">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600" />
                    <p className="text-sm font-medium text-slate-200 mb-2">
                      Q{i + 1}: {q.question}
                    </p>
                    {response ? (
                      <div className="bg-slate-800/50 rounded-lg p-3 text-xs space-y-2">
                        <div className="text-slate-400 italic">"{response.transcript}"</div>
                        <div className="flex gap-3 pt-2 border-t border-white/5">
                          <div>
                            <span className="text-slate-500">Relevance: </span>
                            <span className={response.relevanceScore && response.relevanceScore > 70 ? 'text-emerald-400' : 'text-amber-400'}>
                              {response.relevanceScore}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Sentiment: </span>
                            <span className="text-blue-400">{response.sentimentScore}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-red-400">No response recorded</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
