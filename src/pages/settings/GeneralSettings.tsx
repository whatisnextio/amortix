import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useData } from '../../context/DataContext'

const SETTINGS_KEY = 'amortix_settings'

const DEFAULTS = {
  companyName: 'First Merchant Finance',
  currency:    'GBP',
  fyStart:     'April',
  timezone:    'Europe/London',
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export default function GeneralSettings() {
  const { resetData }  = useData()
  const [settings, setSettings] = useState(loadSettings)
  const [saved,    setSaved]    = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  function handleSave() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    if (!confirm) { setConfirm(true); return }
    resetData()
    localStorage.removeItem(SETTINGS_KEY)
    setSettings(DEFAULTS)
    setConfirm(false)
    setSaved(false)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-primary mb-1">General</h2>
        <p className="text-sm text-ink-muted">Company-wide defaults applied across all contracts.</p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-ink-secondary mb-1.5">
            Company name
          </label>
          <input
            id="company-name"
            type="text"
            value={settings.companyName}
            onChange={e => setSettings((s: typeof DEFAULTS) => ({ ...s, companyName: e.target.value }))}
            className="w-full rounded-xl border border-white/8 bg-surface-raised px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted outline-none focus:border-accent/40"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-ink-secondary mb-1.5">
            Default currency
          </label>
          <select
            id="currency"
            value={settings.currency}
            onChange={e => setSettings((s: typeof DEFAULTS) => ({ ...s, currency: e.target.value }))}
            className="w-full rounded-xl border border-white/8 bg-surface-raised px-4 py-2.5 text-sm text-ink-primary outline-none focus:border-accent/40 appearance-none"
          >
            <option value="GBP">GBP — British Pound</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — US Dollar</option>
          </select>
        </div>

        <div>
          <label htmlFor="fy-start" className="block text-sm font-medium text-ink-secondary mb-1.5">
            Financial year start
          </label>
          <select
            id="fy-start"
            value={settings.fyStart}
            onChange={e => setSettings((s: typeof DEFAULTS) => ({ ...s, fyStart: e.target.value }))}
            className="w-full rounded-xl border border-white/8 bg-surface-raised px-4 py-2.5 text-sm text-ink-primary outline-none focus:border-accent/40 appearance-none"
          >
            <option>January</option>
            <option>April</option>
            <option>July</option>
            <option>October</option>
          </select>
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-ink-secondary mb-1.5">
            Time zone
          </label>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={e => setSettings((s: typeof DEFAULTS) => ({ ...s, timezone: e.target.value }))}
            className="w-full rounded-xl border border-white/8 bg-surface-raised px-4 py-2.5 text-sm text-ink-primary outline-none focus:border-accent/40 appearance-none"
          >
            <option value="Europe/London">Europe/London (UTC+0 / BST)</option>
            <option value="Europe/Dublin">Europe/Dublin</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent/90 transition-colors"
        >
          Save changes
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <CheckCircle2 size={13} /> Saved
          </span>
        )}
      </div>

      {/* Demo reset */}
      <div className="rounded-2xl border border-danger/20 bg-danger-subtle p-5">
        <p className="mb-1 text-sm font-semibold text-danger">Reset demo data</p>
        <p className="mb-4 text-xs text-ink-muted">Wipes all contracts, contacts, and payments back to the seed dataset. This cannot be undone.</p>
        <button
          type="button"
          onClick={handleReset}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
            confirm
              ? 'bg-danger text-white hover:bg-danger/90'
              : 'border border-danger/30 text-danger hover:bg-danger/10'
          }`}
        >
          {confirm ? 'Confirm reset — this cannot be undone' : 'Reset demo data'}
        </button>
        {confirm && (
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="ml-3 text-xs text-ink-muted hover:text-ink-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
