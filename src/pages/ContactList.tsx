import { useState } from 'react'
import { Search, MapPin, Phone, Mail } from 'lucide-react'
import { contacts } from '../data/contacts'

export default function ContactList() {
  const [query, setQuery] = useState('')

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="mt-1 text-sm text-slate-500">{contacts.length} borrowers on record</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-slate-900">{c.name}</p>
                {c.contractCount > 0 ? (
                  <p className="text-xs text-brand-500">{c.contractCount} active loan{c.contractCount !== 1 ? 's' : ''}</p>
                ) : (
                  <p className="text-xs text-slate-400">No active loans</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              {c.address && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500">
                  <MapPin size={11} className="mt-0.5 shrink-0" />
                  <span className="truncate">{c.address}{c.postcode ? `, ${c.postcode}` : ''}</span>
                </div>
              )}
              {c.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone size={11} />
                  {c.phone}
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-1.5 text-xs text-brand-500">
                  <Mail size={11} />
                  <span className="truncate">{c.email}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
