import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingDown, TrendingUp, CheckCircle2, XCircle,
  AlertCircle, Clock, MinusCircle,
} from 'lucide-react'
import { contracts } from '../data/contracts'
import { formatGBP, formatDate, monthsRemaining } from '../lib/format'
import { generateSchedule } from '../lib/schedule'

type Tab = 'overview' | 'schedule' | 'trialbalance' | 'transactions'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview',     label: 'Overview'       },
  { id: 'schedule',     label: 'Loan Schedule'  },
  { id: 'trialbalance', label: 'Trial Balance'  },
  { id: 'transactions', label: 'Transactions'   },
]

const statusMeta = {
  paid:     { label: 'Paid',     icon: CheckCircle2, cls: 'text-success', row: '' },
  partial:  { label: 'Partial',  icon: AlertCircle,  cls: 'text-warn',    row: 'bg-warn-subtle/30' },
  missed:   { label: 'Missed',   icon: XCircle,      cls: 'text-danger',  row: '' },
  current:  { label: 'Due',      icon: Clock,        cls: 'text-accent',  row: 'bg-accent-subtle/40' },
  upcoming: { label: 'Upcoming', icon: MinusCircle,  cls: 'text-ink-muted', row: '' },
}

function StatCard({ label, value, sub, colour }: { label: string; value: string; sub?: string; colour?: string }) {
  return (
    <div className="card p-4">
      <p className="stat-label mb-2">{label}</p>
      <p className={`text-lg font-bold ${colour ?? 'text-ink-primary'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>}
    </div>
  )
}

export default function ContractDetail() {
  const { id } = useParams()
  const contract = contracts.find(c => c.id === Number(id))
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showAll, setShowAll] = useState(false)

  const schedule = useMemo(() => {
    if (!contract) return null
    return generateSchedule(
      contract.amountFinanced,
      contract.interestRate,
      contract.termMonths,
      contract.startDate,
      contract.recentTransactions,
    )
  }, [contract])

  if (!contract || !schedule) {
    return <div className="p-8 text-ink-muted">Contract not found.</div>
  }

  const isOverdue  = new Date(contract.endDate) < new Date() && contract.arrears > 0
  const hasArrears = contract.arrears > 0
  const remaining  = monthsRemaining(contract.endDate)

  const missedCount = schedule.rows.filter(r => r.status === 'missed').length
  const paidCount   = schedule.rows.filter(r => r.status === 'paid').length
  const totalPaid   = schedule.rows.reduce((s, r) => s + (r.actualPayment ?? 0), 0)
  const visibleRows = showAll ? schedule.rows : schedule.rows.slice(0, 24)

  return (
    <div className="p-8 space-y-5">

      <Link to="/contracts" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-secondary transition-colors w-fit">
        <ArrowLeft size={14} /> Back to contracts
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-primary">{contract.borrower}</h1>
            {isOverdue   ? <span className="pill-danger">Overdue</span>
            : hasArrears ? <span className="pill-warn">In arrears</span>
            :              <span className="pill-success">Current</span>}
          </div>
          <p className="mt-1 font-mono text-sm text-ink-muted">{contract.code} · {contract.product} · {contract.currency}</p>
        </div>
        {contract.nextPaymentNet && (
          <div className="card border border-accent/20 px-5 py-3 text-right">
            <p className="text-xs text-accent">Next payment due</p>
            <p className="text-2xl font-extrabold text-ink-primary">{formatGBP(contract.nextPaymentNet)}</p>
          </div>
        )}
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Amount financed" value={formatGBP(contract.amountFinanced)} />
        <StatCard label="Start date"      value={formatDate(contract.startDate)} />
        <StatCard label="End date"        value={formatDate(contract.endDate)} />
        <StatCard label="Term"            value={`${contract.termMonths} months`} />
        <StatCard label="Interest rate"   value={`${contract.interestRate}% p.a.`} />
      </div>

      {isOverdue && (
        <div className="rounded-2xl border border-danger/20 bg-danger-subtle px-5 py-4">
          <p className="text-sm font-semibold text-danger">
            Loan matured {formatDate(contract.endDate)} — {formatGBP(contract.arrears)} outstanding. Immediate action required.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === t.id ? 'text-accent' : 'text-ink-muted hover:text-ink-secondary'
            }`}
          >
            {t.label}
            {t.id === 'schedule' && missedCount > 0 && (
              <span className="ml-2 rounded-full bg-danger px-1.5 py-0.5 text-xs font-bold text-white">{missedCount}</span>
            )}
            {activeTab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`card p-5 ${hasArrears ? 'border border-danger/20' : 'border border-success/20'}`}>
                <div className="flex items-center gap-1.5 mb-3">
                  {hasArrears ? <TrendingDown size={14} className="text-danger" /> : <TrendingUp size={14} className="text-success" />}
                  <span className={`text-xs font-semibold uppercase tracking-wide ${hasArrears ? 'text-danger' : 'text-success'}`}>Arrears</span>
                </div>
                <p className={`text-2xl font-extrabold ${hasArrears ? 'text-danger' : 'text-success'}`}>{formatGBP(Math.abs(contract.arrears))}</p>
                <p className={`text-xs mt-1 ${hasArrears ? 'text-danger/60' : 'text-success/60'}`}>{hasArrears ? 'overdue' : 'in credit'}</p>
              </div>
              <div className="card p-5">
                <p className="stat-label mb-3">Exposure</p>
                <p className="text-2xl font-extrabold text-ink-primary">{formatGBP(Math.abs(contract.exposure))}</p>
                <p className="text-xs text-ink-muted mt-1">{remaining > 0 ? `${remaining} months left` : 'Matured'}</p>
              </div>
            </div>

            <div className="card p-5">
              <p className="font-semibold text-ink-primary mb-4">Schedule health</p>
              {[
                { label: 'Paid',     count: paidCount,   colour: 'bg-success' },
                { label: 'Missed',   count: missedCount, colour: 'bg-danger'  },
                { label: 'Upcoming', count: schedule.rows.filter(r => r.status === 'upcoming' || r.status === 'current').length, colour: 'bg-white/10' },
              ].map(({ label, count, colour }) => (
                <div key={label} className="mb-3 flex items-center gap-3">
                  <span className="w-20 text-xs text-ink-muted">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5">
                    <div className={`h-1.5 rounded-full ${colour}`} style={{ width: `${(count / contract.termMonths) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-ink-secondary">{count}</span>
                </div>
              ))}
              <div className="mt-4 border-t border-white/5 pt-4 space-y-2">
                {[
                  ['Total paid to date',    formatGBP(totalPaid)],
                  ['Monthly payment',       formatGBP(schedule.monthlyPayment)],
                  ['Total interest',        formatGBP(schedule.totalInterest)],
                  ['Total cost of credit',  formatGBP(schedule.totalPayable)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs">
                    <span className="text-ink-muted">{l}</span>
                    <span className="font-semibold text-ink-primary">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="font-semibold text-ink-primary mb-4">Loan details</p>
            <dl className="space-y-3">
              {[
                ['Company',        contract.company   ],
                ['Product',        contract.product   ],
                ['Invoice method', 'Regular'          ],
                ['Currency',       contract.currency  ],
                ['Status',         contract.status    ],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <dt className="text-ink-muted">{l}</dt>
                  <dd className="font-semibold text-ink-primary">{v}</dd>
                </div>
              ))}
            </dl>
            {(contract.address || contract.email || contract.phone) && (
              <div className="mt-5 border-t border-white/5 pt-5">
                <p className="mb-3 text-sm font-semibold text-ink-primary">Borrower contact</p>
                {contract.address && <p className="text-sm text-ink-secondary">{contract.address}, {contract.postcode}</p>}
                {contract.phone   && <p className="mt-1 text-sm text-ink-secondary">{contract.phone}</p>}
                {contract.email   && <p className="mt-1 text-sm text-accent">{contract.email}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Schedule */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Monthly payment"    value={formatGBP(schedule.monthlyPayment)} />
            <StatCard label="Total interest"     value={formatGBP(schedule.totalInterest)} />
            <StatCard label="Total cost"         value={formatGBP(schedule.totalPayable)} />
            <StatCard label="Missed payments"    value={`${missedCount} of ${contract.termMonths}`} colour={missedCount > 0 ? 'text-danger' : 'text-success'} />
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  {['#', 'Due date', 'Payment due', 'Interest', 'Principal', 'Exp. balance', 'Actual payment', 'Variance', 'Status'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 1 ? 'text-right' : 'text-left'} ${h === 'Status' ? 'text-center' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {visibleRows.map(row => {
                  const meta     = statusMeta[row.status]
                  const Icon     = meta.icon
                  const variance = row.actualPayment !== null ? row.actualPayment - row.paymentDue : null
                  return (
                    <tr key={row.period} className={`${meta.row} ${row.status === 'missed' ? 'border-l-2 border-danger' : 'border-l-2 border-transparent'} transition-colors hover:bg-white/[0.025]`}>
                      <td className="px-4 py-2.5 text-xs text-ink-muted">{row.period}</td>
                      <td className="px-4 py-2.5 text-ink-secondary">{formatDate(row.dueDate)}</td>
                      <td className="px-4 py-2.5 text-right text-ink-secondary">{formatGBP(row.paymentDue)}</td>
                      <td className="px-4 py-2.5 text-right text-ink-muted">{formatGBP(row.interest)}</td>
                      <td className="px-4 py-2.5 text-right text-ink-muted">{formatGBP(row.principal)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-ink-primary">{formatGBP(row.expectedBalance)}</td>
                      <td className="px-4 py-2.5 text-right">
                        {row.actualPayment !== null
                          ? <span className="font-semibold text-success">{formatGBP(row.actualPayment)}</span>
                          : <span className="text-ink-muted/30">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {variance !== null ? (
                          <span className={`font-semibold ${variance >= 0 ? 'text-success' : 'text-danger'}`}>
                            {variance >= 0 ? '+' : ''}{formatGBP(variance)}
                          </span>
                        ) : <span className="text-ink-muted/30">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className={`flex items-center justify-center gap-1 ${meta.cls}`}>
                          <Icon size={12} />
                          <span className="text-xs font-semibold">{meta.label}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {schedule.rows.length > 24 && (
              <div className="border-t border-white/5 px-6 py-3 text-center">
                <button onClick={() => setShowAll(s => !s)} className="text-sm font-semibold text-accent hover:text-accent-dim">
                  {showAll ? 'Show less' : `Show all ${schedule.rows.length} periods`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trial Balance */}
      {activeTab === 'trialbalance' && (
        <div className="max-w-2xl space-y-3">
          <div className="rounded-xl border border-white/5 bg-surface-raised px-4 py-3 text-sm text-ink-muted">
            Period: 01 Jun 2026 – 30 Jun 2026
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  {['Nominal', 'Description', 'B/Fwd', 'Debits', 'Credits', 'C/Fwd'].map((h, i) => (
                    <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 1 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  { nominal: '3',   label: 'Earnings',        value: contract.trialBalance.earnings       },
                  { nominal: '503', label: 'Deferred income', value: contract.trialBalance.deferredIncome  },
                  { nominal: '601', label: 'Debtors',         value: contract.trialBalance.debtors         },
                  { nominal: '602', label: 'Creditors',       value: contract.trialBalance.creditors       },
                  { nominal: '621', label: 'Cash receipts',   value: contract.trialBalance.cashReceipts    },
                ].map(({ nominal, label, value }) => (
                  <tr key={nominal} className="hover:bg-white/[0.025] transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-ink-muted">{nominal}</td>
                    <td className="px-6 py-3 text-ink-secondary">{label}</td>
                    <td className="px-6 py-3 text-right font-semibold text-ink-primary">{formatGBP(value)}</td>
                    <td className="px-6 py-3 text-right text-ink-muted/40">0.00</td>
                    <td className="px-6 py-3 text-right text-ink-muted/40">0.00</td>
                    <td className="px-6 py-3 text-right font-semibold text-ink-primary">{formatGBP(value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-white/10">
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-xs font-bold text-ink-secondary">Total</td>
                  {['0.00','0.00','0.00','0.00'].map((v, i) => (
                    <td key={i} className="px-6 py-3 text-right text-xs font-bold text-ink-secondary">{v}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div className="max-w-2xl space-y-3">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  {['Date', 'Type', 'Description', 'Debit', 'Credit', 'Balance'].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {contract.recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="px-5 py-3 text-ink-secondary">{formatDate(tx.date)}</td>
                    <td className="px-5 py-3"><span className="pill-muted">{tx.type}</span></td>
                    <td className="px-5 py-3 text-ink-secondary">{tx.description}</td>
                    <td className="px-5 py-3 text-right text-danger">{tx.debit !== null ? formatGBP(tx.debit) : '—'}</td>
                    <td className="px-5 py-3 text-right text-success">{tx.credit !== null ? formatGBP(tx.credit) : '—'}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink-primary">{formatGBP(tx.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-muted">Most recent transactions. Full history available once connected to live data.</p>
        </div>
      )}
    </div>
  )
}
