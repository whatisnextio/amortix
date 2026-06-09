import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useData } from '../context/DataContext'

const PRODUCTS = ['Loan', 'Bridging Loan', 'Development Finance', 'Mezzanine Finance']

interface Fields {
  borrower: string
  company: string
  product: string
  amountFinanced: string
  interestRate: string
  termMonths: string
  startDate: string
  currency: 'GBP'
  status: 'Active'
  arrears: number
  exposure: number
  nextPaymentNet: null
}

export default function NewContract() {
  const navigate = useNavigate()
  const { addContract } = useData()

  const [fields, setFields] = useState<Fields>({
    borrower:       '',
    company:        '',
    product:        'Loan',
    amountFinanced: '',
    interestRate:   '',
    termMonths:     '',
    startDate:      new Date().toISOString().split('T')[0],
    currency:       'GBP',
    status:         'Active',
    arrears:        0,
    exposure:       0,
    nextPaymentNet: null,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})

  function set(k: keyof Fields, v: string) {
    setFields(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof Fields, string>> = {}
    if (!fields.borrower.trim())        e.borrower       = 'Required'
    if (!fields.company.trim())         e.company        = 'Required'
    if (!fields.amountFinanced || isNaN(Number(fields.amountFinanced)) || Number(fields.amountFinanced) <= 0)
                                        e.amountFinanced = 'Enter a valid amount'
    if (!fields.interestRate || isNaN(Number(fields.interestRate)) || Number(fields.interestRate) <= 0)
                                        e.interestRate   = 'Enter a valid rate'
    if (!fields.termMonths || isNaN(Number(fields.termMonths)) || Number(fields.termMonths) <= 0)
                                        e.termMonths     = 'Enter a valid term'
    if (!fields.startDate)              e.startDate      = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function computeEndDate(): string {
    const d = new Date(fields.startDate)
    d.setMonth(d.getMonth() + Number(fields.termMonths))
    return d.toISOString().split('T')[0]
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const contract = addContract({
      borrower:       fields.borrower.trim(),
      company:        fields.company.trim(),
      product:        fields.product,
      amountFinanced: Number(fields.amountFinanced),
      balanceFinanced: Number(fields.amountFinanced),
      interestRate:   Number(fields.interestRate),
      termMonths:     Number(fields.termMonths),
      startDate:      fields.startDate,
      endDate:        computeEndDate(),
      currency:       'GBP',
      status:         'Active',
      arrears:        0,
      exposure:       Number(fields.amountFinanced),
      nextPaymentNet: null,
    })
    navigate(`/contracts/${contract.id}`)
  }

  const monthly = (() => {
    const p = Number(fields.amountFinanced)
    const r = Number(fields.interestRate) / 100 / 12
    const n = Number(fields.termMonths)
    if (!p || !r || !n) return null
    return (p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
  })()

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <Link to="/contracts" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-secondary transition-colors w-fit">
        <ArrowLeft size={14} /> Back to contracts
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-primary">New loan</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Set up a new loan contract</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Borrower */}
        <div className="card p-6 space-y-4">
          <p className="font-semibold text-ink-primary">Borrower details</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Borrower name" error={errors.borrower}>
              <input
                value={fields.borrower}
                onChange={e => set('borrower', e.target.value)}
                placeholder="e.g. Smith Developments Ltd"
                className={input(errors.borrower)}
              />
            </Field>
            <Field label="Company / operator" error={errors.company}>
              <input
                value={fields.company}
                onChange={e => set('company', e.target.value)}
                placeholder="e.g. First Merchant Finance"
                className={input(errors.company)}
              />
            </Field>
          </div>
        </div>

        {/* Loan terms */}
        <div className="card p-6 space-y-4">
          <p className="font-semibold text-ink-primary">Loan terms</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product">
              <select
                value={fields.product}
                onChange={e => set('product', e.target.value)}
                className={input()}
              >
                {PRODUCTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Amount financed (£)" error={errors.amountFinanced}>
              <input
                type="number"
                min="1"
                step="1000"
                value={fields.amountFinanced}
                onChange={e => set('amountFinanced', e.target.value)}
                placeholder="e.g. 250000"
                className={input(errors.amountFinanced)}
              />
            </Field>
            <Field label="Annual interest rate (%)" error={errors.interestRate}>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={fields.interestRate}
                onChange={e => set('interestRate', e.target.value)}
                placeholder="e.g. 12.5"
                className={input(errors.interestRate)}
              />
            </Field>
            <Field label="Term (months)" error={errors.termMonths}>
              <input
                type="number"
                step="1"
                min="1"
                value={fields.termMonths}
                onChange={e => set('termMonths', e.target.value)}
                placeholder="e.g. 60"
                className={input(errors.termMonths)}
              />
            </Field>
            <Field label="Start date" error={errors.startDate}>
              <input
                type="date"
                value={fields.startDate}
                onChange={e => set('startDate', e.target.value)}
                className={input(errors.startDate)}
              />
            </Field>
            <Field label="End date (calculated)">
              <input
                readOnly
                value={fields.startDate && fields.termMonths ? computeEndDate() : ''}
                className={`${input()} cursor-default text-ink-muted`}
              />
            </Field>
          </div>

          {monthly && (
            <div className="rounded-xl border border-accent/20 bg-accent-subtle px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-secondary">Estimated monthly payment</p>
                <p className="text-xl font-extrabold text-accent">
                  £{monthly.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                Total repayable: £{(monthly * Number(fields.termMonths)).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent/90 transition-colors"
          >
            Create loan
          </button>
          <Link
            to="/contracts"
            className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-semibold text-ink-secondary hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

function input(error?: string) {
  return `w-full rounded-xl border ${error ? 'border-danger/40' : 'border-white/10'} bg-surface-raised px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted/40 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition`
}
