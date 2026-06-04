const auditRows = [
  { date: '2026-06-03 14:22', user: 'Loan Maker',       action: 'Payment posted',        record: 'D100022', ip: '185.12.44.1'  },
  { date: '2026-06-03 11:05', user: 'Operations Lead',  action: 'Contract created',       record: 'D100049', ip: '185.12.44.1'  },
  { date: '2026-06-02 16:48', user: 'Finance Viewer',   action: 'Report exported',        record: 'Portfolio summary', ip: '92.30.11.88' },
  { date: '2026-06-02 09:31', user: 'Loan Maker',       action: 'Payment posted',         record: 'D100007', ip: '185.12.44.1'  },
  { date: '2026-06-01 17:14', user: 'External Auditor', action: 'User logged in',         record: '—',       ip: '46.201.8.22'  },
  { date: '2026-06-01 10:02', user: 'Loan Maker',       action: 'Nominal code updated',   record: 'Earnings (3)', ip: '185.12.44.1' },
  { date: '2026-05-31 15:55', user: 'Operations Lead',  action: 'Contract created',       record: 'D100048', ip: '185.12.44.1'  },
  { date: '2026-05-30 08:44', user: 'Finance Viewer',   action: 'Report exported',        record: 'Arrears report', ip: '92.30.11.88' },
]

export default function AuditSettings() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-primary mb-1">Audit Log</h2>
        <p className="text-sm text-ink-muted">A record of recent system actions performed by all users.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5">
            <tr>
              {['Date / Time', 'User', 'Action', 'Contract / Record', 'IP address'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 0 ? 'text-left' : 'text-left'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {auditRows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.025] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-ink-muted whitespace-nowrap">{row.date}</td>
                <td className="px-4 py-3 text-ink-primary font-medium">{row.user}</td>
                <td className="px-4 py-3 text-ink-secondary">{row.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">{row.record}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">{row.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
