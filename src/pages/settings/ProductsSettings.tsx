const products = [
  { code: 'CL', name: 'Commercial Loan',      defaultRate: '13%', defaultTerm: '60 months', arrangementFee: '2%'   },
  { code: 'ST', name: 'Short-Term Facility',  defaultRate: '16%', defaultTerm: '24 months', arrangementFee: '1.5%' },
]

export default function ProductsSettings() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-primary mb-1">Products</h2>
          <p className="text-sm text-ink-muted">Configure the loan product types available in this platform.</p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent-dim transition-colors"
        >
          Add product
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5">
            <tr>
              {['Code', 'Name', 'Default rate', 'Default term', 'Arrangement fee'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 1 ? 'text-right' : 'text-left'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {products.map(p => (
              <tr key={p.code} className="hover:bg-white/[0.025] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">{p.code}</td>
                <td className="px-4 py-3 font-medium text-ink-primary">{p.name}</td>
                <td className="px-4 py-3 text-right text-ink-secondary">{p.defaultRate}</td>
                <td className="px-4 py-3 text-right text-ink-secondary">{p.defaultTerm}</td>
                <td className="px-4 py-3 text-right text-ink-secondary">{p.arrangementFee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
