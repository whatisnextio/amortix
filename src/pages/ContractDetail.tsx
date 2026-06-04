import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Percent, Building2, TrendingDown, TrendingUp } from 'lucide-react'
import { contracts } from '../data/contracts'
import { formatGBP, formatDate, monthsRemaining } from '../lib/format'

export default function ContractDetail() {
  const { id } = useParams()
  const contract = contracts.find(c => c.id === Number(id))

  if (!contract) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Contract not found.</p>
      </div>
    )
  }

  const { trialBalance: tb, recentTransactions } = contract
  const isOverdue = new Date(contract.endDate) < new Date() && contract.arrears > 0
  const hasArrears = contract.arrears > 0
  const remaining = monthsRemaining(contract.endDate)

  return (
    <div className="p-8">
      <Link to="/contracts" className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700">
        <ArrowLeft size={14} /> Back to contracts
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
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

      {/* Key stats row */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        {[
          { label: 'Amount financed', value: formatGBP(contract.amountFinanced), icon: Building2 },
          { label: 'Start date', value: formatDate(contract.startDate), icon: Calendar },
          { label: 'End date', value: formatDate(contract.endDate), icon: Calendar },
          { label: 'Term', value: `${contract.termMonths} months`, icon: Calendar },
          { label: 'Interest rate', value: `${contract.interestRate}% p.a.`, icon: Percent },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Icon size={12} />
              {label}
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

      <div className="grid grid-cols-2 gap-6">
        {/* Trial balance */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Trial Balance</h2>
            <p className="text-xs text-slate-400">Period: 01 Jun 2026 – 30 Jun 2026</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-slate-500">Nominal</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-slate-500">Description</th>
                <th className="px-6 py-2.5 text-right text-xs font-semibold text-slate-500">B/Fwd</th>
                <th className="px-6 py-2.5 text-right text-xs font-semibold text-slate-500">C/Fwd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { nominal: '3', label: 'Earnings', value: tb.earnings },
                { nominal: '503', label: 'Deferred income', value: tb.deferredIncome },
                { nominal: '601', label: 'Debtors', value: tb.debtors },
                { nominal: '602', label: 'Creditors', value: tb.creditors },
                { nominal: '621', label: 'Cash receipts', value: tb.cashReceipts },
              ].map(({ nominal, label, value }) => (
                <tr key={nominal}>
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{nominal}</td>
                  <td className="px-6 py-3 text-slate-700">{label}</td>
                  <td className={`px-6 py-3 text-right font-medium ${value < 0 ? 'text-slate-700' : 'text-slate-900'}`}>
                    {formatGBP(value)}
                  </td>
                  <td className={`px-6 py-3 text-right font-medium ${value < 0 ? 'text-slate-700' : 'text-slate-900'}`}>
                    {formatGBP(value)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={2} className="px-6 py-3 text-xs font-bold text-slate-700">Total</td>
                <td className="px-6 py-3 text-right text-xs font-bold text-slate-700">0.00</td>
                <td className="px-6 py-3 text-right text-xs font-bold text-slate-700">0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Arrears / exposure summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-xl border p-4 ${hasArrears ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {hasArrears ? <TrendingDown size={13} className="text-red-600" /> : <TrendingUp size={13} className="text-emerald-600" />}
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

          {/* Recent transactions */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Recent transactions</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                    <p className="text-xs text-slate-400">{formatDate(tx.date)} · {tx.type}</p>
                  </div>
                  <div className="text-right">
                    {tx.credit !== null ? (
                      <p className="text-sm font-semibold text-emerald-600">+{formatGBP(tx.credit)}</p>
                    ) : (
                      <p className="text-sm font-semibold text-red-500">+{formatGBP(tx.debit!)}</p>
                    )}
                    <p className="text-xs text-slate-400">bal {formatGBP(tx.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Borrower info */}
          {(contract.address || contract.email || contract.phone) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Borrower details</h3>
              {contract.address && <p className="text-sm text-slate-600">{contract.address}, {contract.postcode}</p>}
              {contract.phone && <p className="mt-1 text-sm text-slate-600">{contract.phone}</p>}
              {contract.email && <p className="mt-1 text-sm text-brand-500">{contract.email}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
