# Caption AI

Caption AI helps medical and dental practices turn everyday clinic updates, practice knowledge, and educational ideas into social media captions written in their voice.

The application is built with Next.js App Router, TypeScript, Supabase Auth/PostgreSQL, and the server-side OpenAI API. Authenticated dashboard routes and existing caption, draft, knowledge-bank, calendar, social-account, and billing features are retained.

## Features

- Practice onboarding, authenticated accounts, profile settings, and multi-tenant Supabase row-level security.
- Practice-aware caption generation with writing-tone, voice-sample, platform, caption-count, and knowledge-bank context.
- Editable saved drafts, a knowledge bank, content calendar, social-account connections, and scheduling integrations.
- Dashboard analytics with per-user daily streak, best streak, total active days, and a year-long activity heatmap.
- Daily topic suggestions tailored to the practice specialty, preferred topics, tone, and knowledge-bank notes, with curated medical/dental suggestions if OpenAI is unavailable.
- Topic-to-caption workflow that opens the existing caption generator with the topic and discussion prompts pre-filled.

## Requirements

- Node.js 20 or newer. Use Node.js 26 or newer to run the included built-in Node test command.
- npm.
- A Supabase project with Auth and the project's PostgreSQL schema.
- An OpenAI API key for AI-generated captions and personalized daily topics. Curated topic suggestions are used when AI topic generation is unavailable.

## Local development

From the repository root:

```powershell
npm install
Copy-Item .env.example .env.local
```

Configure the values in `.env.local`, then start Next.js:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To use a different port, run `npm run dev -- --port 3001` and allow the matching redirect URL in Supabase Auth settings.

## Environment variables

Copy `.env.example` to `.env.local` and configure the integrations you use:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Application URL used by authentication redirects. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anonymous key for the authenticated browser and server clients. |
| `OPENAI_API_KEY` | Server-side OpenAI key for caption generation and personalized topic suggestions. |
| `OPENAI_MODEL` | OpenAI model name; the code defaults to `gpt-4o`. |
| `POSTIZ_API_BASE_URL` | Base URL for the Postiz scheduling integration. |
| `SUPABASE_SECRET_KEY` | Optional server-only service key for integrations that explicitly require elevated access. Never expose it through `NEXT_PUBLIC_*` or client code. |
| `APPLICATION_ENCRYPTION_KEY` | 32-byte hexadecimal key used to encrypt stored integration credentials. |

Payment-provider, OAuth, and email variables in `.env.example` are optional and depend on the integration being configured. Do not commit `.env.local`, API keys, Supabase secrets, or database passwords.

### Supabase keys and database connections

The Supabase project URL and publishable key are for Supabase Auth and the PostgREST API; they are **not** PostgreSQL database-login credentials. To use a desktop SQL client, choose a PostgreSQL driver and get the database host, port, database name, username, and database password from the Supabase Dashboard's **Connect** panel. A Microsoft SQL Server driver cannot connect to Supabase PostgreSQL.

## Database migrations

Apply the existing `supabase/migrations/001_initial_schema.sql` to initialize the application schema. Then apply `supabase/migrations/002_dashboard_activity.sql` to enable dashboard activity statistics.

In the Supabase Dashboard, select the project's **SQL Editor**, paste the contents of the migration that has not yet been applied, and run it. The dashboard migration:

- Adds an index for user/practice/date filtering on saved caption drafts.
- Adds `caption_activity_by_day`, a security-invoker PostgreSQL function that groups a user's saved captions by date in the practice time zone.
- Uses the existing `captions` table and its `created_by` identity; it does not add a duplicate caption table or activity-event store.

If the local Supabase CLI migration history is already synchronized with the remote project, migrations may instead be applied with:

```powershell
npx supabase db push
```

Do not use this command against a production database until you have linked and verified the intended Supabase project and migration history.

## Dashboard activity and topics

A successfully generated caption is saved as a draft by the existing server-side caption generation route. Activity is derived from those saved draft records. Each heatmap cell shows the number of captions saved by the signed-in user on that local calendar date; multiple captions on one date count as a single active day for streak calculations. The current streak continues if today **or yesterday** is active, and ends after a missed day. The configured practice time zone is used for date boundaries and year transitions.

Daily topic suggestions use the authenticated practice's name, practice type, specialties, preferred writing tone and topics, and recent active knowledge-bank notes. Generated suggestions are validated and fall back to curated medical/dental topics when necessary. Topic prompts are passed to the existing caption generator; the normal platform and caption-count controls remain available, generated drafts can be edited, and edits can be saved.

## Validation and production

Run the focused dashboard-logic tests:

```powershell
node --test tests/unit/streaks.test.mts
```

Run lint and the production build:

```powershell
npm run lint
npm run build
npm run start
```

The focused tests cover same-day deduplication, today/yesterday/missed-day streak behavior, year transitions, time-zone-local dates, leap days, heatmap positioning and month labels, intensity levels, and medical/dental fallback topics.

## Project structure

```text
src/app/(dashboard)/dashboard/   Authenticated dashboard pages
src/app/api/                     Authenticated API routes
src/components/dashboard/        Reusable dashboard feature components
src/lib/dashboard/               Activity streak and heatmap calculations
src/services/ai/                 Server-side AI caption and topic services
supabase/migrations/             PostgreSQL schema and migrations
tests/unit/                      Focused unit tests
```
