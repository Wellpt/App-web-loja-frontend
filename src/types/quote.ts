export interface Quote {
  id: number
  cliente: { id: number; nome: string }
  descricao_servico: string
  valor: number
  custo_materiais: number
  revisao: number
  status: 'pendente' | 'convertido'
  ordem_servico_id: number | null
  criado_em: string
  atualizado_em: string
  convertido_em: string | null
}

export interface QuoteInput {
  cliente_id: number
  descricao_servico: string
  valor: number
  custo_materiais: number
}
