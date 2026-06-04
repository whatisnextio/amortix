import { Link } from 'react-router-dom'
import { TrendingUp, AlertTriangle, Banknote, FileText, ArrowRight, Clock } from 'lucide-react'
import { contracts } from '../data/contracts'
import { formatGBP, formatDate } from '../lib/format'

export default function Dashboard() {
  const totalPortfolio = contracts.reduce((s, c) => s + c.amountFinanced, 0)
  const totalArrears = contracts.filter(c => c.arrears > 0).reduce((s, c) => s + c.arrears, 0)
  const inArrears = contracts.filter(c => c.arrears > 0)
  const totalExposure = contracts.reduce((s, c) => s + Math.abs(c.exposure), 0)
  const overdueContract = contracts.find(c => c.id === 1)

  const kpis = [
    {
      label: 'Total Portfolio',
      value: formatGBP(totalPortfolio),
      sub: `${contracts.length} active loans`,
      icon: Banknote,
      colour: 'bg-brand-50 text-brand-700',
      iconBg: 'bg-brand-100',
    },
    {
      label: 'Total Arrears',
      value: formatGBP(totalArrears),
      sub: `${inArrears.length} contracts affected`,
      icon: AlertTriangle,
      colour: 'bg-red-50 text-red-700',
      iconBg: 'bg-red-100',
    },
    {
      label: 'Total Exposure',
      value: formatGBP(totalExposure),
      sub: 'Outstanding balance across book',
      icon: TrendingUp,
      colour: 'bg-amber-50 text-amber-700',
      iconBg: 'bg-amber-100',
    },
    {
      label: 'Active Contracts',
      value: contracts.length.toString(),
      sub: 'All in GBP',
      icon: FileText,
      colour: 'bg-emerald-50 text-emerald-700',
      iconBg: 'bg-emerald-100',
    },
  ]

  const arrearsContracts = [...contracts]
    .filter(c => c.arrears > 0)
    .sort((a, b) => b.arrears - a.arrears)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Portfolio overview as at 4 June 2026</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-4 gap-5">
        {kpis.map(({ label, value, sub, icon: Icon, colour, iconBg }) => (
          <div key={label} className={`rounded-xl border border-transparent p-5 ${colour}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
              <span className={`rounded-lg p-2 ${iconBg}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs opacity-70">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Arrears watchlist */}
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Arrears Watchlist</h2>
            <Link to="/contracts" className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {arrearsContracts.map(c => (
              <Link
                key={c.id}
                to={`/contracts/${c.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                    {c.borrower.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.borrower}</p>
                    <p className="text-xs text-slate-400">{c.code} · ends {formatDate(c.endDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">{formatGBP(c.arrears)}</p>
                  <p className="text-xs text-slate-400">{formatGBP(c.amountFinanced)} loan</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Matured / overdue alert */}
          {overdueContract && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Clock size={15} className="text-red-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Matured — not settled</p>
              </div>
              <p className="font-semibold text-slate-900">{overdueContract.borrower}</p>
              <p className="text-xs text-slate-500">{overdueContract.code} · matured {formatDate(overdueContract.endDate)}</p>
              <p className="mt-2 text-lg font-bold text-red-600">{formatGBP(overdueContract.arrears)}</p>
              <p className="text-xs text-slate-500">outstanding</p>
              <Link
                to={`/contracts/${overdueContract.id}`}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800"
              >
                View contract <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Portfolio split */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Loan size breakdown</h3>
            {[
              { label: '£500k+', count: contracts.filter(c => c.amountFinanced >= 500000).length, colour: 'bg-brand-500' },
              { label: '£100k–£499k', count: contracts.filter(c => c.amountFinanced >= 100000 && c.amountFinanced < 500000).length, colour: 'bg-brand-300' },
              { label: 'Under £100k', count: contracts.filter(c => c.amountFinanced < 100000).length, colour: 'bg-slate-300' },
            ].map(({ label, count, colour }) => (
              <div key={label} className="mb-3 flex items-center gap-3">
                <div className="w-24 text-xs text-slate-500">{label}</div>
                <div className="flex-1 rounded-full bg-slate-100 h-2">
                  <div
                    className={`h-2 rounded-full ${colour}`}
                    style={{ width: `${(count / contracts.length) * 100}%` }}
                  />
                </div>
                <div className="w-6 text-right text-xs font-medium text-slate-700">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
