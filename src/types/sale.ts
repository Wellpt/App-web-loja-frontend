export interface SaleCustomer {
  id: number
  nome: string
}

export interface SaleEmployee {
  id: number
  nome: string
}

export interface SaleItem {
  id: number
  descricao: string
  quantidade: number
  valor_unitario: number
  subtotal: number
}

export interface Sale {
  id: number
  cliente: SaleCustomer | null
  itens: SaleItem[]
  forma_pagamento: string
  valor_total: number
  funcionario: SaleEmployee
  status: 'concluida'
  realizada_em: string
}

export interface CreateSaleItemInput {
  descricao: string
  quantidade: number
  valor_unitario: number
}

export interface CreateSaleInput {
  cliente_id?: number | null
  itens: CreateSaleItemInput[]
  forma_pagamento: string
}
