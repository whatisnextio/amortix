export interface Contract {
  id: number
  code: string
  product: string
  status: 'Active' | 'Terminated' | 'Settled'
  borrower: string
  startDate: string
  endDate: string
  termMonths: number
  amountFinanced: number
  balanceFinanced: number
  arrears: number
  exposure: number
  nextPaymentNet: number | null
  company: string
  currency: 'GBP'
  accountNumber?: string
  address?: string
  postcode?: string
  contactName?: string
  phone?: string
  email?: string
  interestRate: number
  trialBalance: TrialBalance
  recentTransactions: Transaction[]
}

export interface TrialBalance {
  earnings: number
  deferredIncome: number
  debtors: number
  creditors: number
  cashReceipts: number
}

export interface Transaction {
  id: number
  date: string
  type: 'Payment' | 'Interest accrual' | 'Fee' | 'Adjustment'
  description: string
  debit: number | null
  credit: number | null
  balance: number
}

export interface Contact {
  id: number
  name: string
  address?: string
  postcode?: string
  contactName?: string
  phone?: string
  email?: string
  mobile?: string
  accountNumber?: string
  contractCount: number
}
