# SXV Studio

SXV Studio is an Angular frontend with an Express/MySQL backend, Stripe billing hooks, and Supabase-backed audio storage.

## Repo Structure

- `src/`: Angular app
- `backend/`: Express API, auth, Stripe, profile, uploads, and database models

## Local Development

Frontend:

```bash
npm install
npm run start:frontend
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Local defaults:

- frontend: `http://localhost:4200`
- backend: `http://localhost:3000`

## Deployment Readiness

This repo has been updated so the frontend no longer hardcodes `localhost` API and asset URLs.

Frontend production behavior:

- `src/environments/environment.prod.ts` uses a same-origin API base by default
- that means production builds work when your deployed app serves `/api/*` and `/uploads/*` from the same domain
- if your frontend is hosted separately from the backend, set `apiBaseUrl` in `src/environments/environment.prod.ts` to your public backend URL before building

Backend production behavior:

- if `dist/sxv-studio` exists, the backend will serve the built Angular app automatically
- API routes remain under `/api/*`
- uploaded files remain under `/uploads/*`

## Required Backend Environment Variables

Create `backend/.env` from `backend/.env.example`.

Core app:

- `PORT`
- `APP_BASE_URL`
- `SUPABASE_RESET_REDIRECT_URL`
- `JWT_SECRET`

Database:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL`
- `DB_SSL_REJECT_UNAUTHORIZED`

Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Stripe:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Email:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_NAME`
- `SMTP_FROM_EMAIL`

## Build Commands

Frontend production build:

```bash
npm run build:prod
```

Backend start:

```bash
cd backend
npm start
```

From the repo root you can also run:

```bash
npm run start:backend
```

For Railway/Nixpacks deployments from the repo root:

- `nixpacks.toml` installs both root and backend dependencies
- builds the Angular frontend
- starts the Express backend with `node backend/server.js`

## Suggested Deployment Patterns

### Option 1: Single service

1. Install frontend dependencies
2. Install backend dependencies
3. Run `npm run build:prod`
4. Start the backend server

The backend will serve both the API and the Angular build.

### Option 2: Split frontend and backend

1. Deploy `backend/` to a Node host
2. Set backend env vars from `backend/.env.example`
3. Set `apiBaseUrl` in `src/environments/environment.prod.ts` to the backend’s public URL
4. Build the frontend with `npm run build:prod`
5. Deploy `dist/sxv-studio` to your static host

## Verification

Run this before pushing deployment changes:

```bash
npm run build:prod
```

That confirms the Angular app builds with the deployment-oriented configuration.
