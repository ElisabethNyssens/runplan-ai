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

## Next steps

- Add recent race results to the intake form, for a more accurate plan
- Improve the Gemini prompt to include target paces, not just session type/duration
- Better loading state during plan generation (hide the form, show a spinner/
  progress indicator instead of just changing the button text)
- Fix responsive issues (horizontal scroll on mobile)
- Improve navigation — e.g. browsing previous plans (the schema already keeps
  a history of `plans` per user, but there's no UI for it yet)
- Edit an existing plan without fully regenerating it
- Per-session notes / how-it-felt field
- Loading state while fetching the profile/plan on mount
- Error handling for the initial session/profile/plan fetch (only the submit
  flow surfaces errors today)
- Automated tests
- Upgrade path from anonymous auth to a durable account

## Local development

```bash
npm install
```

Required environment variables (`.env` / `.env.local`, not committed):

- `GEMINI_API_KEY` — Gemini API key, used by `api/generate-plan.ts`
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — for Supabase persistence

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
