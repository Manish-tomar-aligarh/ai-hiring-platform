# Render Deploy – Fix "Failed to fetch" (Register / Login)

## Why it happens
- Frontend (e.g. `https://ai-hiring-frontend.onrender.com`) calls the **backend API** for register/login.
- If the frontend does not know the backend URL, it calls `/api/v1` on its **own** URL → no API there → **"Failed to fetch"**.
- Backend must also **allow** the frontend URL in CORS.

## 1. Backend (already fixed in code)
- CORS now allows: `https://ai-hiring-frontend.onrender.com`.
- Optional: in Backend service → **Environment** add `CORS_ORIGIN` = `https://ai-hiring-frontend.onrender.com` (or comma-separated list) if you use a different frontend URL.

## 2. Frontend – set backend API URL (required)
- In Render: open your **Frontend** service → **Environment**.
- Add (or update):
  - **Key:** `NEXT_PUBLIC_API_URL`
  - **Value:** `https://YOUR-BACKEND-SERVICE-NAME.onrender.com/api/v1`  
    Replace `YOUR-BACKEND-SERVICE-NAME` with your real backend service name (e.g. `ai-hiring-platform` or `ai-hiring-backend`).
- Example: if backend URL is `https://ai-hiring-platform.onrender.com`, set:
  ```env
  NEXT_PUBLIC_API_URL=https://ai-hiring-platform.onrender.com/api/v1
  ```
- **Save** and trigger a **new deploy** (Redeploy or push a commit).  
  Next.js bakes `NEXT_PUBLIC_*` in at **build** time, so a new build is required after changing this.

## 3. Check
- After frontend redeploy, open `https://ai-hiring-frontend.onrender.com/register` and try **Sign up** again.
- If it still fails, in browser DevTools → **Network** tab, click the failed request and check:
  - **Request URL** – should be `https://YOUR-BACKEND.onrender.com/api/v1/auth/register`, not the frontend URL.
  - **Response** – CORS or 4xx/5xx errors will show the exact issue.
