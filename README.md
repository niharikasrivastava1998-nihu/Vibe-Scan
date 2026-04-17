# VibeScan v2

VibeScan v2 is a unified full-stack app with two modes:
- **Social Post Mode**: analyze and rewrite social posts.
- **Email Mode**: connect inbox (Gmail/IMAP), analyze email intent/urgency/risk, and compose/send replies.

## Repository structure

- `client/` — React + Vite + Tailwind + Framer Motion UI.
- `server/` — Express API + OpenAI + Gmail OAuth + IMAP + SMTP.

## Environment variables

Create `server/.env` from `server/.env.example`.

```env
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
SESSION_SECRET=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
PORT=3001
```

For client API base URL (optional), create `client/.env`:

```env
VITE_API_URL=http://localhost:3001
```

## Local development

### 1) Backend
```bash
cd server
npm install
npm run dev
```

### 2) Frontend
```bash
cd client
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:3001`

## GitHub-first hosting strategy

If your source of truth is GitHub, use this approach:

1. Push this repository to GitHub.
2. Deploy `server/` from the GitHub repo to a Node host (Render/Railway/Fly/Heroku-style service).
3. Deploy `client/` from the same GitHub repo to a static frontend host (Vercel/Netlify/Cloudflare Pages/GitHub Pages with custom API origin).
4. Set `VITE_API_URL` on the frontend host to your deployed API URL.
5. Set `GOOGLE_REDIRECT_URI` to your deployed backend callback endpoint.

> GitHub Pages alone cannot host the Express API process; it can only host static files.

## Implemented API routes

- `POST /api/analyze/post`
- `POST /api/analyze/email`
- `GET /api/email/inbox`
- `GET /api/email/thread/:id`
- `POST /api/email/imap/connect`
- `POST /api/email/send`
- `GET /auth/google`
- `GET /auth/google/callback`


## Merge-request friendly command (non-restricted)

If your CI environment blocks package downloads, run this command for MR validation:

```bash
npm run check
```

This performs syntax checks only and does **not** download dependencies, so it works in restricted runners.

A GitHub Action is included at `.github/workflows/merge-ready.yml` and runs the same command so required checks can pass before merge.
