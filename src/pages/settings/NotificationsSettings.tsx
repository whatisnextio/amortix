import { useState } from 'react'

const initialAlerts = [
  {
    id: 'overdue',
    label: 'Payment overdue alert',
    description: 'Notify when a scheduled payment is not received by its due date.',
    enabled: true,
  },
  {
    id: 'maturing',
    label: 'Contract maturing in 30 days',
    description: 'Notify when a loan is within 30 days of its end date.',
    enabled: true,
  },
  {
    id: 'new-contract',
    label: 'New contract created',
    description: 'Notify when a new loan contract is added to the platform.',
    enabled: false,
  },
  {
    id: 'monthly-summary',
    label: 'Monthly portfolio summary email',
    description: 'Receive a monthly digest of portfolio performance metrics.',
    enabled: true,
  },
]

export default function NotificationsSettings() {
  const [alerts, setAlerts] = useState(initialAlerts)

  function toggle(id: string) {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a)))
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-primary mb-1">Notifications</h2>
        <p className="text-sm text-ink-muted">Choose which email alerts are sent to administrators.</p>
      </div>

      <div className="card divide-y divide-white/[0.04]">
        {alerts.map(a => (
          <div key={a.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-primary">{a.label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{a.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={a.enabled}
              aria-label={a.label}
              onClick={() => toggle(a.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                a.enabled ? 'bg-accent' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  a.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent-dim transition-colors"
      >
        Save preferences
      </button>
    </div>
  )
}
