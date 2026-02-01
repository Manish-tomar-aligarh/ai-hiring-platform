# AI-Powered Smart Hiring & Skill Verification Platform

**Leetcode + Resume Screening + AI Interview + Skill Verification – all in one.**

Backend-heavy, scalable hiring platform with JWT auth, RBAC, resume upload & AI parsing, skill tests, AI interview stubs, and recruiter/candidate dashboards.

---

## Features

### For Candidates
- Upload resume (PDF) → AI extracts skills, experience, projects
- Auto-generated skill tests (MCQs + coding)
- AI video interview (speech + sentiment analysis stubs)
- Skill score + credibility badge
- Apply to jobs

### For Recruiters
- Post job requirements
- AI-matched candidates (matching engine stub)
- View skill authenticity score
- Auto shortlist
- Analytics dashboard

---

## Tech Stack

| Layer | Stack |
|-------|--------|
| **Backend** | NestJS (Node.js + TypeScript), JWT, bcrypt, RBAC |
| **API** | REST, Swagger/OpenAPI |
| **DB** | PostgreSQL (TypeORM) |
| **Cache** | Redis (config ready) |
| **AI** | Resume parsing stub, skill matching stub, interview Q&A stubs |
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **DevOps** | Docker Compose (Postgres + Redis) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or use Docker)
- (Optional) Redis

### 1. Clone and install
```bash
cd major
npm install
```

### 2. Database (choose one)
- **Option A – SQLite (no Docker):** Set `USE_SQLITE=1` in `backend/.env`. Backend uses `backend/data/smart_hiring.sqlite`.
- **Option B – PostgreSQL:** Run `docker-compose up -d`, then remove or set `USE_SQLITE=0` in `backend/.env`.

### 3. Backend
```bash
cd backend
cp .env.example .env
# Edit .env if needed (DB_HOST, DB_PASSWORD, JWT_SECRET)
npm install
npm run dev
```
Backend: **http://localhost:4000**  
Swagger: **http://localhost:4000/api/docs**

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: **http://localhost:3000**

### 5. Try it
- **Register** as Candidate or Recruiter at `/register`
- **Candidate**: Upload resume (PDF), browse jobs, apply
- **Recruiter**: Post a job, view applications at `/dashboard/recruiter/jobs/:id`

---

## Project Structure

```
major/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── common/          # Guards, decorators, enums
│   │   ├── config/         # TypeORM, Redis
│   │   ├── modules/
│   │   │   ├── auth/       # JWT, register, login
│   │   │   ├── users/      # Profile
│   │   │   ├── jobs/       # CRUD, apply, shortlist
│   │   │   ├── resumes/    # Upload PDF, AI parsing stub
│   │   │   ├── skills/     # Skill tests, attempts
│   │   │   ├── interviews/ # AI interview stub
│   │   │   └── ai/         # Parse, match, questions, score
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
├── frontend/                # Next.js App Router
│   ├── src/
│   │   ├── app/            # Pages: login, register, dashboard/*
│   │   └── lib/            # api.ts (auth, jobs, resumes)
│   └── package.json
├── docker-compose.yml      # Postgres + Redis
└── README.md
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register (candidate/recruiter) |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/users/me` | Current user (JWT) |
| GET/POST/PATCH | `/api/v1/jobs` | List, create, update jobs |
| POST | `/api/v1/jobs/:id/apply` | Apply (candidate) |
| GET | `/api/v1/jobs/:id/applications` | Applications (recruiter) |
| POST | `/api/v1/resumes/upload` | Upload PDF (multipart) |
| GET | `/api/v1/skills/tests` | List skill tests |
| POST | `/api/v1/skills/tests/:id/start` | Start attempt |
| POST | `/api/v1/interviews/schedule` | Schedule AI interview |

Full docs: **http://localhost:4000/api/docs**

---

## Resume Impact

> *"Built an AI-driven hiring platform handling resume parsing, skill verification, and interview automation using NestJS, PostgreSQL, Redis, and AI APIs. Designed scalable microservices architecture deployed on AWS with Docker."*

---

## License

MIT.
