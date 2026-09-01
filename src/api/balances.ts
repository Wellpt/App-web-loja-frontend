import type {
  Balance,
  BalancePeriod,
  BalanceSummary,
} from '../types/balance'
import { apiRequest } from './http'

interface BalanceResponse {
  balanco: Balance
}

export async function getBalance(
  period: BalancePeriod,
  signal?: AbortSignal,
): Promise<Balance> {
  const response = await apiRequest<BalanceResponse>(
    '/balances?periodo=' + period,
    { signal },
  )

  return response.balanco
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
