This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Dashboard activity and topic suggestions

The dashboard shows daily, best, and total saved-caption streaks and a year-long activity heatmap. Activity is derived from the existing `captions` table and grouped by the practice's configured time zone. A saved draft is attributed to its authenticated `created_by` user, and multiple drafts on one date count as one streak day.

Apply `supabase/migrations/002_dashboard_activity.sql` to the Supabase project after the initial schema. In the Supabase Dashboard, open **SQL Editor**, paste the migration, and run it. The migration adds an index and a security-invoker activity function; it does not create duplicate caption or activity tables. It can also be applied with `npx supabase db push` if the project's existing migration history is already synchronized with the remote database.

The topic suggestion uses the practice profile and recent knowledge-bank notes through the server-side OpenAI integration. If OpenAI is unavailable or returns invalid content, a specialty-aware curated suggestion is used instead. The topic card links into the existing caption generator with the topic and discussion prompts prefilled; the existing caption API generates and saves drafts, and edits can be saved back to those drafts.

Run the focused streak, time-zone, heatmap, and topic tests with `node --test tests/unit/streaks.test.mts` on Node.js 26 or later. Run `npm run lint` and `npm run build` for project validation.
