export default function IntegrationsSettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-primary mb-1">Integrations</h2>
        <p className="text-sm text-ink-muted">Connect Amortix to your accounting and banking services.</p>
      </div>

      <div className="space-y-4">
        {/* Xero */}
        <div className="card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#13B5EA]/10 text-[#13B5EA] font-extrabold text-sm">
              X
            </div>
            <div>
              <p className="font-semibold text-ink-primary">Xero</p>
              <p className="text-xs text-ink-muted mt-0.5">Sync nominal codes, invoices, and payments.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="pill-muted">Not connected</span>
            <button
              type="button"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent-dim transition-colors"
            >
              Connect Xero
            </button>
          </div>
        </div>

        {/* Open Banking */}
        <div className="card p-5 flex items-center justify-between gap-4 opacity-50">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-ink-muted font-extrabold text-sm">
              OB
            </div>
            <div>
              <p className="font-semibold text-ink-primary">Open Banking</p>
              <p className="text-xs text-ink-muted mt-0.5">Automated payment matching via bank feeds.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="pill-muted">Coming soon</span>
            <button
              type="button"
              disabled
              className="rounded-xl border border-white/8 px-5 py-2.5 text-sm font-semibold text-ink-muted cursor-not-allowed"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
