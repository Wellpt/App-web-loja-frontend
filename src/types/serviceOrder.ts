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
}

export interface CreatedServiceOrder {
  id: number
  cliente_id: number
  descricao_servico: string
  status: ServiceOrderStatus
  criada_em: string
}

export interface CompleteServiceOrderInput {
  status: 'concluida'
  valor: number
  forma_pagamento: string
}

export interface CompletedServiceOrder {
  id: number
  cliente_id: number
  descricao_servico: string
  status: 'concluida'
  valor: number
  forma_pagamento: string
  criada_em: string
  concluida_em: string
}
