-- Xero OAuth connection storage
-- Run via: supabase db push  OR  paste into Supabase SQL editor

create table if not exists xero_connections (
  id            uuid        primary key default gen_random_uuid(),
  tenant_id     text        unique not null,
  tenant_name   text        not null,
  access_token  text        not null,
  refresh_token text        not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Only the service role key (used by Edge Functions) can read/write tokens.
-- The anon key (used by the browser) cannot access this table at all.
alter table xero_connections enable row level security;

create policy "service role only"
  on xero_connections
  using (false);


-- Sync audit log
create table if not exists xero_sync_log (
  id             uuid        primary key default gen_random_uuid(),
  tenant_id      text        not null references xero_connections(tenant_id),
  entries_posted integer     not null default 0,
  status         text        not null default 'success', -- 'success' | 'error'
  error          text,
  synced_at      timestamptz not null default now()
);

alter table xero_sync_log enable row level security;

create policy "service role only"
  on xero_sync_log
  using (false);
