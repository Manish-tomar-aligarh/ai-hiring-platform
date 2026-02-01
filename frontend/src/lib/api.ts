const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const auth = {
  login: (email: string, password: string) =>
    api<{ accessToken: string; user: { id: string; email: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { email: string; password: string; fullName: string; role?: string }) =>
    api<{ accessToken: string; user: { id: string; email: string; role: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const users = {
  me: () => api<{ id: string; email: string; fullName: string; role: string }>('/users/me'),
};

export const jobs = {
  list: () => api<Array<{ id: string; title: string; description: string; requiredSkills: string[] }>>('/jobs'),
  get: (id: string) => api(`/jobs/${id}`),
  apply: (id: string) => api(`/jobs/${id}/apply`, { method: 'POST' }),
};

export const resumes = {
  list: () => api<Array<{ id: string; fileName: string; parsingStatus: string }>>('/resumes'),
  upload: (file: File) => {
    const token = getToken();
    const form = new FormData();
    form.append('file', file);
    return fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then((r) => (r.ok ? r.json() : r.json().then((e) => Promise.reject(new Error(e.message)))));
  },
};

export type SkillTestQuestion = {
  question: string;
  options?: string[];
  correctAnswer?: string;
  codeTemplate?: string;
  language?: string;
};

export type SkillTest = {
  id: string;
  title: string;
  skillTags: string[];
  type: string;
  questions: SkillTestQuestion[] | null;
  durationMinutes: number;
  isActive: boolean;
};

export type SkillTestAttempt = {
  id: string;
  skillTestId: string;
  userId: string;
  score: number | null;
  correctCount: number | null;
  status: string;
  completedAt: string | null;
  startedAt: string;
  skillTest?: { title: string };
};

export const skills = {
  listTests: (skillTags?: string) =>
    api<SkillTest[]>('/skills/tests' + (skillTags ? `?skillTags=${encodeURIComponent(skillTags)}` : '')),
  getTest: (id: string) => api<SkillTest>(`/skills/tests/${id}`),
  startAttempt: (testId: string) =>
    api<{ id: string; skillTestId: string; userId: string; status: string; startedAt: string }>(
      `/skills/tests/${testId}/start`,
      { method: 'POST' }
    ),
  submitAttempt: (attemptId: string, answers: Record<number, string>) =>
    api<SkillTestAttempt>(`/skills/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  getMyAttempts: () => api<SkillTestAttempt[]>('/skills/attempts'),
};

export type InterviewQuestion = { question: string };
export type InterviewResponseItem = {
  questionIndex: number;
  transcript?: string;
  relevanceScore?: number;
  sentimentScore?: number;
};

export type Interview = {
  id: string;
  candidateId: string;
  jobId: string | null;
  status: string;
  questions: InterviewQuestion[] | null;
  responses: InterviewResponseItem[] | null;
  overallScore: number | null;
  completedAt: string | null;
  scheduledAt: string;
  job?: { title: string } | null;
  candidate?: { fullName: string; email: string } | null;
};

export const interviews = {
  schedule: (jobId?: string) =>
    api<Interview>('/interviews/schedule', {
      method: 'POST',
      body: JSON.stringify({ jobId: jobId ?? undefined }),
    }),
  list: () => api<Interview[]>('/interviews'),
  listAll: () => api<Interview[]>('/interviews/all'),
  get: (id: string) => api<Interview>(`/interviews/${id}`),
  submitResponse: (id: string, questionIndex: number, transcript: string) =>
    api<Interview>(`/interviews/${id}/response`, {
      method: 'POST',
      body: JSON.stringify({ questionIndex, transcript }),
    }),
  complete: (id: string, videoBlob?: Blob) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (videoBlob) {
      const form = new FormData();
      form.append('file', videoBlob, 'interview.webm');
      return fetch(`${API_BASE}/interviews/${id}/complete`, {
        method: 'POST',
        headers,
        body: form,
      }).then((r) => (r.ok ? r.json() : r.json().then((e) => Promise.reject(new Error(e.message)))));
    }

    return api<Interview>(`/interviews/${id}/complete`, { method: 'POST' });
  },
};

export const admin = {
  setup: (data: any) => api('/admin/setup', { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => api<any>('/admin/stats'),
  getUsers: () => api<any[]>('/admin/users'),
  deleteUser: (id: string) => api(`/admin/users/${id}`, { method: 'DELETE' }),
  getJobs: () => api<any[]>('/admin/jobs'),
  deleteJob: (id: string) => api(`/admin/jobs/${id}`, { method: 'DELETE' }),
  getInterviews: () => api<any[]>('/admin/interviews'),
  deleteInterview: (id: string) => api(`/admin/interviews/${id}`, { method: 'DELETE' }),
};
