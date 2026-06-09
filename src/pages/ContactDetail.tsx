import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Mail, Pencil } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatGBP, formatDate } from '../lib/format'

export default function ContactDetail() {
  const { contacts, contracts } = useData()
  const { id } = useParams()
  const contact = contacts.find(c => c.id === Number(id))
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState('')

  if (!contact) {
    return (
      <div className="p-8 text-ink-muted">Contact not found.</div>
    )
  }

  const relatedContracts = contracts.filter(c => c.borrower === contact.name)
  const activeCount = relatedContracts.filter(c => c.status === 'Active').length

  function handleSaveNote() {
    setSavedNote(note)
  }

  return (
    <div className="p-8 space-y-6">
      <Link
        to="/contacts"
        className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-secondary transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to contacts
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-subtle text-xl font-extrabold text-accent">
            {contact.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink-primary">{contact.name}</h1>
              {activeCount > 0 && (
                <span className="pill-accent">{activeCount} active loan{activeCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-ink-muted">Contact ID #{contact.id}</p>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-white/8 px-5 py-2.5 text-sm font-semibold text-ink-secondary hover:bg-white/5 transition-colors"
        >
          <Pencil size={14} />
          Edit contact
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Contact info */}
        <div className="card p-5 space-y-4">
          <p className="font-semibold text-ink-primary">Contact information</p>
          <dl className="space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin size={14} className="mt-0.5 shrink-0 text-ink-muted" />
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Address</dt>
                {contact.address
                  ? <dd className="text-sm text-ink-secondary">{contact.address}{contact.postcode ? `, ${contact.postcode}` : ''}</dd>
                  : <dd className="text-sm text-ink-muted/50 italic">Not provided</dd>
                }
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone size={14} className="mt-0.5 shrink-0 text-ink-muted" />
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Phone</dt>
                {contact.phone
                  ? <dd className="text-sm text-ink-secondary">{contact.phone}</dd>
                  : <dd className="text-sm text-ink-muted/50 italic">Not provided</dd>
                }
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail size={14} className="mt-0.5 shrink-0 text-ink-muted" />
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Email</dt>
                {contact.email
                  ? <dd className="text-sm text-accent">{contact.email}</dd>
                  : <dd className="text-sm text-ink-muted/50 italic">Not provided</dd>
                }
              </div>
            </div>
          </dl>
        </div>

        {/* Contracts table */}
        <div className="col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="font-semibold text-ink-primary">Loan contracts</p>
          </div>
          {relatedContracts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-ink-muted">No contracts found for this contact.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr>
                  {['Code', 'Amount', 'Start', 'End', 'Arrears', 'Status'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i > 1 ? 'text-right' : 'text-left'} ${h === 'Status' ? 'text-center' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {relatedContracts.map(c => {
                  const inArrears = c.arrears > 0
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-white/[0.025] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/contracts/${c.id}`}
                          className="font-mono text-xs text-accent hover:underline"
                        >
                          {c.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink-primary">{formatGBP(c.amountFinanced)}</td>
                      <td className="px-4 py-3 text-right text-ink-secondary">{formatDate(c.startDate)}</td>
                      <td className="px-4 py-3 text-right text-ink-secondary">{formatDate(c.endDate)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${inArrears ? 'text-danger' : 'text-success'}`}>
                        {inArrears ? '+' : ''}{formatGBP(c.arrears)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="pill-success">{c.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="card p-5 max-w-2xl space-y-3">
        <p className="font-semibold text-ink-primary">Notes</p>
        {savedNote && (
          <div className="rounded-xl bg-surface-raised border border-white/5 px-4 py-3 text-sm text-ink-secondary">
            {savedNote}
          </div>
        )}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note about this contact..."
          rows={4}
          className="w-full rounded-xl border border-white/8 bg-surface-raised px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted outline-none focus:border-accent/40 resize-none"
          aria-label="Contact notes"
        />
        <button
          type="button"
          onClick={handleSaveNote}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent-dim transition-colors"
        >
          Save note
        </button>
      </div>
    </div>
  )
}
