import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, RefreshCw, AlertCircle, ExternalLink, ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { formatGBP } from '../../lib/format'

type XeroStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

const NOMINAL_MAP = [
  { nominal: '601', name: 'Debtors — Loans receivable',   xeroAccount: '610 — Accounts Receivable' },
  { nominal: '602', name: 'Creditors — Loan principal',   xeroAccount: '820 — Loan Liability'       },
  { nominal: '3',   name: 'Earnings — Interest income',   xeroAccount: '200 — Revenue'              },
  { nominal: '503', name: 'Deferred income',               xeroAccount: '235 — Deferred Revenue'    },
  { nominal: '621', name: 'Cash receipts',                 xeroAccount: '090 — Bank Account'        },
]

const XERO_CONN_KEY = 'amortix_xero_connection'
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string | undefined

function loadStoredConnection(): { tenantName: string; connectedAt: string } | null {
  try {
    const raw = localStorage.getItem(XERO_CONN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveConnection(tenantName: string) {
  localStorage.setItem(XERO_CONN_KEY, JSON.stringify({
    tenantName,
    connectedAt: new Date().toISOString(),
  }))
}

function clearConnection() {
  localStorage.removeItem(XERO_CONN_KEY)
}

export default function IntegrationsSettings() {
  const { contracts }                    = useData()
  const [searchParams, setSearchParams]  = useSearchParams()
  const [xeroStatus, setXeroStatus]      = useState<XeroStatus>('disconnected')
  const [tenantName, setTenantName]      = useState<string | null>(null)
  const [showMapping, setShowMapping]    = useState(false)
  const [showQueue, setShowQueue]        = useState(false)
  const [syncing, setSyncing]            = useState(false)
  const [lastSync, setLastSync]          = useState<string | null>(null)
  const [syncError, setSyncError]        = useState<string | null>(null)

  const isReal = Boolean(SUPABASE_URL)

  // Restore connection from localStorage on mount
  useEffect(() => {
    const stored = loadStoredConnection()
    if (stored) {
      setXeroStatus('connected')
      setTenantName(stored.tenantName)
    }
  }, [])

  // Handle OAuth callback — Xero redirects back with ?xero=connected&tenant=Name
  useEffect(() => {
    const xero   = searchParams.get('xero')
    const tenant = searchParams.get('tenant')

    if (xero === 'connected' && tenant) {
      setXeroStatus('connected')
      setTenantName(tenant)
      saveConnection(tenant)
      setSearchParams({}, { replace: true })
    } else if (xero === 'error') {
      setXeroStatus('error')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleConnect() {
    if (isReal) {
      // Real OAuth: redirect to the Supabase Edge Function which redirects to Xero
      window.location.href = `${SUPABASE_URL}/functions/v1/xero-auth`
    } else {
      // Demo mock
      setXeroStatus('connecting')
      setTimeout(() => {
        const demo = 'First Merchant Finance (Demo)'
        setXeroStatus('connected')
        setTenantName(demo)
        saveConnection(demo)
        setLastSync(new Date().toLocaleTimeString('en-GB'))
      }, 1800)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setSyncError(null)

    if (isReal) {
      // Build transaction list from localStorage contracts
      const transactions = contracts
        .filter(c => c.recentTransactions.length > 0)
        .flatMap(c =>
          c.recentTransactions.map(tx => ({
            contractCode: c.code,
            borrower:     c.borrower,
            date:         tx.date,
            type:         tx.credit ? 'payment' : 'interest_accrual',
            amount:       tx.credit ?? tx.debit ?? 0,
            narrative:    tx.credit ? 'Payment received' : 'Interest accrual',
          }))
        )

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/xero-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions }),
        })

        if (!res.ok) {
          const err = await res.json()
          setSyncError(err.error ?? 'Sync failed — check Xero connection')
        } else {
          setLastSync(new Date().toLocaleTimeString('en-GB'))
        }
      } catch {
        setSyncError('Network error — could not reach sync service')
      }
    } else {
      // Demo mock
      await new Promise(r => setTimeout(r, 2000))
      setLastSync(new Date().toLocaleTimeString('en-GB'))
    }

    setSyncing(false)
  }

  function handleDisconnect() {
    clearConnection()
    setXeroStatus('disconnected')
    setTenantName(null)
    setLastSync(null)
    setSyncError(null)
  }

  // Build pending sync queue preview from localStorage contracts
  const syncQueue = contracts
    .filter(c => c.recentTransactions.length > 0)
    .slice(0, 5)
    .flatMap(c =>
      c.recentTransactions.slice(0, 1).map(tx => ({
        contract: c.code,
        borrower: c.borrower,
        date:     tx.date,
        type:     tx.credit ? 'Payment received' : 'Interest accrual',
        amount:   tx.credit ?? tx.debit ?? 0,
        xeroType: tx.credit ? 'Invoice payment' : 'Manual journal',
      }))
    )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-primary mb-1">Integrations</h2>
        <p className="text-sm text-ink-muted">Connect Amortix to your accounting and banking services.</p>
        {!isReal && (
          <p className="mt-2 text-xs text-warn">
            Running in demo mode — set <span className="font-mono">VITE_SUPABASE_URL</span> in <span className="font-mono">.env.local</span> to enable live Xero sync.
          </p>
        )}
      </div>

      {/* Xero card */}
      <div className="card overflow-hidden">
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#13B5EA]/10 text-[#13B5EA] font-black text-lg">
              X
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink-primary">Xero</p>
                {xeroStatus === 'connected' && (
                  <span className="pill-success"><CheckCircle2 size={10} /> Connected</span>
                )}
                {xeroStatus === 'disconnected' && (
                  <span className="pill-muted">Not connected</span>
                )}
                {xeroStatus === 'connecting' && (
                  <span className="pill-accent"><RefreshCw size={10} className="animate-spin" /> Authorising…</span>
                )}
                {xeroStatus === 'error' && (
                  <span className="pill-danger"><XCircle size={10} /> Connection failed</span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {xeroStatus === 'connected' && tenantName
                  ? `Connected to: ${tenantName}`
                  : 'Sync loan advances, repayments, and interest income to your Xero ledger.'}
              </p>
              {lastSync && (
                <p className="text-xs text-ink-muted mt-1">Last synced at {lastSync}</p>
              )}
              {syncError && (
                <p className="text-xs text-danger mt-1">{syncError}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {xeroStatus === 'connected' && (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Syncing…' : 'Sync now'}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="rounded-xl border border-danger/20 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger-subtle transition-colors"
                >
                  Disconnect
                </button>
              </>
            )}
            {(xeroStatus === 'disconnected' || xeroStatus === 'error') && (
              <button
                onClick={handleConnect}
                className="rounded-xl bg-[#13B5EA] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#13B5EA]/90 transition-colors"
              >
                Connect Xero
              </button>
            )}
          </div>
        </div>

        {/* OAuth explanation when disconnected */}
        {(xeroStatus === 'disconnected' || xeroStatus === 'error') && (
          <div className="border-t border-white/5 px-5 py-4 bg-surface-raised">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-ink-muted" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-ink-secondary">How the connection works</p>
                <p className="text-xs text-ink-muted">
                  Clicking Connect Xero opens Xero's authorisation page. You sign in to your Xero organisation and grant read/write access.
                  Amortix will then post loan advances, repayments, and interest journals directly to your nominated Xero accounts.
                  No password is shared — access uses Xero's secure OAuth 2.0 standard.
                </p>
                <a
                  href="https://developer.xero.com/documentation/guides/oauth2/overview"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1"
                >
                  Learn more <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Nominal mapping */}
        {xeroStatus === 'connected' && (
          <>
            <div
              className="border-t border-white/5 px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setShowMapping(m => !m)}
            >
              <p className="text-sm font-semibold text-ink-secondary">Nominal code mapping</p>
              {showMapping ? <ChevronUp size={14} className="text-ink-muted" /> : <ChevronDown size={14} className="text-ink-muted" />}
            </div>
            {showMapping && (
              <div className="border-t border-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-surface-raised">
                    <tr>
                      {['Amortix nominal', 'Description', 'Xero account'].map(h => (
                        <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {NOMINAL_MAP.map(row => (
                      <tr key={row.nominal} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3 font-mono text-xs text-accent">{row.nominal}</td>
                        <td className="px-5 py-3 text-ink-secondary">{row.name}</td>
                        <td className="px-5 py-3 text-ink-muted">{row.xeroAccount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sync queue */}
            <div
              className="border-t border-white/5 px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setShowQueue(q => !q)}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink-secondary">Pending sync queue</p>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">{syncQueue.length}</span>
              </div>
              {showQueue ? <ChevronUp size={14} className="text-ink-muted" /> : <ChevronDown size={14} className="text-ink-muted" />}
            </div>
            {showQueue && (
              <div className="border-t border-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-surface-raised">
                    <tr>
                      {['Contract', 'Borrower', 'Date', 'Transaction type', 'Amount', 'Posts as'].map((h, i) => (
                        <th key={h} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {syncQueue.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-mono text-xs text-accent">{row.contract}</td>
                        <td className="px-4 py-2.5 text-ink-secondary">{row.borrower}</td>
                        <td className="px-4 py-2.5 text-ink-muted">{row.date}</td>
                        <td className="px-4 py-2.5 text-right text-ink-secondary">{row.type}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-ink-primary">{formatGBP(row.amount)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="pill-accent">{row.xeroType}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-white/5 px-5 py-3 flex justify-end">
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-surface-base hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Posting to Xero…' : `Post ${syncQueue.length} entries to Xero`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Open Banking */}
      <div className="card p-5 flex items-center justify-between gap-4 opacity-50">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-ink-muted font-extrabold text-sm">OB</div>
          <div>
            <p className="font-semibold text-ink-primary">Open Banking</p>
            <p className="text-xs text-ink-muted mt-0.5">Automated payment matching via bank feeds.</p>
          </div>
        </div>
        <span className="pill-muted">Coming soon</span>
      </div>

      {/* Automated statements */}
      <div className="card p-5 flex items-center justify-between gap-4 opacity-50">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-ink-muted font-extrabold text-sm">✉</div>
          <div>
            <p className="font-semibold text-ink-primary">Automated statements</p>
            <p className="text-xs text-ink-muted mt-0.5">Email monthly statements to borrowers automatically.</p>
          </div>
        </div>
        <span className="pill-muted">Coming soon</span>
      </div>
    </div>
  )
}
