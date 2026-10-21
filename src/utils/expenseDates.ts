export function businessDate(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const value = (type: string) => parts.find(part => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

export function formatExpenseDate(date: string): string {
  return date.split('-').reverse().join('/')
}

export function expenseDueLabel(days: number): string {
  if (days < 0) return `Vencida há ${Math.abs(days)} ${days === -1 ? 'dia' : 'dias'}`
  if (days === 0) return 'Vence hoje'
  return `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`
}
