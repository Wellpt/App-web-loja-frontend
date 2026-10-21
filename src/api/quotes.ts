import type { Quote, QuoteInput } from '../types/quote'
import { apiRequest } from './http'

export async function getQuotes(signal?: AbortSignal): Promise<Quote[]> {
  const response = await apiRequest<{ orcamentos: Quote[] }>('/quotes', { signal })
  return response.orcamentos
}

export async function saveQuote(input: QuoteInput, quote?: Quote): Promise<Quote> {
  const response = await apiRequest<{ orcamento: Quote }>(
    quote ? `/quotes/${quote.id}` : '/quotes',
    {
      method: quote ? 'PATCH' : 'POST',
      body: JSON.stringify(quote ? { ...input, revisao: quote.revisao } : input),
    },
  )
  return response.orcamento
}

export async function convertQuote(quote: Quote): Promise<Quote> {
  const response = await apiRequest<{ orcamento: Quote }>(`/quotes/${quote.id}/convert`, {
    method: 'POST',
    body: JSON.stringify({ revisao: quote.revisao }),
  })
  return response.orcamento
}
