import { useRef, useState, type FormEvent } from 'react'
import { getExpenses, notifyExpensesChanged, saveExpense } from '../api/expenses'
import { ApiError } from '../api/http'
import { PayExpenseDialog } from '../components/PayExpenseDialog'
import { useExpenseData } from '../hooks/useExpenseData'
import type { Expense } from '../types/expense'
import { expenseDueLabel, formatExpenseDate } from '../utils/expenseDates'
import { currencyInputToNumber, formatCurrency, formatCurrencyInput } from '../utils/formatters'
import '../styles/expenses.css'

const emptyDraft = { description: '', amount: '', due: '' }

export function ExpensesPage() {
  const { items, loading, error: loadError, refresh } = useExpenseData(getExpenses)
  const [draft, setDraft] = useState(emptyDraft)
  const [editing, setEditing] = useState<Expense>()
  const [paying, setPaying] = useState<Expense>()
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [conflict, setConflict] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todas')

  function reset() {
    setEditing(undefined); setDraft(emptyDraft); setConflict(false); setError('')
  }

  function edit(expense: Expense) {
    setEditing(expense)
    setDraft({ description: expense.descricao, amount: formatCurrencyInput(expense.valor.toFixed(2)), due: expense.data_vencimento })
    setConflict(false); setError(''); setNotice('')
    form.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    form.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus({ preventScroll: true })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || conflict) return
    setError(''); setNotice('')
    const input = { descricao: draft.description.trim(), valor: currencyInputToNumber(draft.amount), data_vencimento: draft.due }
    if (!input.descricao || input.valor <= 0 || !input.data_vencimento || input.data_vencimento < '2000-01-01') {
      setError('Informe a descrição, um valor maior que zero e a data de vencimento.'); return
    }
    submitting.current = true; setBusy(true)
    try {
      const saved = await saveExpense(input, editing)
      setNotice(`Despesa #${saved.id} ${editing ? 'atualizada' : 'cadastrada'} com sucesso.`)
      reset(); refresh(); notifyExpensesChanged()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a despesa.')
      if (cause instanceof ApiError && (cause.status === 409 || cause.status === 404)) {
        setConflict(true); refresh()
      }
    } finally { submitting.current = false; setBusy(false) }
  }

  function paid(expense: Expense) {
    setPaying(undefined); setNotice(`Pagamento da despesa #${expense.id} registrado com sucesso.`)
    refresh(); notifyExpensesChanged()
  }

  const visible = items.filter(item => {
    const matchesStatus = status === 'todas' || (status === 'lembretes' ? item.lembrete_pagamento : item.status === status)
    return matchesStatus && `${item.id} ${item.descricao}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim())
  })
  const reminders = items.filter(item => item.lembrete_pagamento).length
  const disabled = busy || loading || Boolean(loadError)

  return <section className="expenses-page">
    <div className="page-intro"><div><p className="eyebrow">Financeiro</p><h2>Despesas</h2><p>Cadastre as contas da loja e acompanhe vencimentos e pagamentos.</p></div></div>
    {notice && <p className="success-notice" role="status">{notice}</p>}
    {error && <p className="expense-feedback" role="alert">{error}</p>}
    {loadError && <div className="expense-feedback" role="alert"><p>{loadError}</p><button type="button" className="cancel-button" disabled={busy || loading} onClick={refresh}>Tentar novamente</button></div>}
    <section className="sales-form-card">
      <header className="sales-card-header"><h3>{editing ? `Editar despesa #${editing.id}` : 'Nova despesa'}</h3></header>
      <form className="sales-form" ref={form} onSubmit={submit}>
        <fieldset className="expense-fields" disabled={disabled || conflict}>
          <div className="form-field"><label htmlFor="expense-description">Descrição do gasto</label><textarea id="expense-description" required maxLength={5000} placeholder="Ex.: conta de luz da loja" value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></div>
          <div className="sales-form-grid">
            <div className="form-field"><label htmlFor="expense-amount">Valor (R$)</label><input id="expense-amount" required inputMode="numeric" placeholder="0,00" value={draft.amount} onChange={event => setDraft({ ...draft, amount: formatCurrencyInput(event.target.value) })} /></div>
            <div className="form-field"><label htmlFor="expense-due">Data de vencimento</label><input id="expense-due" type="date" required min="2000-01-01" max="9999-12-31" value={draft.due} onChange={event => setDraft({ ...draft, due: event.target.value })} /></div>
          </div>
        </fieldset>
        <p>A conta fica pendente até você registrar o pagamento. O lembrete começa cinco dias antes do vencimento.</p>
        {conflict && <p role="alert">Esta conta mudou. Cancele a edição e confira a versão atualizada na lista.</p>}
        <div className="expense-actions"><button className="submit-button" disabled={disabled || conflict}>{busy ? 'Salvando…' : editing ? 'Salvar alterações' : 'Cadastrar despesa'}</button>{editing && <button className="cancel-button" type="button" disabled={busy} onClick={reset}>Cancelar edição</button>}</div>
      </form>
    </section>
    <section className="sales-list-card">
      <header className="sales-card-header"><h3>Contas da loja</h3><button className="cancel-button" type="button" disabled={busy || loading} onClick={refresh}>{loading ? 'Atualizando…' : 'Atualizar'}</button></header>
      <div className="expense-list">
        {!loading && !loadError && reminders > 0 && <div className="expense-alerts"><div className="expense-heading"><p>{reminders} {reminders === 1 ? 'conta precisa' : 'contas precisam'} de atenção: vencidas ou a vencer em até cinco dias.</p><button type="button" className="cancel-button" onClick={() => setStatus('lembretes')}>Ver lembretes</button></div></div>}
        <div className="sales-form-grid">
          <div className="form-field"><label htmlFor="expense-search">Buscar por descrição ou número</label><input id="expense-search" type="search" value={search} onChange={event => setSearch(event.target.value)} /></div>
          <div className="form-field"><label htmlFor="expense-status">Situação</label><select id="expense-status" value={status} onChange={event => setStatus(event.target.value)}><option value="todas">Todas</option><option value="pendente">Pendentes</option><option value="atrasada">Atrasadas</option><option value="paga">Pagas</option><option value="lembretes">Com lembrete</option></select></div>
        </div>
        {loading && <p role="status">Carregando despesas…</p>}
        {!loading && !loadError && !visible.length && <p>Nenhuma despesa encontrada.</p>}
        {!loading && !loadError && visible.map(item => <article className="expense-item" key={item.id}>
          <div className="expense-heading"><h3>Despesa #{item.id}</h3><span className={`expense-status is-${item.status}`}>{item.status === 'paga' ? 'Paga' : item.status === 'atrasada' ? 'Atrasada' : 'Pendente'}</span></div>
          <p className="expense-description">{item.descricao}</p>
          <dl className="expense-details"><div><dt>Valor</dt><dd>{formatCurrency(item.valor)}</dd></div><div><dt>Vencimento</dt><dd>{formatExpenseDate(item.data_vencimento)}</dd></div><div><dt>Pagamento</dt><dd>{item.data_pagamento ? formatExpenseDate(item.data_pagamento) : 'Ainda não pago'}</dd></div></dl>
          {item.lembrete_pagamento && <p className="expense-due-reminder">{expenseDueLabel(item.dias_para_vencer)}</p>}
          {item.status !== 'paga' && <div className="expense-actions"><button type="button" className="cancel-button" disabled={busy || Boolean(editing)} onClick={() => edit(item)}>Editar</button><button type="button" className="submit-button" disabled={busy || Boolean(editing)} onClick={() => { setError(''); setNotice(''); setPaying(item) }}>Registrar pagamento</button></div>}
        </article>)}
      </div>
    </section>
    {paying && <PayExpenseDialog expense={paying} onClose={() => setPaying(undefined)} onPaid={paid} onConflict={refresh} />}
  </section>
}
