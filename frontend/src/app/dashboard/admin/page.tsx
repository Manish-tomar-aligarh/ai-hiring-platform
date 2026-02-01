'use client';

import { useEffect, useState } from 'react';
import { admin } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.getStats()
      .then(setStats)
      .catch((err) => setError(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading stats...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'from-blue-500 to-cyan-500' },
    { label: 'Candidates', value: stats.candidates, color: 'from-violet-500 to-purple-500' },
    { label: 'Recruiters', value: stats.recruiters, color: 'from-emerald-500 to-teal-500' },
    { label: 'Active Jobs', value: stats.totalJobs, color: 'from-orange-500 to-red-500' },
    { label: 'Interviews', value: stats.totalInterviews, color: 'from-pink-500 to-rose-500' },
    { label: 'Skill Tests', value: stats.totalSkillTests, color: 'from-amber-500 to-yellow-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold gradient-text-red mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 mb-8">System overview and statistics.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="rounded-2xl glass border border-white/10 p-6 hover-lift">
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl glass border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/dashboard/admin/users" className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all">
              Manage Users &rarr;
            </a>
            <a href="/dashboard/admin/jobs" className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all">
              Manage Jobs &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
