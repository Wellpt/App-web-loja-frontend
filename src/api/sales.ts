import type { CreateSaleInput, Sale } from '../types/sale'
import { apiRequest } from './http'

interface SaleListResponse {
  vendas: Sale[]
}

interface SaleResponse {
  venda: Sale
}

export async function getSales(signal?: AbortSignal): Promise<Sale[]> {
  const response = await apiRequest<SaleListResponse>('/sales', { signal })

  return response.vendas
}

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const response = await apiRequest<SaleResponse>('/sales', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return response.venda
}
