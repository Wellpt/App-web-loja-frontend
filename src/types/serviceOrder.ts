export type ServiceOrderStatus = 'aberta' | 'concluida'

export interface ServiceOrderCustomer {
  id: number
  nome: string
}

export interface ServiceOrder {
  id: number
  cliente: ServiceOrderCustomer
  descricao_servico: string
  status: ServiceOrderStatus
  valor: number | null
  forma_pagamento: string | null
  criada_em: string
  concluida_em: string | null
}

export interface CreateServiceOrderInput {
  cliente_id: number
  descricao_servico: string
  valor: number
}

export interface UpdateServiceOrderValueInput {
  valor: number
}

export interface CompleteServiceOrderInput {
  forma_pagamento: string
}
