# Leo Learn

A polished English-learning prototype with a real phone-number authentication
flow. Leo Learn demonstrates a mobile learning flow with a small course,
scripted practice, progress tracking, and a lightweight Leo chat experience.

Accounts use **mobile number + password + SMS OTP** (no email). The auth UI is
fully implemented, and the repo ships a runnable auth API (`server/auth`) with
scrypt password hashing, hashed one-time codes, HttpOnly cookie sessions, and
rate limiting. A real SMS provider account and production database are still
required for deployment — see [`docs/auth.md`](docs/auth.md).

## Requirements

- Node.js 22 or newer (the auth server uses `node:sqlite`)
- npm 10 or newer

Check your versions:

```bash
node --version
npm --version
```

## Install and run

From the repository root:

```bash
npm ci
```

Run the auth API in one terminal:

```bash
# Windows PowerShell
$env:AUTH_SESSION_SECRET = "local-development-secret-32-characters"
$env:AUTH_SMS_PROVIDER = "console"
npm run auth:server

# macOS / Linux
AUTH_SESSION_SECRET="local-development-secret-32-characters" \
AUTH_SMS_PROVIDER=console npm run auth:server
```

The `console` SMS provider is development-only: the OTP is printed **only in the
server log**, never returned to the browser or shown in the UI. In production,
set `AUTH_SMS_PROVIDER=kavenegar` with real credentials.

Run the app in another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The quickest demo path is:

1. Open `/App/sign-up` and create an account with any valid mobile number.
2. Read the 6-digit code from the auth server terminal.
3. Finish onboarding (level and goal).
4. Choose **Start today’s lesson**.
5. Open the café lesson, answer all three exercises, and finish the lesson.
6. Open **Progress** to see the saved lesson, word, and streak totals.

For a production-style local check:

```bash
npm run build
npm run start
```

Type checking and linting:

```bash
npx.cmd tsc --noEmit
npm run lint
```

Tests:

```bash
npm test
npm run test:server
```

## GitHub Pages deployment

The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` builds a static export and deploys the generated `out/` directory on pushes to `main` or when run manually. In the repository, select **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site URL is `https://ahura2009.github.io/Leo-Learn/`.

To test the Pages build locally, set `NEXT_PUBLIC_BASE_PATH=/Leo-Learn` when running `npm run build`. This enables static export, the repository base path, trailing-slash routes, and unoptimized local images. The default `npm run build` and `npm run start` commands remain unchanged for Vercel and local server deployment; `next start` does not serve a static `out/` export.

**Static hosting cannot run authentication.** GitHub Pages only serves files, so
sign-in is active only when the build points at a deployed auth API
(`NEXT_PUBLIC_AUTH_API_URL`) on a same-site HTTPS domain. Without it, the auth
screens show an explicit “service not configured” notice instead of simulating
an OTP. See [`docs/auth.md`](docs/auth.md) for the deployment requirements.

## What this prototype includes

- Sign up, sign in, SMS OTP verification, forgot/reset password, and sign out
- Country-code picker with international phone validation (E.164 stored)
- Show/hide password, password strength, terms consent, resend cooldown,
  attempt limits, duplicate-phone prevention, and Persian error messages
- Phone-based session gating: signed-out → sign-in, new users → onboarding,
  returning users → dashboard
- Home, Learn, Unit, Lesson preview, Practice, Completion, Progress, Leo Chat, and Profile screens
- A playable three-exercise café lesson
- Progress persisted per account in browser `localStorage` under `leo-learn:progress:<userId>`
- Responsive mobile-first UI using the existing Leo design system
- Scripted, keyword-based Leo replies that require no API key

## Prototype limitations

- A real SMS provider account (Kavenegar or a webhook) is not configured in this
  repository; without it, sign-up cannot deliver codes in production.
- The reference auth server uses SQLite and in-process rate limiting. A
  production rollout needs Postgres, Redis-backed rate limiting, and monitoring.
- Progress is still local to the browser and device; lessons are not yet synced
  server-side. Clearing site data resets that account’s progress.
- No email, payment, analytics, voice/video, or real AI integration.

## Project scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run auth:server` — start the auth API (reads `.env.local` if present)
- `npm test` — run client-side unit tests
- `npm run test:server` — run auth service tests

