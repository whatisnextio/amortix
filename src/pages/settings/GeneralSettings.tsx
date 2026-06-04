export default function GeneralSettings() {
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
            defaultValue="Loan Operator"
            className="w-full rounded-xl border border-white/8 bg-surface-raised px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted outline-none focus:border-accent/40"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-ink-secondary mb-1.5">
            Default currency
          </label>
          <select
            id="currency"
            defaultValue="GBP"
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
            defaultValue="April"
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
            defaultValue="Europe/London"
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
