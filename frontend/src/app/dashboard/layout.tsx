'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { users } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName?: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.replace('/login?redirect=' + encodeURIComponent(pathname || ''));
      return;
    }
    users
      .me()
      .then(setUser)
      .catch(() => router.replace('/login?redirect=' + encodeURIComponent(pathname || '')))
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <span className="text-slate-400 animate-pulse">Loading…</span>
        </div>
      </div>
    );
  }

  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';
  const dashboardHref = isAdmin 
    ? '/dashboard/admin' 
    : isRecruiter 
      ? '/dashboard/recruiter' 
      : '/dashboard/candidate';

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold gradient-text transition-opacity hover:opacity-90">
            Smart Hiring
          </Link>
          <nav className="flex gap-1">
            <Link
              href={dashboardHref}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                pathname === dashboardHref
                  ? 'text-white bg-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/dashboard/admin/users"
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname?.startsWith('/dashboard/admin/users')
                      ? 'text-white bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/dashboard/admin/jobs"
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname?.startsWith('/dashboard/admin/jobs')
                      ? 'text-white bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Jobs
                </Link>
                <Link
                  href="/dashboard/admin/interviews"
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname?.startsWith('/dashboard/admin/interviews')
                      ? 'text-white bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Interviews
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm truncate max-w-[180px]">
            {user?.role === 'admin' && <span className="text-red-400 font-bold mr-2">[ADMIN]</span>}
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
