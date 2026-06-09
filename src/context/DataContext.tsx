import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Contract, Contact, Transaction } from '../types'
import { contracts as seedContracts } from '../data/contracts'
import { contacts as seedContacts } from '../data/contacts'

const CONTRACTS_KEY = 'amortix_contracts'
const CONTACTS_KEY  = 'amortix_contacts'

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : seed
  } catch {
    return seed
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

interface DataContextValue {
  contracts: Contract[]
  contacts: Contact[]
  addContract: (c: Omit<Contract, 'id' | 'code' | 'trialBalance' | 'recentTransactions'>) => Contract
  addPayment: (contractId: number, tx: Omit<Transaction, 'id'>) => void
  resetData: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>(() => load(CONTRACTS_KEY, seedContracts))
  const [contacts, setContacts]   = useState<Contact[]>(() => load(CONTACTS_KEY, seedContacts))

  useEffect(() => { save(CONTRACTS_KEY, contracts) }, [contracts])
  useEffect(() => { save(CONTACTS_KEY, contacts) },   [contacts])

  const addContract = useCallback((fields: Omit<Contract, 'id' | 'code' | 'trialBalance' | 'recentTransactions'>): Contract => {
    setContracts(prev => {
      const id   = prev.length ? Math.max(...prev.map(c => c.id)) + 1 : 1
      const code = `D${String(100000 + id).padStart(6, '0')}`
      const p    = fields.amountFinanced
      const newContract: Contract = {
        ...fields,
        id,
        code,
        balanceFinanced: p,
        recentTransactions: [],
        trialBalance: {
          earnings:       0,
          deferredIncome: -(p),
          debtors:        0,
          creditors:      -(p),
          cashReceipts:   0,
        },
      }
      const next = [...prev, newContract]
      save(CONTRACTS_KEY, next)
      return next
    })
    // Return the new contract — we need to read it back
    const raw = localStorage.getItem(CONTRACTS_KEY)
    const all: Contract[] = raw ? JSON.parse(raw) : []
    return all[all.length - 1]
  }, [])

  const addPayment = useCallback((contractId: number, tx: Omit<Transaction, 'id'>) => {
    setContracts(prev => {
      const next = prev.map(c => {
        if (c.id !== contractId) return c
        const id  = c.recentTransactions.length ? Math.max(...c.recentTransactions.map(t => t.id)) + 1 : 1
        const newTx: Transaction = { ...tx, id }
        const arrearsDelta = tx.credit != null ? -tx.credit : (tx.debit ?? 0)
        return {
          ...c,
          arrears: c.arrears + arrearsDelta,
          trialBalance: {
            ...c.trialBalance,
            cashReceipts: c.trialBalance.cashReceipts + (tx.credit ?? 0),
          },
          recentTransactions: [newTx, ...c.recentTransactions],
        }
      })
      save(CONTRACTS_KEY, next)
      return next
    })
  }, [])

  const resetData = useCallback(() => {
    save(CONTRACTS_KEY, seedContracts)
    save(CONTACTS_KEY, seedContacts)
    setContracts(seedContracts)
    setContacts(seedContacts)
  }, [])

  return (
    <DataContext.Provider value={{ contracts, contacts, addContract, addPayment, resetData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
