import { useState } from 'react'
import { Pencil, Trash2, Plus, Check, X, CheckCircle2 } from 'lucide-react'

const PRODUCTS_KEY = 'amortix_products'

interface Product {
  code: string
  name: string
  defaultRate: string
  defaultTerm: string
  arrangementFee: string
}

const DEFAULT_PRODUCTS: Product[] = [
  { code: 'CL', name: 'Commercial Loan',     defaultRate: '13%', defaultTerm: '60 months', arrangementFee: '2%'   },
  { code: 'ST', name: 'Short-Term Facility', defaultRate: '16%', defaultTerm: '24 months', arrangementFee: '1.5%' },
]

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_PRODUCTS
  } catch {
    return DEFAULT_PRODUCTS
  }
}

function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

const EMPTY: Omit<Product, 'code'> = { name: '', defaultRate: '', defaultTerm: '', arrangementFee: '' }

export default function ProductsSettings() {
  const [products, setProducts] = useState<Product[]>(loadProducts)
  const [editCode, setEditCode] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Product | null>(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [addDraft, setAddDraft] = useState<Product>({ code: '', ...EMPTY })
  const [saved, setSaved]       = useState(false)
  const [deleteCode, setDeleteCode] = useState<string | null>(null)

  function startEdit(p: Product) {
    setEditCode(p.code)
    setEditDraft({ ...p })
    setShowAdd(false)
  }

  function cancelEdit() {
    setEditCode(null)
    setEditDraft(null)
  }

  function commitEdit() {
    if (!editDraft) return
    const updated = products.map(p => p.code === editCode ? editDraft : p)
    setProducts(updated)
    saveProducts(updated)
    setEditCode(null)
    setEditDraft(null)
    flash()
  }

  function commitAdd() {
    if (!addDraft.code.trim() || !addDraft.name.trim()) return
    const updated = [...products, addDraft]
    setProducts(updated)
    saveProducts(updated)
    setShowAdd(false)
    setAddDraft({ code: '', ...EMPTY })
    flash()
  }

  function confirmDelete(code: string) {
    if (deleteCode !== code) { setDeleteCode(code); return }
    const updated = products.filter(p => p.code !== code)
    setProducts(updated)
    saveProducts(updated)
    setDeleteCode(null)
    flash()
  }

  function flash() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = 'w-full rounded-lg border border-white/10 bg-surface-base px-2.5 py-1.5 text-sm text-ink-primary outline-none focus:border-accent/50'

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-primary mb-1">Products</h2>
          <p className="text-sm text-ink-muted">Configure the loan product types available in this platform.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <CheckCircle2 size={13} /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={() => { setShowAdd(s => !s); setEditCode(null) }}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface-base hover:bg-accent/90 transition-colors"
          >
            <Plus size={14} /> Add product
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5 bg-surface-raised">
            <tr>
              {['Code', 'Name', 'Default rate', 'Default term', 'Arrangement fee', ''].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${i >= 2 && i < 5 ? 'text-right' : 'text-left'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {products.map(p => {
              const isEditing = editCode === p.code
              return (
                <tr key={p.code} className={`transition-colors ${isEditing ? 'bg-accent/5' : 'hover:bg-white/[0.025]'}`}>
                  {isEditing && editDraft ? (
                    <>
                      <td className="px-4 py-2">
                        <input value={editDraft.code} onChange={e => setEditDraft(d => d ? { ...d, code: e.target.value } : d)} className={inputCls} />
                      </td>
                      <td className="px-4 py-2">
                        <input value={editDraft.name} onChange={e => setEditDraft(d => d ? { ...d, name: e.target.value } : d)} className={inputCls} />
                      </td>
                      <td className="px-4 py-2">
                        <input value={editDraft.defaultRate} onChange={e => setEditDraft(d => d ? { ...d, defaultRate: e.target.value } : d)} className={`${inputCls} text-right`} />
                      </td>
                      <td className="px-4 py-2">
                        <input value={editDraft.defaultTerm} onChange={e => setEditDraft(d => d ? { ...d, defaultTerm: e.target.value } : d)} className={`${inputCls} text-right`} />
                      </td>
                      <td className="px-4 py-2">
                        <input value={editDraft.arrangementFee} onChange={e => setEditDraft(d => d ? { ...d, arrangementFee: e.target.value } : d)} className={`${inputCls} text-right`} />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={commitEdit} className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface-base hover:bg-accent/90 transition-colors flex items-center gap-1">
                            <Check size={11} /> Save
                          </button>
                          <button onClick={cancelEdit} className="rounded-lg border border-white/10 px-2 py-1.5 text-ink-muted hover:text-ink-secondary transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-xs text-ink-muted">{p.code}</td>
                      <td className="px-4 py-3 font-medium text-ink-primary">{p.name}</td>
                      <td className="px-4 py-3 text-right text-ink-secondary">{p.defaultRate}</td>
                      <td className="px-4 py-3 text-right text-ink-secondary">{p.defaultTerm}</td>
                      <td className="px-4 py-3 text-right text-ink-secondary">{p.arrangementFee}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(p)}
                            className="rounded-lg p-1.5 text-ink-muted hover:text-accent hover:bg-accent/10 transition-colors"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => confirmDelete(p.code)}
                            className={`rounded-lg p-1.5 transition-colors ${
                              deleteCode === p.code
                                ? 'bg-danger text-white'
                                : 'text-ink-muted hover:text-danger hover:bg-danger/10'
                            }`}
                            aria-label={deleteCode === p.code ? `Confirm delete ${p.name}` : `Delete ${p.name}`}
                            title={deleteCode === p.code ? 'Click again to confirm' : 'Delete'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              )
            })}

            {/* Add product inline row */}
            {showAdd && (
              <tr className="bg-success/5 border-t border-success/20">
                <td className="px-4 py-2">
                  <input
                    value={addDraft.code}
                    onChange={e => setAddDraft(d => ({ ...d, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. BL"
                    className={inputCls}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={addDraft.name}
                    onChange={e => setAddDraft(d => ({ ...d, name: e.target.value }))}
                    placeholder="Product name"
                    className={inputCls}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={addDraft.defaultRate}
                    onChange={e => setAddDraft(d => ({ ...d, defaultRate: e.target.value }))}
                    placeholder="e.g. 12%"
                    className={`${inputCls} text-right`}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={addDraft.defaultTerm}
                    onChange={e => setAddDraft(d => ({ ...d, defaultTerm: e.target.value }))}
                    placeholder="e.g. 48 months"
                    className={`${inputCls} text-right`}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={addDraft.arrangementFee}
                    onChange={e => setAddDraft(d => ({ ...d, arrangementFee: e.target.value }))}
                    placeholder="e.g. 1.5%"
                    className={`${inputCls} text-right`}
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={commitAdd}
                      disabled={!addDraft.code.trim() || !addDraft.name.trim()}
                      className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-surface-base hover:bg-success/90 transition-colors flex items-center gap-1 disabled:opacity-40"
                    >
                      <Check size={11} /> Add
                    </button>
                    <button
                      onClick={() => { setShowAdd(false); setAddDraft({ code: '', ...EMPTY }) }}
                      className="rounded-lg border border-white/10 px-2 py-1.5 text-ink-muted hover:text-ink-secondary transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {products.length === 0 && !showAdd && (
          <div className="px-6 py-10 text-center text-sm text-ink-muted">
            No products configured. Add one above.
          </div>
        )}
      </div>

      {deleteCode && (
        <p className="text-xs text-danger">Click the delete icon again to confirm removal of that product.</p>
      )}
    </div>
  )
}
