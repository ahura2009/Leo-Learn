# Leo Learn

A polished, local-first English-learning prototype. Leo Learn demonstrates a mobile learning flow with a small course, scripted practice, progress tracking, and a lightweight Leo chat experience.

## Requirements

- Node.js 20.9 or newer
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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The quickest demo path is:

1. Open `/home` (or choose **Explore the demo** on the welcome screen).
2. Choose **Start today’s lesson**.
3. Open the café lesson, answer all three exercises, and finish the lesson.
4. Open **Progress** to see the saved lesson, word, and streak totals.
5. Use the bottom navigation to try **Leo Chat** and **Profile**.

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

## What this prototype includes

- Home, Learn, Unit, Lesson preview, Practice, Completion, Progress, Leo Chat, and Profile screens
- A playable three-exercise café lesson
- Progress persisted in browser `localStorage` under `leo-learn:progress`
- Responsive mobile-first UI using the existing Leo design system
- Scripted, keyword-based Leo replies that require no API key

## Prototype limitations

This is intentionally not a production service. It has no real AI integration, voice/video, authentication, database, payments, analytics, or backend. Some course lessons and skill/activity panels are preview or illustrative content. Progress is local to the current browser and device; clearing site data resets it. No environment variables are required, so there is no `.env.example` file.

## Project scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
