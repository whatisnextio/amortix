export interface ScheduleRow {
  period: number
  dueDate: string
  paymentDue: number
  interest: number
  principal: number
  expectedBalance: number
  actualPayment: number | null
  status: 'paid' | 'partial' | 'missed' | 'upcoming' | 'current'
}

export interface ScheduleSummary {
  monthlyPayment: number
  totalPayable: number
  totalInterest: number
  rows: ScheduleRow[]
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  // Snap to end of month if start date is end-of-month
  const original = new Date(dateStr)
  const lastDay = new Date(original.getFullYear(), original.getMonth() + months + 1, 0).getDate()
  if (original.getDate() >= 28) {
    d.setDate(lastDay)
  }
  return d.toISOString().split('T')[0]
}

function sameMonth(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7)
}

export function generateSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: string,
  actualPayments: { date: string; credit: number | null }[]
): ScheduleSummary {
  const r = annualRate / 100 / 12
  const monthlyPayment =
    r === 0
      ? principal / termMonths
      : (principal * (r * Math.pow(1 + r, termMonths))) / (Math.pow(1 + r, termMonths) - 1)

  const today = new Date().toISOString().split('T')[0]
  let balance = principal
  const rows: ScheduleRow[] = []

  for (let i = 1; i <= termMonths; i++) {
    const dueDate = addMonths(startDate, i)
    const interest = balance * r
    const principalPaid = Math.min(monthlyPayment - interest, balance)
    balance = Math.max(0, balance - principalPaid)

    const match = actualPayments.find(p => p.credit !== null && sameMonth(p.date, dueDate))
    const actualPayment = match?.credit ?? null

    let status: ScheduleRow['status']
    if (dueDate > today) {
      status = sameMonth(dueDate, today) ? 'current' : 'upcoming'
    } else if (actualPayment === null) {
      status = 'missed'
    } else if (actualPayment >= monthlyPayment * 0.99) {
      status = 'paid'
    } else {
      status = 'partial'
    }

    rows.push({
      period: i,
      dueDate,
      paymentDue: monthlyPayment,
      interest,
      principal: principalPaid,
      expectedBalance: balance,
      actualPayment,
      status,
    })
  }

  return {
    monthlyPayment,
    totalPayable: monthlyPayment * termMonths,
    totalInterest: monthlyPayment * termMonths - principal,
    rows,
  }
}
