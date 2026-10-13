import { currencyInputToNumber, formatCurrencyInput } from './formatters'

export function priceFromMarkup(cost: string, markup: string): string {
  const costCents = Math.round(currencyInputToNumber(cost) * 100)
  if (costCents <= 0 || !/^\d+([.,]\d{1,2})?$/.test(markup)) return ''
  const points = Math.round(Number(markup.replace(',', '.')) * 100)
  if (points > 1000000) return ''
  const cents = (BigInt(costCents) * BigInt(10000 + points) + 5000n) / 10000n
  if (cents > 999999999999n) return ''
  return formatCurrencyInput(String(cents))
}

export function markupFromPrice(cost: string, price: string): string {
  const costCents = BigInt(Math.round(currencyInputToNumber(cost) * 100))
  const priceCents = BigInt(Math.round(currencyInputToNumber(price) * 100))
  if (costCents <= 0n || !price || priceCents < costCents) return ''
  const numerator = (priceCents - costCents) * 10000n
  if (numerator > costCents * 1000000n) return ''
  const points = (numerator + costCents / 2n) / costCents
  return (Number(points) / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2, useGrouping: false })
}
