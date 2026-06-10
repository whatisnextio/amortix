import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Phone, Mail, FileText } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function ContactList() {
  const { contacts } = useData()
  const [query, setQuery] = useState('')

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-primary">Contacts</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{contacts.length} borrowers on record</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search contacts..."
            aria-label="Search contacts"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-64 rounded-xl border border-white/8 bg-surface-card py-2 pl-9 pr-4 text-sm text-ink-primary placeholder-ink-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-ink-secondary mb-1">
            {query ? 'No contacts match your search' : 'No contacts on record'}
          </p>
          <p className="text-xs text-ink-muted">
            {query ? 'Try a different name or email address.' : 'Contacts are created automatically when you add a loan.'}
          </p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(c => (
          <Link key={c.id} to={`/contacts/${c.id}`} className="card p-5 transition-all hover:border-white/10 hover:shadow-glow/5 block no-underline">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-sm font-extrabold text-accent">
                {c.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-primary">{c.name}</p>
                {c.contractCount > 0 ? (
                  <span className="pill-accent mt-0.5">
                    <FileText size={10} />
                    {c.contractCount} loan{c.contractCount !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="pill-muted mt-0.5">No active loans</span>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              {c.address && (
                <div className="flex items-start gap-2 text-xs text-ink-muted">
                  <MapPin size={11} className="mt-0.5 shrink-0" />
                  <span className="truncate">{c.address}{c.postcode ? `, ${c.postcode}` : ''}</span>
                </div>
              )}
              {c.phone && (
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <Phone size={11} />
                  {c.phone}
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-2 text-xs text-accent">
                  <Mail size={11} />
                  <span className="truncate">{c.email}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
