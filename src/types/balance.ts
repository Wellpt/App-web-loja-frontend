export type BalancePeriod = 'diario' | 'semanal' | 'mensal'

export interface Balance {
  periodo: BalancePeriod
  quantidade_ordens: number
  valor_total: number
}

export interface BalanceSummary {
  diario: Balance
  semanal: Balance
  mensal: Balance
}
