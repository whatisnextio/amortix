import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, AlertTriangle, Banknote, FileText, Clock } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { contracts } from '../data/contracts'
import { formatGBP, formatDate } from '../lib/format'

const portfolioTrend = [
  { month: 'Jan', portfolio: 3200000, arrears: 580000 },
  { month: 'Feb', portfolio: 3350000, arrears: 610000 },
  { month: 'Mar', portfolio: 3500000, arrears: 590000 },
  { month: 'Apr', portfolio: 3620000, arrears: 630000 },
  { month: 'May', portfolio: 3750000, arrears: 660000 },
  { month: 'Jun', portfolio: 3860000, arrears: 640000 },
]

export default function Dashboard() {
  const totalPortfolio   = contracts.reduce((s, c) => s + c.amountFinanced, 0)
  const arrearsContracts = contracts.filter(c => c.arrears > 0)
  const totalArrears     = arrearsContracts.reduce((s, c) => s + c.arrears, 0)
  const totalExposure    = contracts.reduce((s, c) => s + Math.abs(c.exposure), 0)
  const overdueContract  = contracts.find(c => c.id === 1)

  const topArrears = [...arrearsContracts].sort((a, b) => b.arrears - a.arrears).slice(0, 6)

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-primary">Dashboard</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Portfolio overview · 4 June 2026</p>
        </div>
        <span className="pill-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Portfolio',    value: formatGBP(totalPortfolio),   sub: `${contracts.length} active loans`,          icon: Banknote,       accent: 'text-accent'  },
          { label: 'Total Arrears',      value: formatGBP(totalArrears),     sub: `${arrearsContracts.length} loans affected`,  icon: AlertTriangle,  accent: 'text-danger'  },
          { label: 'Total Exposure',     value: formatGBP(totalExposure),    sub: 'Outstanding across book',                    icon: TrendingUp,     accent: 'text-warn'    },
          { label: 'Active Contracts',   value: String(contracts.length),    sub: 'All GBP',                                    icon: FileText,       accent: 'text-success' },
        ].map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="stat-label">{label}</span>
              <Icon size={16} className={accent} />
            </div>
            <p className="stat-number">{value}</p>
            <p className="text-xs text-ink-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Portfolio trend chart */}
        <div className="card col-span-2 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink-primary">Portfolio vs Arrears</p>
              <p className="text-xs text-ink-muted">6-month trend</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={portfolioTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4aa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="arrearsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#4a5878', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#14202e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#8b9dc3' }}
                itemStyle={{ color: '#f0f4ff' }}
                formatter={(v) => formatGBP(Number(v))}
              />
              <Area type="monotone" dataKey="portfolio" stroke="#00d4aa" strokeWidth={2} fill="url(#portfolioGrad)" name="Portfolio" />
              <Area type="monotone" dataKey="arrears"   stroke="#f43f5e" strokeWidth={2} fill="url(#arrearsGrad)"   name="Arrears"   />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs text-ink-muted"><span className="h-2 w-4 rounded-full bg-accent" />Portfolio</span>
            <span className="flex items-center gap-1.5 text-xs text-ink-muted"><span className="h-2 w-4 rounded-full bg-danger" />Arrears</span>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Matured alert */}
          {overdueContract && (
            <div className="card border border-danger/20 bg-danger-subtle p-5">
              <div className="mb-3 flex items-center gap-2">
                <Clock size={14} className="text-danger" />
                <span className="text-xs font-semibold uppercase tracking-wide text-danger">Matured — unsettled</span>
              </div>
              <p className="font-semibold text-ink-primary">{overdueContract.borrower}</p>
              <p className="text-xs text-ink-muted">{overdueContract.code} · matured {formatDate(overdueContract.endDate)}</p>
              <p className="mt-3 text-2xl font-extrabold text-danger">{formatGBP(overdueContract.arrears)}</p>
              <Link to={`/contracts/${overdueContract.id}`} className="mt-3 flex items-center gap-1 text-xs font-semibold text-danger hover:text-danger/80">
                View contract <ArrowRight size={11} />
              </Link>
            </div>
          )}

          {/* Loan size */}
          <div className="card p-5">
            <p className="mb-4 text-sm font-semibold text-ink-primary">Loan size breakdown</p>
            {[
              { label: '£500k+',      count: contracts.filter(c => c.amountFinanced >= 500000).length,                                  colour: 'bg-accent'   },
              { label: '£100k–£499k', count: contracts.filter(c => c.amountFinanced >= 100000 && c.amountFinanced < 500000).length,     colour: 'bg-warn'     },
              { label: 'Under £100k', count: contracts.filter(c => c.amountFinanced < 100000).length,                                    colour: 'bg-success'  },
            ].map(({ label, count, colour }) => (
              <div key={label} className="mb-3 flex items-center gap-3">
                <span className="w-24 text-xs text-ink-muted">{label}</span>
                <div className="flex-1 rounded-full bg-white/5 h-1.5">
                  <div className={`h-1.5 rounded-full ${colour}`} style={{ width: `${(count / contracts.length) * 100}%` }} />
                </div>
                <span className="w-4 text-right text-xs font-semibold text-ink-secondary">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arrears watchlist */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <p className="font-semibold text-ink-primary">Arrears watchlist</p>
          <Link to="/contracts" className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-dim">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {topArrears.map(c => (
            <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-subtle text-sm font-bold text-danger">
                  {c.borrower.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-primary">{c.borrower}</p>
                  <p className="text-xs text-ink-muted">{c.code} · ends {formatDate(c.endDate)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-danger">{formatGBP(c.arrears)}</p>
                <p className="text-xs text-ink-muted">{formatGBP(c.amountFinanced)} loan</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
