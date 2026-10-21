export interface Expense {
  id: number
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento: string | null
  pago_por: number | null
  status: 'pendente' | 'atrasada' | 'paga'
  dias_para_vencer: number
  lembrete_pagamento: boolean
  funcionario_id: number
  revisao: number
  criado_em: string
  atualizado_em: string
}

export interface ExpenseInput {
  descricao: string
  valor: number
  data_vencimento: string
}
