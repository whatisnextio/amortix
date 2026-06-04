const ROLE_CLS: Record<string, string> = {
  Admin:       'pill-danger',
  Manager:     'pill-warn',
  'Read-only': 'pill-muted',
}

const STATUS_CLS: Record<string, string> = {
  Active:   'pill-success',
  Inactive: 'pill-muted',
}

const users = [
  { name: 'Loan Maker',       email: 'maker@loanoperator.co.uk',   role: 'Admin',       status: 'Active'   },
  { name: 'Finance Viewer',   email: 'finance@loanoperator.co.uk', role: 'Read-only',   status: 'Active'   },
  { name: 'Operations Lead',  email: 'ops@loanoperator.co.uk',     role: 'Manager',     status: 'Active'   },
  { name: 'External Auditor', email: 'audit@externalfirm.co.uk',   role: 'Read-only',   status: 'Inactive' },
]

export default function UsersSettings() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-primary mb-1">Users &amp; Roles</h2>
          <p className="text-sm text-ink-muted">Manage who has access to Amortix and what they can do.</p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent-dim transition-colors"
        >
          Invite user
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5">
            <tr>
              {['Name', 'Email', 'Role', 'Status'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i === 0 ? 'text-left' : i === 1 ? 'text-left' : 'text-center'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {users.map(u => (
              <tr key={u.email} className="hover:bg-white/[0.025] transition-colors">
                <td className="px-4 py-3 font-medium text-ink-primary">{u.name}</td>
                <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className={ROLE_CLS[u.role] ?? 'pill-muted'}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={STATUS_CLS[u.status] ?? 'pill-muted'}>{u.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
