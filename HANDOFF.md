# Amortix — Handoff

## State: Ready for Supabase migration

### What was done this session

- Favicon added (`/logo.png` linked in `index.html`)
- Empty states added to ContractList and ContactList (search + zero-data)
- `aria-label` added to both search inputs
- Meta description tag added to `index.html`
- Xero OAuth 2.0 integration fully built:
  - `supabase/functions/xero-auth/index.ts` — redirects to Xero OAuth
  - `supabase/functions/xero-callback/index.ts` — exchanges code, stores tokens in DB
  - `supabase/functions/xero-sync/index.ts` — posts Manual Journals to Xero API, auto-refreshes tokens
  - `supabase/migrations/20260610_xero_connections.sql` — xero_connections + xero_sync_log tables
  - `IntegrationsSettings.tsx` — real OAuth flow when `VITE_SUPABASE_URL` is set, demo mock fallback otherwise
  - `.env.example` — documents all required env vars
  - `PENDING_MIGRATIONS.sql` — references the migration file
- ProductsSettings: full inline CRUD (edit, two-click delete, inline add)
- Auth credentials changed from ben@fmf.co.uk to user@amortix.io / demo@amortix.io
- GitHub repo renamed from loan-platform to amortix
- Custom domain: amortix.io (vite base changed to `/`)

### Current branch: main (all committed and pushed)

Last commit: `feat(xero): real OAuth 2.0 integration with Supabase Edge Functions, graceful demo fallback`

### Repo: https://github.com/whatisnextio/amortix

### Live: https://amortix.io

---

## What is NOT done (production blockers)

1. **Supabase not set up** — data is in localStorage, not a real DB
2. **Real auth not wired** — demo credentials only (user@amortix.io / demo@amortix.io)
3. **Xero Edge Functions not deployed** — code is written, needs `supabase functions deploy`
4. **Xero app not registered** — needs developer.xero.com registration (free, 10 min)
5. **DPA + ICO registration** — legal/compliance paperwork for UK GDPR

---

## Pending migrations

See `PENDING_MIGRATIONS.sql` → `supabase/migrations/20260610_xero_connections.sql`

Run after Supabase project is created.

---

## UX items identified but not yet implemented

- Mobile layout: sidebar is fixed 240px, no responsive breakpoints
- Payment modal: no success toast after submission
- Chase note: no highlight on newly-added row
- Trial balance: "No transactions" label misleading on active contracts
- Sort buttons: missing aria-label for direction

---

## Next session priorities

1. Supabase project setup (create project, run migration, set secrets)
2. Supabase Auth (replace demo credentials)
3. Deploy Xero Edge Functions
4. Register Xero app at developer.xero.com
5. Mobile layout fix (sidebar + grid breakpoints)
