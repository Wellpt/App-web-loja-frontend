export type BalancePeriod = 'diario' | 'semanal' | 'mensal'

export interface Balance {
  periodo: BalancePeriod
  quantidade_ordens: number
  valor_servicos: number
  quantidade_vendas: number
  valor_vendas: number
  valor_total: number
}

export interface BalanceSummary {
  diario: Balance
  semanal: Balance
  mensal: Balance
}
