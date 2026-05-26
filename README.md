# AI Code Reviewer

An AI-powered code review tool that analyzes code and pull requests, posts automated review comments via a GitHub App bot, and syncs history across devices — built with Groq, React, Clerk, and Supabase.

**Live demo:** https://ai-code-reviewer-satvik.vercel.app

---

## Features

### Code Review
Paste any code snippet and get a detailed AI review in seconds — bugs, security issues, performance problems, and improvement suggestions with code examples.

### PR Review
Enter a GitHub pull request URL and get a full review of every changed file — critical issues, warnings, and suggestions with per-file breakdowns and stats.

### GitHub App Bot
Install the GitHub App on any repository and it automatically posts AI review comments on every pull request — no manual steps needed.

### Cloud History
Sign in with Google or GitHub (via Clerk) to sync your review history across devices. Anonymous users fall back to localStorage automatically.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| AI | Groq SDK — Llama 3.3 70B |
| Auth | Clerk (Google + GitHub OAuth) |
| Database | Supabase (PostgreSQL) |
| Backend | Express.js on Vercel Serverless |
| GitHub Bot | GitHub App — JWT auth, HMAC webhook verification |
| Deployment | Vercel |

---

## Architecture

```
Browser
  ├── Code/PR review  →  POST /api/review  →  Groq (Llama 3.3 70B)
  ├── History (auth)  →  GET/POST /api/history  →  Supabase
  └── History (anon)  →  localStorage

GitHub
  └── PR opened/updated  →  POST /webhooks/github  →  GitHub App bot
        └── Fetches PR diff  →  Groq review  →  posts comment on PR
```

---

## Local Development

### Prerequisites
- Node.js 18+
- [Groq API key](https://console.groq.com) (free)
- Supabase project (free tier works)
- Clerk account (free tier works)
- GitHub App (optional — only needed for the bot)

### Setup

1. **Clone**
   ```bash
   git clone https://github.com/Satvik100/ai-code-reviewer.git
   cd ai-code-reviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   ```

3. **Backend env** — create `backend/.env`:
   ```
   GROQ_API_KEY=your_groq_api_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GITHUB_APP_ID=your_app_id
   GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   PORT=3001
   ```

4. **Frontend env** — create `frontend/.env`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

5. **Create Supabase table**
   ```sql
   create table reviews (
     id uuid default gen_random_uuid() primary key,
     user_id text not null,
     type text not null,
     title text not null,
     data jsonb not null,
     created_at timestamptz default now() not null
   );
   create index on reviews(user_id, created_at desc);
   ```

6. **Run**
   ```bash
   # Terminal 1 — backend
   cd backend && npm run dev

   # Terminal 2 — frontend
   cd frontend && npm run dev
   ```

   Open http://localhost:5173

---

## Deploying to Vercel

1. Push to GitHub and import on [vercel.com](https://vercel.com)
2. Add environment variables in project settings:
   - `GROQ_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`
3. Deploy — `vercel.json` handles routing automatically

---

## GitHub App Bot Setup

1. Go to GitHub → Settings → Developer settings → GitHub Apps → New GitHub App
2. Set webhook URL to `https://your-deployment.vercel.app/webhooks/github`
3. Permissions: Pull requests (Read & Write), Contents (Read)
4. Subscribe to event: Pull request
5. Generate a private key and note the App ID
6. Add `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET` to Vercel env vars
7. Install the app on any repo — it will automatically review every PR

---

## License

MIT
