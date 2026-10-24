# Caption AI

Caption AI is a full-stack social-content workspace for medical and dental practices. It helps a practice turn its profile, approved knowledge, and topic ideas into editable social captions, then organize drafts and scheduled content.

## Product capabilities

- Email/password authentication, confirmation callbacks, password recovery, and practice onboarding.
- Practice-specific caption generation with selectable social platform, caption count, language, tone, length, and style options.
- Saved drafts, editing, knowledge-bank notes, voice samples, social connections, scheduling, and billing pages.
- A user-specific daily activity streak and year-long caption heatmap based on saved caption records.
- Medical/dental topic ideas with safe curated suggestions when OpenAI is not configured.
- Row Level Security (RLS) for Supabase-backed tenant data.

## Technology

| Area | Technology |
| --- | --- |
| Frontend and server rendering | Next.js App Router, React, TypeScript |
| UI | React components, CSS design tokens, Lucide icons |
| Authentication and data API | Supabase Auth, `@supabase/ssr`, Supabase JavaScript client |
| Database | Supabase PostgreSQL with SQL migrations and RLS |
| Request validation | Zod |
| Caption and topic AI | Server-side OpenAI API |
| Social publishing integration | Postiz client |
| Tests | Node.js test runner for dashboard activity logic |

## Application architecture

### Frontend

The frontend is in `src/app` and `src/components`. App Router pages are grouped by user journey:

- `src/app/(marketing)/` — public product pages.
- `src/app/(auth)/` — sign-in, sign-up, password reset, and confirmation flows.
- `src/app/onboarding/` — practice profile, topic, tone, and voice setup.
- `src/app/(dashboard)/dashboard/` — overview, caption generation, drafts, knowledge bank, calendar, social accounts, settings, and billing.
- `src/components/dashboard/` — streak statistics, activity heatmap, and today's topic.
- `src/components/layout/` — authenticated dashboard navigation and shell.

The topic-to-caption workflow passes the selected title and discussion prompts into the existing caption form. Users choose the platform and number of captions before generating.

### Backend and API

Next.js Route Handlers in `src/app/api` implement the server-side API. They read the authenticated Supabase session, validate requests, query data through the user's Supabase client, and return consistent API responses.

| Route group | Responsibility |
| --- | --- |
| `/api/auth/*` | PKCE/token-hash callback and development-only demo login |
| `/api/practices` | List and create practices |
| `/api/practices/[practiceId]/*` | Practice profile, captions, generation, notes, topics, media, social connections, and scheduled posts |
| `/api/captions/[captionId]` | Read, edit, or delete a caption |
| `/api/captions/[captionId]/schedule` | Schedule caption content |
| `/api/notes/[noteId]` | Update or delete a knowledge-bank note |
| `/api/dashboard/metrics` | Authenticated dashboard metrics |
| `/api/scheduled-posts/[scheduledPostId]/cancel` | Cancel a scheduled post |

`src/lib/supabase/server.ts` creates the cookie-aware server client. `src/lib/supabase/client.ts` creates the browser client using only the public publishable key. `src/lib/supabase/middleware.ts` refreshes sessions and protects authenticated routes. Never trust a browser-supplied user ID; use the authenticated session and database RLS.

### AI services and models

AI integrations live in `src/services/ai`:

- `caption-generator.ts` builds a constrained prompt from the practice profile, writing samples, selected options, and relevant knowledge notes; it validates the generated result before drafts are saved.
- `topic-generator.ts` requests a personalized practice topic, validates the output, and falls back to curated medical/dental topics when OpenAI is unavailable.
- `OPENAI_MODEL` selects the server-side OpenAI model. The current default is `gpt-4o`.

The AI provider is not the application's database model. AI output is stored as ordinary caption draft records in Supabase. A valid `OPENAI_API_KEY` is required for AI caption generation; curated topic suggestions do not require it.

### Database model

The canonical PostgreSQL schema is in `supabase/migrations`. `src/types/database.ts` contains generated TypeScript table definitions, while `src/types/index.ts` exports application-facing entity and API types.

Core data entities include:

- `profiles` — user profile data linked to Supabase Auth.
- `organizations` and `organization_members` — tenant ownership and membership.
- `practices` — practice specialty, tone, preferred topics, locale, and onboarding state.
- `voice_samples` and `knowledge_notes` — practice-approved writing references and reusable facts.
- `captions` — generated/saved content, status, platform, and generation metadata.
- `media_assets`, `caption_media`, `social_connections`, and `social_accounts` — media and publishing integrations.
- `scheduled_posts` and `scheduling_attempts` — publishing schedule and delivery tracking.
- `subscriptions`, `usage_records`, and `audit_events` — plan, usage, and audit data.

RLS policies scope records to the authenticated user’s organization/practice. Dashboard activity is derived from saved captions and the `caption_activity_by_day` database function; no random or synthetic activity is inserted.

## Requirements

- Node.js 20 or newer and npm.
- A Supabase project with Auth enabled.
- A valid OpenAI API key to generate captions and personalized topics (optional for curated topic fallback).
- Postiz, OAuth, payment, or email-provider credentials only if you enable those integrations.

## Run locally

From the repository root:

```powershell
npm install
Copy-Item .env.example .env.local
```

Set at least `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Add a valid `OPENAI_API_KEY` for caption generation. Then start the development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production-mode local run:

```powershell
npm run build
npm run start
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL used for auth redirects, e.g. `http://localhost:3000`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Public Supabase key used by Auth and the PostgREST client. |
| `OPENAI_API_KEY` | For AI captions | Server-side OpenAI credential. Never add a `NEXT_PUBLIC_` prefix. |
| `OPENAI_MODEL` | No | OpenAI model identifier; defaults to `gpt-4o`. |
| `SUPABASE_SECRET_KEY` | Integration-specific | Server-only elevated Supabase key. Avoid it unless a server operation explicitly requires it. |
| `POSTIZ_API_BASE_URL` | Integration-specific | Postiz service base URL for social publishing. |
| `APPLICATION_ENCRYPTION_KEY` | Integration-specific | 32-byte hex key for encrypting stored integration credentials. |
| `NEXT_PUBLIC_ENABLE_DEMO_LOGIN` | Local demo only | Set to `true` to show the demo button in development. |
| `SUPABASE_DEMO_EMAIL` | Local demo only | Email of a pre-provisioned demo Auth user. |
| `SUPABASE_DEMO_PASSWORD` | Local demo only | Password of that demo Auth user; server-only. |

Optional payment, OAuth, and email-provider variables are listed as examples in `.env.example`. Keep real credentials in an untracked `.env.local` or a deployment secret manager. Never commit service keys, database passwords, OpenAI keys, or demo passwords.

## Supabase setup

### Database migrations

Apply migrations in order to the intended Supabase project:

1. `supabase/migrations/001_initial_schema.sql` — core application tables, indexes, functions, and RLS policies.
2. `supabase/migrations/002_dashboard_activity.sql` — caption activity index and timezone-aware daily activity function.
3. `supabase/migrations/003_onboarding_access.sql` — owner recovery access for onboarding and restricted initial free-plan subscription creation.

Use the Supabase Dashboard **SQL Editor** for projects whose migration history is not managed by the local CLI. Use `npx supabase db push` only after linking the correct project and checking that local and remote migration histories are synchronized.

### Authentication URLs and email

For local development, set the Supabase Auth **Site URL** to `http://localhost:3000` and allow `http://localhost:3000/api/auth/callback` in the redirect URL configuration. For another host or port, add its callback URL too.

New accounts use email confirmation. Supabase's default email sender is rate-limited; configure a verified custom SMTP provider in **Authentication → Emails → SMTP Settings** for reliable delivery. The auth callback supports both PKCE codes and token-hash confirmation links. If a confirmation link has expired or was already used, request a fresh confirmation email and use the newest link. Do not disable confirmation on a shared or production project to bypass email limits.

### Development demo account

The optional demo button and `/api/auth/demo-login` endpoint are restricted to `NODE_ENV=development` and `NEXT_PUBLIC_ENABLE_DEMO_LOGIN=true`. Configure the demo email and password only in `.env.local`, and create/confirm the matching Auth user in Supabase before use. The demo account should have its own isolated organization and practice. Do not put demo credentials in this README, source code, or GitHub.

## Validation

Run the focused streak and heatmap unit tests:

```powershell
node --test tests/unit/streaks.test.mts
```

Run lint, type-check, and production build:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

The activity tests cover same-day de-duplication, today/yesterday/missed-day streaks, year boundaries, timezone-local dates, leap days, heatmap positions and labels, intensity levels, and curated medical/dental topic fallback.

## Repository map

```text
src/
  app/
    (auth)/                     Sign-in, sign-up, confirmation and password recovery
    (dashboard)/                Authenticated dashboard layout and product pages
    (marketing)/                 Public marketing pages
    api/                         Next.js Route Handler API
    onboarding/                  Practice onboarding flow
  components/
    dashboard/                   Reusable streak, heatmap and topic UI
    layout/                      Dashboard navigation shell
  config/                        Product options and shared configuration
  lib/
    dashboard/                   Streak and heatmap calculations
    security/                    API responses and credential encryption
    supabase/                    Browser, server, middleware and dashboard clients
    validation/                  Zod request schemas
  services/
    ai/                          Caption and topic generation
    postiz/                       Social publishing client
  types/                          Database-generated and domain/API types
supabase/
  migrations/                     PostgreSQL schema changes and RLS policies
tests/
  unit/                           Activity logic tests
```
