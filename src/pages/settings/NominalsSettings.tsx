import { useState } from 'react'

const initialNominals = [
  { nominal: '3',   label: 'Earnings',        xero: '200' },
  { nominal: '503', label: 'Deferred Income', xero: '485' },
  { nominal: '601', label: 'Debtors',         xero: '610' },
  { nominal: '602', label: 'Creditors',       xero: '900' },
  { nominal: '621', label: 'Cash Receipts',   xero: '100' },
]

export default function NominalsSettings() {
  const [nominals, setNominals] = useState(initialNominals)

  function handleChange(nominal: string, value: string) {
    setNominals(prev =>
      prev.map(n => (n.nominal === nominal ? { ...n, xero: value } : n))
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-primary mb-1">Nominal Codes</h2>
        <p className="text-sm text-ink-muted">
          Map each internal accounting nominal to its corresponding Xero nominal code.
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5">
            <tr>
              {['Internal nominal', 'Description', 'Xero code'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i === 2 ? 'text-right' : 'text-left'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {nominals.map(n => (
              <tr key={n.nominal} className="hover:bg-white/[0.025] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">{n.nominal}</td>
                <td className="px-4 py-3 text-ink-secondary">{n.label}</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="text"
                    value={n.xero}
                    onChange={e => handleChange(n.nominal, e.target.value)}
                    aria-label={`Xero code for ${n.label}`}
                    className="w-24 rounded-xl border border-white/8 bg-surface-raised px-3 py-1.5 text-sm text-ink-primary text-right outline-none focus:border-accent/40"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent-dim transition-colors"
        >
          Save changes
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/8 px-5 py-2.5 text-sm font-semibold text-ink-secondary hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
