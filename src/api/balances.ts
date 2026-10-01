import type {
  Balance,
  BalancePeriod,
  BalanceSummary,
} from '../types/balance'
import { apiRequest } from './http'

interface BalanceResponse {
  balanco: Balance
}

interface MonthlyBalanceReference {
  year: number
  month: number
}

export async function getBalance(
  period: BalancePeriod,
  signal?: AbortSignal,
  reference?: MonthlyBalanceReference,
): Promise<Balance> {
  const query = new URLSearchParams({ periodo: period })
  if (reference) {
    query.set('ano', String(reference.year))
    query.set('mes', String(reference.month))
  }

  const response = await apiRequest<BalanceResponse>(
    '/balances?' + query.toString(),
    { signal },
  )

  return response.balanco
}

export function getMonthlyBalance(
  year: number,
  month: number,
  signal?: AbortSignal,
): Promise<Balance> {
  return getBalance('mensal', signal, { year, month })
}

export async function getBalances(
  signal?: AbortSignal,
): Promise<BalanceSummary> {
  const [daily, weekly, monthly] = await Promise.all([
    getBalance('diario', signal),
    getBalance('semanal', signal),
    getBalance('mensal', signal),
  ])

  return {
    diario: daily,
    semanal: weekly,
    mensal: monthly,
  }
}
