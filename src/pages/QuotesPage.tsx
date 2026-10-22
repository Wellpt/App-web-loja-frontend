import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { printWhenReady } from '../utils/printWhenReady'
import { getCustomers } from '../api/customers'
import { ApiError } from '../api/http'
import { convertQuote, getQuotes, saveQuote } from '../api/quotes'
import { QuotePrint } from '../components/QuotePrint'
import type { Customer } from '../types/customer'
import type { Quote } from '../types/quote'
import { currencyInputToNumber, formatCurrency, formatCurrencyInput, formatDateTime } from '../utils/formatters'
import '../styles/quotes.css'

const emptyDraft = { customer: '', description: '', amount: '', materials: '' }
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível concluir a operação.'

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const requestInProgress = useRef(false)
  const [editing, setEditing] = useState<Quote>()
  const [conflict, setConflict] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [printing, setPrinting] = useState<Quote>()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getQuotes(controller.signal), getCustomers(controller.signal)])
      .then(([items, clients]) => {
        if (!controller.signal.aborted) { setQuotes(items); setCustomers(clients) }
      })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setLoadError(errorMessage(cause)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload])

  useEffect(() => {
    if (!printing) return
    const clear = () => setPrinting(undefined)
    window.addEventListener('afterprint', clear)
    const cancelPrint = printWhenReady()
    return () => { cancelPrint(); window.removeEventListener('afterprint', clear) }
  }, [printing])

  function refresh() {
    setLoading(true)
    setLoadError('')
    setReload(value => value + 1)
  }

  function resetForm() {
    setEditing(undefined); setDraft(emptyDraft); setError(''); setConflict(false)
  }

  function edit(quote: Quote) {
    setEditing(quote)
    setDraft({ customer: String(quote.cliente.id), description: quote.descricao_servico,
      amount: formatCurrencyInput(quote.valor.toFixed(2)), materials: formatCurrencyInput(quote.custo_materiais.toFixed(2)) })
    setError(''); setNotice(''); setConflict(false)
    formRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    formRef.current?.querySelector<HTMLSelectElement>('select')?.focus({ preventScroll: true })
  }

  function replaceQuote(quote: Quote) {
    setQuotes(items => [quote, ...items.filter(item => item.id !== quote.id)].sort((a, b) => b.id - a.id))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (requestInProgress.current || conflict) return
    setError(''); setNotice('')
    const input = { cliente_id: Number(draft.customer), descricao_servico: draft.description.trim(),
      valor: currencyInputToNumber(draft.amount), custo_materiais: currencyInputToNumber(draft.materials) }
    if (!input.cliente_id || !input.descricao_servico || input.valor <= 0) {
      setError('Selecione um cliente, descreva o serviço e informe um valor maior que zero.'); return
    }
    if (input.custo_materiais > input.valor) {
      setError('O custo dos materiais não pode ser maior que o valor do orçamento.'); return
    }
    requestInProgress.current = true; setBusy(true)
    try {
      const saved = await saveQuote(input, editing)
      replaceQuote(saved); resetForm()
      setNotice(`Orçamento #${saved.id} ${editing ? 'atualizado' : 'cadastrado'} com sucesso.`)
    } catch (cause) {
      setError(errorMessage(cause))
      if (cause instanceof ApiError && cause.status === 409) {
        setConflict(true); refresh()
      }
    } finally { requestInProgress.current = false; setBusy(false) }
  }

  async function convert(quote: Quote) {
    if (requestInProgress.current) return
    if (!window.confirm(`Converter o orçamento #${quote.id} de ${quote.cliente.nome}, no valor de ${formatCurrency(quote.valor)}, em uma OS aberta? Após a conversão, o orçamento não poderá ser editado.`)) return
    requestInProgress.current = true; setBusy(true); setError(''); setNotice('')
    try {
      const converted = await convertQuote(quote)
      replaceQuote(converted)
      setNotice(`Orçamento #${quote.id} convertido na OS #${converted.ordem_servico_id}. Consulte Ordens de serviço para continuar o atendimento.`)
    } catch (cause) {
      setError(errorMessage(cause))
      if (cause instanceof ApiError && cause.status === 409) {
        setNotice('A lista será atualizada. Confira o orçamento antes de tentar converter novamente.')
        refresh()
      }
    } finally { requestInProgress.current = false; setBusy(false) }
  }

  const visibleQuotes = quotes.filter(quote => (status === 'todos' || quote.status === status) &&
    `${quote.id} ${quote.cliente.nome} ${quote.descricao_servico}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim()))
  const unavailable = busy || loading || Boolean(loadError)

  return (
    <div className="quotes-page">
      <section className="page-intro"><div><p className="eyebrow">Orçamentos</p><h2>Prepare o próximo atendimento</h2><p>Cadastre, imprima e converta em ordem de serviço quando o cliente aprovar.</p></div></section>
      {notice && <p className="success-notice" role="status">{notice}</p>}
      {error && <p className="quotes-error" role="alert">{error}</p>}
      {loadError && <div className="quotes-error" role="alert"><p>{loadError}</p><button className="cancel-button" disabled={busy} onClick={refresh}>Tentar novamente</button></div>}
      <section className="sales-form-card">
        <header className="sales-card-header"><h3>{editing ? `Editar orçamento #${editing.id}` : 'Novo orçamento'}</h3></header>
        <form className="sales-form" onSubmit={submit} ref={formRef}>
          <fieldset className="quotes-fields" disabled={unavailable || conflict}>
            <div className="form-field"><label htmlFor="quote-customer">Cliente</label><select id="quote-customer" required value={draft.customer} onChange={event => setDraft({ ...draft, customer: event.target.value })}><option value="">Selecione um cliente</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.nome}</option>)}</select></div>
            {!loading && !loadError && customers.length === 0 && <p>Cadastre um cliente em <Link to="/clientes">Clientes</Link> para criar o orçamento.</p>}
            <div className="form-field"><label htmlFor="quote-description">Descrição do serviço</label><textarea id="quote-description" required maxLength={5000} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></div>
            <div className="sales-form-grid">
              <div className="form-field"><label htmlFor="quote-amount">Valor do orçamento (R$)</label><input id="quote-amount" inputMode="numeric" placeholder="0,00" required value={draft.amount} onChange={event => setDraft({ ...draft, amount: formatCurrencyInput(event.target.value) })} /></div>
              <div className="form-field"><label htmlFor="quote-materials">Custo dos materiais (R$)</label><input id="quote-materials" inputMode="numeric" placeholder="0,00" value={draft.materials} onChange={event => setDraft({ ...draft, materials: formatCurrencyInput(event.target.value) })} /><small>Opcional. Informação interna, não aparece na impressão.</small></div>
            </div>
          </fieldset>
          {conflict && <p role="alert">Os dados deste orçamento mudaram. Cancele esta edição e abra novamente o orçamento atualizado na lista.</p>}
          <div className="quotes-actions"><button className="submit-button" disabled={unavailable || conflict || customers.length === 0}>{busy ? 'Aguarde…' : editing ? 'Salvar alterações' : 'Cadastrar orçamento'}</button>{editing && <button className="cancel-button" type="button" disabled={busy} onClick={resetForm}>Cancelar edição</button>}</div>
        </form>
      </section>
      <section className="sales-list-card">
        <header className="sales-card-header"><h3>Orçamentos cadastrados</h3><button className="cancel-button" disabled={busy || loading} onClick={refresh}>Atualizar</button></header>
        <div className="quotes-list">
          <div className="sales-form-grid">
            <div className="form-field"><label htmlFor="quote-search">Buscar por número, cliente ou serviço</label><input id="quote-search" type="search" value={search} onChange={event => setSearch(event.target.value)} /></div>
            <div className="form-field"><label htmlFor="quote-status">Situação</label><select id="quote-status" value={status} onChange={event => setStatus(event.target.value)}><option value="todos">Todos</option><option value="pendente">Pendentes</option><option value="convertido">Convertidos em OS</option></select></div>
          </div>
          {loading ? <p role="status">Carregando orçamentos…</p> : !loadError && visibleQuotes.length === 0 ? <p>Nenhum orçamento encontrado.</p> : null}
          {!loading && !loadError && visibleQuotes.map(quote => <article className="quote-item" key={quote.id}>
            <div className="quote-item-heading"><h3>#{quote.id} — {quote.cliente.nome}</h3><span className="quote-status">{quote.status === 'pendente' ? 'Pendente' : `Convertido • OS #${quote.ordem_servico_id}`}</span></div>
            <p className="quote-description">{quote.descricao_servico}</p>
            <dl className="quote-details"><div><dt>Valor</dt><dd>{formatCurrency(quote.valor)}</dd></div><div><dt>Custo dos materiais</dt><dd>{formatCurrency(quote.custo_materiais)}</dd></div><div><dt>Criado em</dt><dd>{formatDateTime(quote.criado_em)}</dd></div></dl>
            <div className="quotes-actions">
              <button className="cancel-button" disabled={busy} onClick={() => setPrinting(quote)}>Imprimir</button>
              {quote.status === 'pendente' && <><button className="cancel-button" disabled={busy || Boolean(editing)} onClick={() => edit(quote)}>Editar</button><button className="submit-button" disabled={busy || Boolean(editing)} onClick={() => void convert(quote)}>Converter em OS</button></>}
              {quote.ordem_servico_id && <Link className="cancel-button" to="/ordens">Consultar ordens de serviço</Link>}
            </div>
          </article>)}
        </div>
      </section>
      {printing && <QuotePrint quote={printing} customer={customers.find(customer => customer.id === printing.cliente.id)} />}
    </div>
  )
}
