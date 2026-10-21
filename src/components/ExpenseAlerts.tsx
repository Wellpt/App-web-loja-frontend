import { Link } from 'react-router-dom'
import { getExpenseAlerts } from '../api/expenses'
import { useExpenseData } from '../hooks/useExpenseData'
import { expenseDueLabel, formatExpenseDate } from '../utils/expenseDates'
import '../styles/expenses.css'

export function ExpenseAlerts() {
  const { items, loading, error, refresh } = useExpenseData(getExpenseAlerts)
  if (loading) return <p role="status">Consultando lembretes de pagamento…</p>
  if (error) return <div className="expense-feedback" role="alert"><p>Lembretes indisponíveis: {error}</p><button type="button" className="cancel-button" onClick={refresh}>Tentar novamente</button></div>
  if (!items.length) return null
  return <section className="expense-alerts" aria-label="Lembretes de pagamento">
    <div className="expense-heading"><div><h3>Lembretes de pagamento</h3><p>Contas vencidas ou com vencimento nos próximos cinco dias.</p></div><Link className="cancel-button" to="/despesas">Ver despesas ({items.length})</Link></div>
    <ul>{items.slice(0, 5).map(item => <li key={item.id}><strong>{item.descricao}</strong><span>{expenseDueLabel(item.dias_para_vencer)} • {formatExpenseDate(item.data_vencimento)}</span></li>)}</ul>
    {items.length > 5 && <p>Veja todas as {items.length} contas em Despesas.</p>}
  </section>
}
