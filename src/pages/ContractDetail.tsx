import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Percent, Building2,
  TrendingDown, TrendingUp, CheckCircle2, XCircle,
  AlertCircle, Clock, MinusCircle,
} from 'lucide-react'
import { contracts } from '../data/contracts'
import { formatGBP, formatDate, monthsRemaining } from '../lib/format'
import { generateSchedule } from '../lib/schedule'

type Tab = 'overview' | 'schedule' | 'trialbalance' | 'transactions'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Loan Schedule' },
  { id: 'trialbalance', label: 'Trial Balance' },
  { id: 'transactions', label: 'Transactions' },
]

const statusMeta = {
  paid:     { label: 'Paid',     icon: CheckCircle2,  cls: 'text-emerald-600', bg: 'bg-emerald-50' },
  partial:  { label: 'Partial',  icon: AlertCircle,   cls: 'text-amber-600',   bg: 'bg-amber-50'   },
  missed:   { label: 'Missed',   icon: XCircle,       cls: 'text-red-600',     bg: 'bg-red-50'     },
  current:  { label: 'Due',      icon: Clock,         cls: 'text-brand-600',   bg: 'bg-brand-50'   },
  upcoming: { label: 'Upcoming', icon: MinusCircle,   cls: 'text-slate-400',   bg: 'bg-white'      },
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
    return <div className="p-8 text-slate-500">Contract not found.</div>
  }

  const isOverdue = new Date(contract.endDate) < new Date() && contract.arrears > 0
  const hasArrears = contract.arrears > 0
  const remaining = monthsRemaining(contract.endDate)

  const missedCount = schedule.rows.filter(r => r.status === 'missed').length
  const paidCount   = schedule.rows.filter(r => r.status === 'paid').length
  const totalPaid   = schedule.rows.reduce((s, r) => s + (r.actualPayment ?? 0), 0)

  const visibleRows = showAll ? schedule.rows : schedule.rows.slice(0, 24)

  return (
    <div className="p-8">
      <Link to="/contracts" className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700">
        <ArrowLeft size={14} /> Back to contracts
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{contract.borrower}</h1>
            {isOverdue ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Overdue</span>
            ) : hasArrears ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">In arrears</span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Current</span>
            )}
          </div>
          <p className="mt-1 font-mono text-sm text-slate-400">{contract.code} · {contract.product} · {contract.currency}</p>
        </div>
        {contract.nextPaymentNet && (
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-5 py-3 text-right">
            <p className="text-xs text-brand-600">Next payment due</p>
            <p className="text-xl font-bold text-brand-700">{formatGBP(contract.nextPaymentNet)}</p>
          </div>
        )}
      </div>

      {/* Key stats */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        {[
          { label: 'Amount financed', value: formatGBP(contract.amountFinanced), icon: Building2 },
          { label: 'Start date',      value: formatDate(contract.startDate),       icon: Calendar  },
          { label: 'End date',        value: formatDate(contract.endDate),         icon: Calendar  },
          { label: 'Term',            value: `${contract.termMonths} months`,      icon: Calendar  },
          { label: 'Interest rate',   value: `${contract.interestRate}% p.a.`,     icon: Percent   },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Icon size={12} /> {label}
            </div>
            <p className="mt-1 font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {isOverdue && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-700">
            This loan matured on {formatDate(contract.endDate)} and has not been fully settled.
            Outstanding arrears of {formatGBP(contract.arrears)} require immediate attention.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'border-b-2 border-brand-500 text-brand-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
            {t.id === 'schedule' && missedCount > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                {missedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-5">
            {/* Schedule summary cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-xl border p-4 ${hasArrears ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {hasArrears
                    ? <TrendingDown size={13} className="text-red-600" />
                    : <TrendingUp size={13} className="text-emerald-600" />}
                  <span className={hasArrears ? 'text-red-600' : 'text-emerald-600'}>Arrears</span>
                </div>
                <p className={`mt-1 text-xl font-bold ${hasArrears ? 'text-red-700' : 'text-emerald-700'}`}>
                  {formatGBP(Math.abs(contract.arrears))}
                </p>
                <p className={`text-xs ${hasArrears ? 'text-red-500' : 'text-emerald-500'}`}>
                  {hasArrears ? 'overdue' : 'in credit'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Exposure</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatGBP(Math.abs(contract.exposure))}</p>
                <p className="text-xs text-slate-400">{remaining > 0 ? `${remaining} months remaining` : 'Matured'}</p>
              </div>
            </div>

            {/* Schedule health */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Schedule health</h3>
              <div className="space-y-3">
                {[
                  { label: 'Payments made', value: paidCount, colour: 'bg-emerald-400' },
                  { label: 'Missed payments', value: missedCount, colour: 'bg-red-400' },
                  { label: 'Upcoming', value: schedule.rows.filter(r => r.status === 'upcoming' || r.status === 'current').length, colour: 'bg-slate-200' },
                ].map(({ label, value, colour }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-32 text-xs text-slate-500">{label}</div>
                    <div className="flex-1 h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${colour}`} style={{ width: `${(value / contract.termMonths) * 100}%` }} />
                    </div>
                    <div className="w-8 text-right text-xs font-medium text-slate-700">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>Total paid to date</span>
                <span className="font-semibold text-slate-900">{formatGBP(totalPaid)}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Monthly payment</span>
                <span className="font-semibold text-slate-900">{formatGBP(schedule.monthlyPayment)}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Total interest payable</span>
                <span className="font-semibold text-slate-900">{formatGBP(schedule.totalInterest)}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Total cost of credit</span>
                <span className="font-semibold text-slate-900">{formatGBP(schedule.totalPayable)}</span>
              </div>
            </div>
          </div>

          {/* Borrower + company */}
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Loan details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Company</dt>
                  <dd className="font-medium text-slate-900">{contract.company}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Product</dt>
                  <dd className="font-medium text-slate-900">{contract.product}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Invoice method</dt>
                  <dd className="font-medium text-slate-900">Regular</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Currency</dt>
                  <dd className="font-medium text-slate-900">{contract.currency}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium text-slate-900">{contract.status}</dd>
                </div>
              </dl>
            </div>
            {(contract.address || contract.email || contract.phone) && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Borrower contact</h3>
                {contract.address && <p className="text-sm text-slate-600">{contract.address}, {contract.postcode}</p>}
                {contract.phone  && <p className="mt-1 text-sm text-slate-600">{contract.phone}</p>}
                {contract.email  && <p className="mt-1 text-sm text-brand-500">{contract.email}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Schedule */}
      {activeTab === 'schedule' && (
        <div>
          {/* Summary strip */}
          <div className="mb-5 grid grid-cols-4 gap-4">
            {[
              { label: 'Monthly payment', value: formatGBP(schedule.monthlyPayment) },
              { label: 'Total interest', value: formatGBP(schedule.totalInterest) },
              { label: 'Total cost of credit', value: formatGBP(schedule.totalPayable) },
              { label: 'Missed payments', value: `${missedCount} of ${contract.termMonths}`, danger: missedCount > 0 },
            ].map(({ label, value, danger }) => (
              <div key={label} className={`rounded-xl border p-4 ${danger ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`mt-1 font-bold ${danger ? 'text-red-700' : 'text-slate-900'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Due date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Payment due</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Interest</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Principal</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Expected balance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actual payment</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Variance</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleRows.map(row => {
                  const meta = statusMeta[row.status]
                  const Icon = meta.icon
                  const variance = row.actualPayment !== null ? row.actualPayment - row.paymentDue : null
                  return (
                    <tr key={row.period} className={`${meta.bg} hover:brightness-95`}>
                      <td className="px-4 py-2.5 text-xs text-slate-400">{row.period}</td>
                      <td className="px-4 py-2.5 text-slate-700">{formatDate(row.dueDate)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{formatGBP(row.paymentDue)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{formatGBP(row.interest)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{formatGBP(row.principal)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-slate-900">{formatGBP(row.expectedBalance)}</td>
                      <td className="px-4 py-2.5 text-right">
                        {row.actualPayment !== null
                          ? <span className="font-medium text-emerald-700">{formatGBP(row.actualPayment)}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {variance !== null ? (
                          <span className={variance >= 0 ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>
                            {variance >= 0 ? '+' : ''}{formatGBP(variance)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className={`flex items-center justify-center gap-1 ${meta.cls}`}>
                          <Icon size={13} />
                          <span className="text-xs font-medium">{meta.label}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {schedule.rows.length > 24 && (
              <div className="border-t border-slate-100 px-6 py-3 text-center">
                <button
                  onClick={() => setShowAll(s => !s)}
                  className="text-sm font-medium text-brand-500 hover:text-brand-700"
                >
                  {showAll
                    ? 'Show less'
                    : `Show all ${schedule.rows.length} periods (${schedule.rows.length - 24} more)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trial Balance */}
      {activeTab === 'trialbalance' && (
        <div className="max-w-2xl">
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Trial Balance for period 01 Jun 2026 – 30 Jun 2026
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Nominal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">B/Fwd</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Debits</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Credits</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">C/Fwd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { nominal: '3',   label: 'Earnings',        value: contract.trialBalance.earnings      },
                  { nominal: '503', label: 'Deferred income', value: contract.trialBalance.deferredIncome },
                  { nominal: '601', label: 'Debtors',         value: contract.trialBalance.debtors        },
                  { nominal: '602', label: 'Creditors',       value: contract.trialBalance.creditors      },
                  { nominal: '621', label: 'Cash receipts',   value: contract.trialBalance.cashReceipts   },
                ].map(({ nominal, label, value }) => (
                  <tr key={nominal}>
                    <td className="px-6 py-3 font-mono text-xs text-slate-400">{nominal}</td>
                    <td className="px-6 py-3 text-slate-700">{label}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-800">{formatGBP(value)}</td>
                    <td className="px-6 py-3 text-right text-slate-400">0.00</td>
                    <td className="px-6 py-3 text-right text-slate-400">0.00</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-800">{formatGBP(value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-xs font-bold text-slate-700">Total</td>
                  <td className="px-6 py-3 text-right text-xs font-bold text-slate-700">0.00</td>
                  <td className="px-6 py-3 text-right text-xs font-bold text-slate-700">0.00</td>
                  <td className="px-6 py-3 text-right text-xs font-bold text-slate-700">0.00</td>
                  <td className="px-6 py-3 text-right text-xs font-bold text-slate-700">0.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div className="max-w-2xl">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Debit</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Credit</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contract.recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-600">{formatDate(tx.date)}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tx.type}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{tx.description}</td>
                    <td className="px-5 py-3 text-right text-red-500">
                      {tx.debit !== null ? formatGBP(tx.debit) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-600">
                      {tx.credit !== null ? formatGBP(tx.credit) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">{formatGBP(tx.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-400">Showing most recent transactions. Full history available once connected to live data.</p>
        </div>
      )}
    </div>
  )
}
