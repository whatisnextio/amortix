import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const user = login(email, password)
    setLoading(false)
    if (!user) {
      setError('Invalid email or password.')
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="space-y-2 text-center">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Amortix"
            className="mx-auto h-12 w-auto"
          />
          <p className="text-sm text-ink-muted">Loan management platform</p>
        </div>

        <div className="card p-8 space-y-6">
          <h1 className="text-xl font-bold text-ink-primary">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted/40 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted/40 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-danger/20 bg-danger-subtle px-4 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-surface-base transition hover:bg-accent/90 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="rounded-xl border border-white/5 bg-surface-raised px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-ink-muted">Demo credentials</p>
            <p className="font-mono text-xs text-ink-secondary">demo@amortix.io / demo2026</p>
            <p className="font-mono text-xs text-ink-secondary">user@amortix.io / user2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
