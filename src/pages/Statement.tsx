import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatGBP, formatDate } from '../lib/format'
import { generateSchedule } from '../lib/schedule'

export default function Statement() {
  const { contracts } = useData()
  const { id } = useParams()
  const contract = contracts.find(c => c.id === Number(id))

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

  const totalPaid = schedule.rows.reduce((s, r) => s + (r.actualPayment ?? 0), 0)
  const today     = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      {/* Print toolbar — hidden when printing */}
      <div className="print:hidden flex items-center gap-3 border-b border-white/5 bg-surface-base px-8 py-4">
        <Link
          to={`/contracts/${id}`}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-secondary transition-colors"
        >
          <ArrowLeft size={14} /> Back to contract
        </Link>
        <div className="flex-1" />
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-surface-base hover:bg-accent/90 transition-colors"
        >
          <Printer size={14} /> Print / Save PDF
        </button>
      </div>

      {/* Statement document */}
      <div className="statement-doc mx-auto max-w-3xl p-10 print:p-0">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-primary">Statement of Account</h1>
            <p className="mt-1 text-sm text-ink-muted">As at {today}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-ink-primary">{contract.company}</p>
            <p className="text-sm text-ink-muted">{contract.code}</p>
          </div>
        </div>

        {/* Borrower & loan details */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/8 bg-surface-card p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Borrower</p>
            <p className="font-semibold text-ink-primary">{contract.borrower}</p>
            {contract.address && <p className="text-sm text-ink-secondary">{contract.address}{contract.postcode ? `, ${contract.postcode}` : ''}</p>}
            {contract.email   && <p className="text-sm text-accent">{contract.email}</p>}
            {contract.phone   && <p className="text-sm text-ink-secondary">{contract.phone}</p>}
          </div>
          <div className="rounded-xl border border-white/8 bg-surface-card p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Loan details</p>
            {[
              ['Product',         contract.product],
              ['Amount financed', formatGBP(contract.amountFinanced)],
              ['Interest rate',   `${contract.interestRate}% p.a.`],
              ['Term',            `${contract.termMonths} months`],
              ['Start date',      formatDate(contract.startDate)],
              ['End date',        formatDate(contract.endDate)],
              ['Monthly payment', formatGBP(schedule.monthlyPayment)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-ink-muted">{l}</span>
                <span className="font-semibold text-ink-primary">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Total paid to date',  value: formatGBP(totalPaid),                 colour: 'text-success'    },
            { label: 'Outstanding balance', value: formatGBP(Math.abs(contract.arrears)), colour: contract.arrears > 0 ? 'text-danger' : 'text-success' },
            { label: 'Total cost of credit', value: formatGBP(schedule.totalPayable - contract.amountFinanced), colour: 'text-ink-primary' },
          ].map(({ label, value, colour }) => (
            <div key={label} className="rounded-xl border border-white/8 bg-surface-card p-4 text-center">
              <p className="text-xs text-ink-muted mb-1">{label}</p>
              <p className={`text-lg font-extrabold ${colour}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Repayment schedule */}
        <div className="mb-8">
          <p className="mb-3 font-semibold text-ink-primary">Repayment schedule</p>
          <div className="overflow-hidden rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 bg-surface-raised">
                <tr>
                  {['#', 'Due date', 'Payment due', 'Interest', 'Principal', 'Balance', 'Actual paid', 'Status'].map((h, i) => (
                    <th key={h} className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 1 ? 'text-right' : 'text-left'} ${h === 'Status' ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {schedule.rows.map(row => (
                  <tr key={row.period} className={`${row.status === 'missed' ? 'bg-danger/5' : ''}`}>
                    <td className="px-3 py-2 text-xs text-ink-muted">{row.period}</td>
                    <td className="px-3 py-2 text-ink-secondary">{formatDate(row.dueDate)}</td>
                    <td className="px-3 py-2 text-right text-ink-secondary">{formatGBP(row.paymentDue)}</td>
                    <td className="px-3 py-2 text-right text-ink-muted">{formatGBP(row.interest)}</td>
                    <td className="px-3 py-2 text-right text-ink-muted">{formatGBP(row.principal)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-ink-primary">{formatGBP(row.expectedBalance)}</td>
                    <td className="px-3 py-2 text-right">
                      {row.actualPayment !== null
                        ? <span className="font-semibold text-success">{formatGBP(row.actualPayment)}</span>
                        : <span className="text-ink-muted/30">—</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-semibold ${
                        row.status === 'paid'     ? 'text-success'    :
                        row.status === 'partial'  ? 'text-warn'       :
                        row.status === 'missed'   ? 'text-danger'     :
                        row.status === 'current'  ? 'text-accent'     : 'text-ink-muted'
                      }`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-white/10">
                <tr>
                  <td colSpan={2} className="px-3 py-2.5 text-xs font-bold text-ink-secondary">Total</td>
                  <td className="px-3 py-2.5 text-right text-xs font-bold text-ink-primary">{formatGBP(schedule.totalPayable)}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-bold text-ink-primary">{formatGBP(schedule.totalInterest)}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-bold text-ink-primary">{formatGBP(contract.amountFinanced)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Transaction history */}
        {contract.recentTransactions.length > 0 && (
          <div>
            <p className="mb-3 font-semibold text-ink-primary">Transaction history</p>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5 bg-surface-raised">
                  <tr>
                    {['Date', 'Type', 'Description', 'Debit', 'Credit', 'Balance'].map((h, i) => (
                      <th key={h} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {contract.recentTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="px-4 py-2.5 text-ink-secondary">{formatDate(tx.date)}</td>
                      <td className="px-4 py-2.5 text-ink-muted">{tx.type}</td>
                      <td className="px-4 py-2.5 text-ink-secondary">{tx.description}</td>
                      <td className="px-4 py-2.5 text-right text-danger">{tx.debit !== null ? formatGBP(tx.debit) : '—'}</td>
                      <td className="px-4 py-2.5 text-right text-success">{tx.credit !== null ? formatGBP(tx.credit) : '—'}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-ink-primary">{formatGBP(tx.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-white/5 pt-5 text-xs text-ink-muted">
          <p>This statement was generated by Amortix on {today}. For queries contact your loan administrator.</p>
          <p className="mt-1">Powered by Amortix · Loan Management Platform</p>
        </div>
      </div>
    </>
  )
}
