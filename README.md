# RunPlan AI

Generates a personalized running training plan from a short intake form
(objective, level, sessions per week, timeline, constraints), using the Gemini
API. Tracks progress with a list or calendar view.

**Demo:** https://runplan-ai-wheat.vercel.app/

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (arbitrary values to match the design)
- [Zod](https://zod.dev/) to validate the API's input/output
- [Google Gemini](https://ai.google.dev/) (`@google/genai`) for plan generation
- [Vercel](https://vercel.com/) serverless function (`api/generate-plan.ts`)
- [Supabase](https://supabase.com/) — anonymous auth + `profiles`/`plans`/`sessions`
  tables (`supabase/migrations/`)

## MVP scope

- [x] Profile intake form (objective, level, sessions/week, timeline, constraints)
- [x] AI-generated training plan (Gemini, structured JSON validated with Zod)
- [x] List view and calendar view
- [x] Session completion tracking with a progress bar
- [x] Persistence via Supabase (anonymous auth + `profiles`/`plans`/`sessions`
      tables)

## Local development

```bash
npm install
```

Required environment variables (`.env` / `.env.local`, not committed):

- `GEMINI_API_KEY` — Gemini API key, used by `api/generate-plan.ts`
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — for Supabase persistence (coming soon)

The form alone (without the generation API) runs with:

```bash
npm run dev
```

To test the full flow (frontend + the `/api/generate-plan` function):

```bash
vercel dev
```

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run lint` — ESLint
- `npm run preview` — preview the production build
