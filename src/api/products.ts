import { apiRequest } from './http'
import type { Product, ProductInput } from '../types/product'

export async function getProducts(signal?: AbortSignal, barcode?: string): Promise<Product[]> {
  const query = barcode ? '?codigo_barras=' + encodeURIComponent(barcode) : ''
  const result = await apiRequest<{ produtos: Product[] }>('/products' + query, { signal })
  return result.produtos
}

export async function saveProduct(input: ProductInput, id?: number): Promise<Product> {
  const result = await apiRequest<{ produto: Product }>('/products' + (id ? '/' + id : ''), {
    method: id ? 'PATCH' : 'POST', body: JSON.stringify(input),
  })
  return result.produto
}

export async function adjustStock(id: number, quantity: number, reason: string): Promise<Product> {
  const result = await apiRequest<{ produto: Product }>('/products/' + id + '/stock', {
    method: 'POST', body: JSON.stringify({ quantidade: quantity, motivo: reason }),
  })
  return result.produto
}
