import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowUpDown, ArrowRight, Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatGBP, formatDate } from '../lib/format'

type SortKey = 'borrower' | 'amountFinanced' | 'arrears' | 'endDate'

export default function ContractList() {
  const { contracts } = useData()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('arrears')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = contracts
    .filter(c =>
      c.borrower.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      if (typeof va === 'string' && typeof vb === 'string')
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortTh = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      onClick={() => toggleSort(k)}
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink-secondary transition-colors"
    >
      <span className="flex items-center gap-1.5">
        {label}
        <ArrowUpDown size={11} className={sortKey === k ? 'text-accent' : 'text-white/20'} />
      </span>
    </th>
  )

  return (
    <div className="p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-primary">Contracts</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{contracts.length} active loans</p>
        </div>
        <div className="flex items-center gap-3">
        <Link
          to="/contracts/new"
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent/90 transition-colors"
        >
          <Plus size={14} /> New loan
        </Link>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search borrower or code..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-64 rounded-xl border border-white/8 bg-surface-card py-2 pl-9 pr-4 text-sm text-ink-primary placeholder-ink-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
          />
        </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Code</th>
              <SortTh label="Borrower"  k="borrower"       />
              <SortTh label="Amount"    k="amountFinanced" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Start</th>
              <SortTh label="End"       k="endDate"        />
              <SortTh label="Arrears"   k="arrears"        />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Next payment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(c => {
              const isOverdue  = new Date(c.endDate) < new Date() && c.arrears > 0
              const hasArrears = c.arrears > 0
              return (
                <tr key={c.id} className="group transition-colors hover:bg-white/[0.025]">
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{c.code}</td>
                  <td className="px-4 py-3 font-semibold text-ink-primary">{c.borrower}</td>
                  <td className="px-4 py-3 text-ink-secondary">{formatGBP(c.amountFinanced)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(c.startDate)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(c.endDate)}</td>
                  <td className="px-4 py-3 font-semibold">
                    <span className={hasArrears ? 'text-danger' : 'text-ink-muted'}>
                      {hasArrears ? formatGBP(c.arrears) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">
                    {c.nextPaymentNet ? formatGBP(c.nextPaymentNet) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {isOverdue  ? <span className="pill-danger">Overdue</span>
                    : hasArrears ? <span className="pill-warn">In arrears</span>
                    :              <span className="pill-success">Current</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/contracts/${c.id}`} className="flex items-center gap-1 text-xs font-semibold text-ink-muted group-hover:text-accent transition-colors">
                      View <ArrowRight size={11} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
