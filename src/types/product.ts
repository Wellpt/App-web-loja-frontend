export interface Product {
  id: number
  codigo_barras: string
  descricao: string
  quantidade_estoque: number
  valor_custo?: number
  percentual?: number
  valor_venda: number
}

interface ProductInputBase {
  codigo_barras: string
  descricao: string
  valor_custo: number
  quantidade_estoque?: number
}

export type ProductInput = ProductInputBase & (
  | { percentual: number; valor_venda?: never }
  | { valor_venda: number; percentual?: never }
)
