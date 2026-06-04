import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowUpDown } from 'lucide-react'
import { contracts } from '../data/contracts'
import { formatGBP, formatDate } from '../lib/format'

type SortKey = 'borrower' | 'amountFinanced' | 'arrears' | 'endDate'

export default function ContractList() {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('arrears')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = contracts
    .filter(c =>
      c.borrower.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const th = (label: string, key: SortKey) => (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
      onClick={() => toggleSort(key)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={sortKey === key ? 'text-brand-500' : 'text-slate-300'} />
      </span>
    </th>
  )

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
          <p className="mt-1 text-sm text-slate-500">{contracts.length} active loans</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search borrower or code..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Code</th>
              {th('Borrower', 'borrower')}
              {th('Amount', 'amountFinanced')}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Start</th>
              {th('End', 'endDate')}
              {th('Arrears', 'arrears')}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Next payment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(c => {
              const isOverdue = new Date(c.endDate) < new Date() && c.arrears > 0
              const hasArrears = c.arrears > 0
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.borrower}</td>
                  <td className="px-4 py-3 text-slate-700">{formatGBP(c.amountFinanced)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.startDate)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.endDate)}</td>
                  <td className={`px-4 py-3 font-medium ${hasArrears ? 'text-red-600' : 'text-emerald-600'}`}>
                    {hasArrears ? formatGBP(c.arrears) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {c.nextPaymentNet ? formatGBP(c.nextPaymentNet) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {isOverdue ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Overdue</span>
                    ) : hasArrears ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">In arrears</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Current</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/contracts/${c.id}`}
                      className="text-xs font-medium text-brand-500 hover:text-brand-700"
                    >
                      View
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
