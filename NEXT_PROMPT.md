# Next Session Prompt — Amortix

Paste this into a new Claude Code session to resume without re-explanation.

---

We are building Amortix — a bespoke loan management SaaS, replacing a client's £14k/year Solar Software.

Repo: https://github.com/whatisnextio/amortix
Live: https://amortix.io
Stack: React 18 + TypeScript + Vite + Tailwind, deployed to GitHub Pages via HashRouter.
Data layer: currently localStorage (Supabase migration is the next major task).

Read HANDOFF.md first. Then continue from the next session priorities listed there.

## Session mode: V1

Full BA → UX → Engineering → QA cycle for every new feature.
Write HANDOFF.md and NEXT_PROMPT.md before context runs out.

## Security constraint (non-negotiable)

There must be no files or mentions of ACUE anywhere in this repo.

## Demo credentials

- demo@amortix.io / demo2026
- user@amortix.io / user2026

## What to do next

1. Supabase project setup:
   - Create project at supabase.com
   - Run `supabase/migrations/20260610_xero_connections.sql`
   - Copy `.env.example` to `.env.local` and fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
   - Set Supabase secrets: XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_REDIRECT_URI, APP_URL, SUPABASE_SERVICE_ROLE_KEY

2. Supabase Auth — replace the hardcoded auth.ts demo credentials with real Supabase Auth

3. Deploy Xero Edge Functions:
   supabase functions deploy xero-auth
   supabase functions deploy xero-callback
   supabase functions deploy xero-sync

4. Register Xero app at developer.xero.com (free):
   - App type: Public
   - Redirect URI: https://<supabase-project>.supabase.co/functions/v1/xero-callback
   - Scopes: offline_access accounting.transactions accounting.settings

5. Mobile layout — sidebar fixed 240px with no responsive breakpoints, all grids hard-coded
