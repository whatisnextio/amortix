// Accepts a list of transactions from the Amortix frontend and posts them
// to the connected Xero organisation as Manual Journals.
// Deploy: supabase functions deploy xero-sync
// Secrets required: XERO_CLIENT_ID, XERO_CLIENT_SECRET

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Nominal → Xero account code mapping (matches the UI in IntegrationsSettings)
const ACCOUNT = {
  debtors:        '610', // Accounts Receivable
  earnings:       '200', // Revenue / Interest income
  deferredIncome: '235', // Deferred Revenue
  bank:           '090', // Bank Account (Cash receipts)
}

interface SyncEntry {
  contractCode: string
  borrower:     string
  date:         string        // YYYY-MM-DD
  type:         'payment' | 'interest_accrual'
  amount:       number
  interest?:    number
  principal?:   number
  narrative:    string
}

interface XeroConnection {
  tenant_id:     string
  access_token:  string
  refresh_token: string
  expires_at:    string
}

async function refreshIfNeeded(
  conn: XeroConnection,
  supabase: ReturnType<typeof createClient>,
): Promise<string> {
  const expiry = new Date(conn.expires_at)
  const nowPlus60 = new Date(Date.now() + 60_000)

  if (expiry > nowPlus60) return conn.access_token

  const clientId     = Deno.env.get('XERO_CLIENT_ID')!
  const clientSecret = Deno.env.get('XERO_CLIENT_SECRET')!

  const res = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: conn.refresh_token,
    }),
  })

  if (!res.ok) throw new Error('Token refresh failed')

  const tokens = await res.json()
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await supabase.from('xero_connections').update({
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at:    expiresAt,
    updated_at:    new Date().toISOString(),
  }).eq('tenant_id', conn.tenant_id)

  return tokens.access_token
}

function buildJournal(entry: SyncEntry) {
  if (entry.type === 'payment') {
    return {
      Date:      entry.date,
      Narration: `Amortix: ${entry.narrative} — ${entry.contractCode} — ${entry.borrower}`,
      JournalLines: [
        {
          AccountCode: ACCOUNT.bank,
          Description: 'Cash receipt',
          LineAmount:  entry.amount,
        },
        {
          AccountCode: ACCOUNT.debtors,
          Description: 'Debtors reduction on payment',
          LineAmount:  -entry.amount,
        },
      ],
    }
  }

  // Interest accrual
  return {
    Date:      entry.date,
    Narration: `Amortix: Interest accrual — ${entry.contractCode} — ${entry.borrower}`,
    JournalLines: [
      {
        AccountCode: ACCOUNT.debtors,
        Description: 'Interest receivable',
        LineAmount:  entry.amount,
      },
      {
        AccountCode: ACCOUNT.earnings,
        Description: 'Interest income',
        LineAmount:  -entry.amount,
      },
    ],
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Load the active Xero connection
  const { data: connections, error: dbErr } = await supabase
    .from('xero_connections')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)

  if (dbErr || !connections?.length) {
    return new Response(JSON.stringify({ error: 'No Xero connection found' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const conn: XeroConnection = connections[0]

  let accessToken: string
  try {
    accessToken = await refreshIfNeeded(conn, supabase)
  } catch {
    return new Response(JSON.stringify({ error: 'Token refresh failed — reconnect Xero' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json() as { transactions: SyncEntry[] }
  const journals = body.transactions.map(buildJournal)

  const xeroRes = await fetch('https://api.xero.com/api.xro/2.0/ManualJournals', {
    method: 'PUT',
    headers: {
      'Authorization':  `Bearer ${accessToken}`,
      'Xero-tenant-id': conn.tenant_id,
      'Content-Type':   'application/json',
      'Accept':         'application/json',
    },
    body: JSON.stringify({ ManualJournals: journals }),
  })

  const result = await xeroRes.json()

  if (!xeroRes.ok) {
    console.error('Xero API error:', result)
    return new Response(JSON.stringify({ error: 'Xero rejected the journals', detail: result }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Log the sync
  await supabase.from('xero_sync_log').insert({
    tenant_id:      conn.tenant_id,
    entries_posted: journals.length,
    status:         'success',
  })

  return new Response(JSON.stringify({
    ok:      true,
    posted:  journals.length,
    tenant:  conn.tenant_id,
  }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
