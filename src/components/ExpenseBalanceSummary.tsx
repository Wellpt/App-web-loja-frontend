import type { Balance } from '../types/balance'
import { formatCurrency } from '../utils/formatters'
import '../styles/expenses.css'

export function ExpenseBalanceSummary({ balance }: { balance: Balance }) {
  if (!Number.isFinite(balance.valor_despesas) || !Number.isFinite(balance.valor_liquido)) {
    return <p className="expense-financial-summary">Resumo de despesas indisponível neste momento.</p>
  }
  return <dl className="expense-financial-summary">
    <div><dt>Despesas pagas</dt><dd>{formatCurrency(balance.valor_despesas)}</dd></div>
    <div><dt>Resultado líquido</dt><dd className={balance.valor_liquido < 0 ? 'expense-negative' : undefined}>{formatCurrency(balance.valor_liquido)}</dd></div>
  </dl>
}
