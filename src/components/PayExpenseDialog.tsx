import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../api/http'
import { payExpense } from '../api/expenses'
import type { Expense } from '../types/expense'
import { businessDate, formatExpenseDate } from '../utils/expenseDates'
import { formatCurrency } from '../utils/formatters'

interface Props {
  expense: Expense
  onClose: () => void
  onPaid: (expense: Expense) => void
  onConflict: () => void
}

export function PayExpenseDialog({ expense, onClose, onPaid, onConflict }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const submitting = useRef(false)
  const [date, setDate] = useState(businessDate)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [conflict, setConflict] = useState(false)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || conflict) return
    if (!date || date < '2000-01-01' || date > businessDate()) {
      setError('Informe uma data de pagamento válida, até hoje.'); return
    }
    submitting.current = true; setBusy(true); setError('')
    try { onPaid(await payExpense(expense, date)) }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registrar o pagamento.')
      if (cause instanceof ApiError && (cause.status === 409 || cause.status === 404)) {
        setConflict(true); onConflict()
      }
    } finally { submitting.current = false; setBusy(false) }
  }

  return <dialog ref={dialog} className="expense-payment-dialog" aria-labelledby="expense-payment-title" onCancel={event => { event.preventDefault(); if (!submitting.current) onClose() }}>
    <form onSubmit={submit}>
      <h2 id="expense-payment-title">Registrar pagamento</h2>
      <p className="expense-description">{expense.descricao}</p>
      <dl className="expense-details"><div><dt>Valor</dt><dd>{formatCurrency(expense.valor)}</dd></div><div><dt>Vencimento</dt><dd>{formatExpenseDate(expense.data_vencimento)}</dd></div></dl>
      <div className="form-field"><label htmlFor="expense-paid-date">Data do pagamento</label><input id="expense-paid-date" type="date" min="2000-01-01" max={businessDate()} required disabled={busy || conflict} value={date} onChange={event => setDate(event.target.value)} /></div>
      <p>Confirme somente após pagar esta conta. O valor será descontado no balanço da data informada.</p>
      {error && <p className="expense-feedback" role="alert">{error}</p>}
      {conflict && <p>Feche esta janela e confira os dados atualizados antes de continuar.</p>}
      <div className="expense-actions"><button className="submit-button" disabled={busy || conflict}>{busy ? 'Registrando…' : 'Confirmar pagamento'}</button><button className="cancel-button" type="button" disabled={busy} onClick={onClose}>{conflict ? 'Fechar' : 'Cancelar'}</button></div>
    </form>
  </dialog>
}
