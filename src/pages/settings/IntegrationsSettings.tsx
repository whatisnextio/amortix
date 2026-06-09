import { useState } from 'react'
import { CheckCircle2, RefreshCw, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { formatGBP } from '../../lib/format'

type XeroStatus = 'disconnected' | 'connecting' | 'connected'

const NOMINAL_MAP = [
  { nominal: '601', name: 'Debtors — Loans receivable',   xeroAccount: '610 — Accounts Receivable' },
  { nominal: '602', name: 'Creditors — Loan principal',   xeroAccount: '820 — Loan Liability'       },
  { nominal: '3',   name: 'Earnings — Interest income',   xeroAccount: '200 — Revenue'              },
  { nominal: '503', name: 'Deferred income',               xeroAccount: '235 — Deferred Revenue'    },
  { nominal: '621', name: 'Cash receipts',                 xeroAccount: '090 — Bank Account'        },
]

export default function IntegrationsSettings() {
  const { contracts } = useData()
  const [xeroStatus, setXeroStatus]     = useState<XeroStatus>('disconnected')
  const [showMapping, setShowMapping]   = useState(false)
  const [showQueue, setShowQueue]       = useState(false)
  const [syncing, setSyncing]           = useState(false)
  const [lastSync, setLastSync]         = useState<string | null>(null)

  function handleConnect() {
    setXeroStatus('connecting')
    setTimeout(() => {
      setXeroStatus('connected')
      setLastSync(new Date().toLocaleTimeString('en-GB'))
    }, 1800)
  }

  function handleSync() {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setLastSync(new Date().toLocaleTimeString('en-GB'))
    }, 2000)
  }

  function handleDisconnect() {
    setXeroStatus('disconnected')
    setLastSync(null)
  }

  // Build a preview of what would sync: top 5 contracts with recent payments
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
                  <span className="pill-success">
                    <CheckCircle2 size={10} /> Connected
                  </span>
                )}
                {xeroStatus === 'disconnected' && (
                  <span className="pill-muted">Not connected</span>
                )}
                {xeroStatus === 'connecting' && (
                  <span className="pill-accent">
                    <RefreshCw size={10} className="animate-spin" /> Authorising…
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Sync loan advances, repayments, and interest income to your Xero ledger.
              </p>
              {lastSync && (
                <p className="text-xs text-ink-muted mt-1">Last synced at {lastSync}</p>
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
            {xeroStatus === 'disconnected' && (
              <button
                onClick={handleConnect}
                className="rounded-xl bg-[#13B5EA] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#13B5EA]/90 transition-colors"
              >
                Connect Xero
              </button>
            )}
          </div>
        </div>

        {/* OAuth flow note */}
        {xeroStatus === 'disconnected' && (
          <div className="border-t border-white/5 px-5 py-4 bg-surface-raised">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-ink-muted" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-ink-secondary">How the connection works</p>
                <p className="text-xs text-ink-muted">
                  Clicking Connect Xero opens Xero's authorisation page. You sign in to your Xero organisation and grant read/write access.
                  Amortix will then be able to post loan advances, repayments, and interest journals directly to your nominated Xero accounts.
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

      {/* Email statements */}
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
