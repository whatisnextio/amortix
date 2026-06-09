import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, AlertTriangle, Banknote, FileText, Clock, CalendarDays } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useData } from '../context/DataContext'
import { formatGBP, formatDate } from '../lib/format'
import { generateSchedule } from '../lib/schedule'

function addMonthsToDate(date: Date, n: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

function monthKey(d: Date): string {
  return d.toISOString().slice(0, 7)
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

export default function Dashboard() {
  const { contracts } = useData()

  const today        = new Date()
  const todayDisplay = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const todayISO     = today.toISOString().split('T')[0]

  const totalPortfolio   = contracts.reduce((s, c) => s + c.amountFinanced, 0)
  const arrearsContracts = contracts.filter(c => c.arrears > 0)
  const totalArrears     = arrearsContracts.reduce((s, c) => s + c.arrears, 0)
  const totalExposure    = contracts.reduce((s, c) => s + Math.abs(c.exposure), 0)

  // Matured and unsettled
  const overdueContract = contracts.find(c => c.endDate <= todayISO && c.arrears > 0)

  // Maturing within 90 days
  const cutoff90 = new Date(today)
  cutoff90.setDate(cutoff90.getDate() + 90)
  const cutoff90ISO = cutoff90.toISOString().split('T')[0]
  const maturingSoon = contracts
    .filter(c => c.endDate > todayISO && c.endDate <= cutoff90ISO)
    .sort((a, b) => a.endDate.localeCompare(b.endDate))
    .slice(0, 5)

  // 12-month cashflow forecast
  const cashflowData = useMemo(() => {
    const slots: Record<string, { label: string; expected: number; atRisk: number }> = {}
    for (let i = 0; i < 12; i++) {
      const d = addMonthsToDate(today, i)
      const key = monthKey(d)
      slots[key] = { label: monthLabel(d), expected: 0, atRisk: 0 }
    }

    contracts.forEach(c => {
      const schedule = generateSchedule(
        c.amountFinanced,
        c.interestRate,
        c.termMonths,
        c.startDate,
        c.recentTransactions,
      )
      const inArrears = c.arrears > 0

      schedule.rows.forEach(row => {
        const mk = row.dueDate.slice(0, 7)
        if (slots[mk] && (row.status === 'upcoming' || row.status === 'current')) {
          if (inArrears) {
            slots[mk].atRisk += row.paymentDue
          } else {
            slots[mk].expected += row.paymentDue
          }
        }
      })
    })

    return Object.values(slots)
  }, [contracts])

  const topArrears = [...arrearsContracts].sort((a, b) => b.arrears - a.arrears).slice(0, 6)

  const portfolioTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = addMonthsToDate(today, i - 5)
      return {
        month: d.toLocaleDateString('en-GB', { month: 'short' }),
        portfolio: totalPortfolio - (5 - i) * totalPortfolio * 0.008,
        arrears: totalArrears + (i - 5) * totalArrears * 0.04,
      }
    })
  }, [totalPortfolio, totalArrears])

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-primary">Dashboard</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Portfolio overview · {todayDisplay}</p>
        </div>
        <span className="pill-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Portfolio',   value: formatGBP(totalPortfolio),   sub: `${contracts.length} active loans`,         icon: Banknote,       accent: 'text-accent'  },
          { label: 'Total Arrears',     value: formatGBP(totalArrears),     sub: `${arrearsContracts.length} loans affected`, icon: AlertTriangle,  accent: 'text-danger'  },
          { label: 'Total Exposure',    value: formatGBP(totalExposure),    sub: 'Outstanding across book',                   icon: TrendingUp,     accent: 'text-warn'    },
          { label: 'Active Contracts',  value: String(contracts.length),    sub: 'All GBP',                                   icon: FileText,       accent: 'text-success' },
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

          {/* Loan size breakdown */}
          <div className="card p-5">
            <p className="mb-4 text-sm font-semibold text-ink-primary">Loan size breakdown</p>
            {[
              { label: '£500k+',      count: contracts.filter(c => c.amountFinanced >= 500000).length,                                colour: 'bg-accent'   },
              { label: '£100k–£499k', count: contracts.filter(c => c.amountFinanced >= 100000 && c.amountFinanced < 500000).length,  colour: 'bg-warn'     },
              { label: 'Under £100k', count: contracts.filter(c => c.amountFinanced < 100000).length,                                 colour: 'bg-success'  },
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

      {/* 12-month cashflow forecast */}
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink-primary">12-month cashflow forecast</p>
            <p className="text-xs text-ink-muted">Expected receipts from scheduled payments · at-risk from contracts in arrears</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={cashflowData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2}>
            <XAxis dataKey="label" tick={{ fill: '#4a5878', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#14202e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: '#8b9dc3' }}
              itemStyle={{ color: '#f0f4ff' }}
              formatter={(v) => formatGBP(Number(v))}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: '#8b9dc3', fontSize: 11 }}>{value}</span>}
            />
            <Bar dataKey="expected" name="Expected"  fill="#00d4aa" radius={[3, 3, 0, 0]} opacity={0.85} />
            <Bar dataKey="atRisk"   name="At risk"   fill="#f43f5e" radius={[3, 3, 0, 0]} opacity={0.75} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Maturing soon strip */}
      {maturingSoon.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
            <CalendarDays size={14} className="text-warn" />
            <p className="font-semibold text-ink-primary">Maturing within 90 days</p>
            <span className="ml-auto rounded-full bg-warn/20 px-2 py-0.5 text-xs font-bold text-warn">{maturingSoon.length}</span>
          </div>
          <div className="divide-y divide-white/5">
            {maturingSoon.map(c => {
              const daysLeft = Math.ceil((new Date(c.endDate).getTime() - today.getTime()) / 86400000)
              return (
                <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warn/10 text-sm font-bold text-warn">
                      {c.borrower.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-primary">{c.borrower}</p>
                      <p className="text-xs text-ink-muted">{c.code} · matures {formatDate(c.endDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-warn">{daysLeft} days</p>
                    <p className="text-xs text-ink-muted">{formatGBP(c.amountFinanced)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

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
