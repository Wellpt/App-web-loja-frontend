import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { getCustomers } from '../api/customers'
import { ApiError } from '../api/http'
import { createSale, getSales } from '../api/sales'
import type { Customer } from '../types/customer'
import type { CreateSaleItemInput, Sale } from '../types/sale'
import {
  currencyInputToNumber,
  formatCurrency,
  formatCurrencyInput,
  formatDateTime,
} from '../utils/formatters'

type LoadState = 'loading' | 'success' | 'error'

interface SaleItemDraft {
  key: number
  description: string
  quantity: string
  unitAmount: string
}

function createEmptyItem(key: number): SaleItemDraft {
  return {
    key,
    description: '',
    quantity: '1',
    unitAmount: '',
  }
}

function getListErrorMessage(requestError: unknown): string {
  return requestError instanceof ApiError
    ? requestError.message
    : 'Não foi possível carregar as vendas. Tente novamente.'
}

function getSaleCountLabel(count: number): string {
  return count === 1 ? '1 venda registrada' : count + ' vendas registradas'
}

function getItemCountLabel(count: number): string {
  return count === 1 ? '1 item' : count + ' itens'
}

function getDraftSubtotal(item: SaleItemDraft): number {
  const quantity = Number(item.quantity)
  const unitAmount = currencyInputToNumber(item.unitAmount)

  return Number.isFinite(quantity) && quantity > 0
    ? quantity * unitAmount
    : 0
}

export function SalesPage() {
  const nextItemKey = useRef(1)
  const [customerId, setCustomerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [items, setItems] = useState<SaleItemDraft[]>([
    createEmptyItem(0),
  ])
  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [listError, setListError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [saleList, customerList] = await Promise.all([
        getSales(),
        getCustomers(),
      ])
      setSales(saleList)
      setCustomers(customerList)
      setListError(null)
      setLoadState('success')
    } catch (requestError) {
      setListError(getListErrorMessage(requestError))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getSales(controller.signal),
      getCustomers(controller.signal),
    ])
      .then(([saleList, customerList]) => {
        if (!controller.signal.aborted) {
          setSales(saleList)
          setCustomers(customerList)
          setLoadState('success')
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setListError(getListErrorMessage(requestError))
          setLoadState('error')
        }
      })

    return () => controller.abort()
  }, [])

  function handleRetry() {
    setLoadState('loading')
    setListError(null)
    void loadData()
  }

  function updateItem(
    itemKey: number,
    field: 'description' | 'quantity' | 'unitAmount',
    value: string,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === itemKey ? { ...item, [field]: value } : item,
      ),
    )
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      createEmptyItem(nextItemKey.current++),
    ])
  }

  function removeItem(itemKey: number) {
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((item) => item.key !== itemKey),
    )
  }

  function resetForm() {
    setCustomerId('')
    setPaymentMethod('')
    setItems([createEmptyItem(nextItemKey.current++)])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setNotice(null)

    const selectedCustomerId = customerId ? Number(customerId) : null

    if (
      selectedCustomerId !== null &&
      (!Number.isInteger(selectedCustomerId) || selectedCustomerId <= 0)
    ) {
      setFormError('Selecione um cliente válido ou deixe a venda sem cliente.')
      return
    }

    if (items.length === 0) {
      setFormError('Adicione pelo menos um item à venda.')
      return
    }

    const normalizedItems: CreateSaleItemInput[] = items.map((item) => ({
      descricao: item.description.trim(),
      quantidade: Number(item.quantity),
      valor_unitario: currencyInputToNumber(item.unitAmount),
    }))

    const invalidDescriptionIndex = normalizedItems.findIndex(
      (item) => !item.descricao,
    )

    if (invalidDescriptionIndex >= 0) {
      setFormError(
        'Informe a descrição do item ' + (invalidDescriptionIndex + 1) + '.',
      )
      return
    }

    const invalidQuantityIndex = normalizedItems.findIndex(
      (item) => !Number.isInteger(item.quantidade) || item.quantidade <= 0,
    )

    if (invalidQuantityIndex >= 0) {
      setFormError(
        'Informe uma quantidade inteira maior que zero no item ' +
          (invalidQuantityIndex + 1) +
          '.',
      )
      return
    }

    const invalidAmountIndex = normalizedItems.findIndex(
      (item) => item.valor_unitario <= 0,
    )

    if (invalidAmountIndex >= 0) {
      setFormError(
        'Informe um valor unitário maior que zero no item ' +
          (invalidAmountIndex + 1) +
          '.',
      )
      return
    }

    const normalizedPaymentMethod = paymentMethod.trim()

    if (!normalizedPaymentMethod) {
      setFormError('Informe a forma de pagamento.')
      return
    }

    setIsSubmitting(true)

    try {
      const createdSale = await createSale({
        cliente_id: selectedCustomerId,
        itens: normalizedItems,
        forma_pagamento: normalizedPaymentMethod,
      })
      setSales((currentSales) => [createdSale, ...currentSales])
      setNotice('Venda #' + createdSale.id + ' registrada com sucesso.')
      resetForm()
    } catch (requestError) {
      setFormError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível registrar a venda. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(customerId),
  )
  const estimatedTotal = items.reduce(
    (total, item) => total + getDraftSubtotal(item),
    0,
  )
  const saleCountLabel = getSaleCountLabel(sales.length)

  return (
    <section className="sales-page">
      <div className="page-intro sales-intro">
        <div>
          <p className="eyebrow">Atendimento comercial</p>
          <h2>Vendas</h2>
          <p>Registre produtos vendidos e acompanhe o histórico da loja.</p>
        </div>
        <span className="sales-page-badge">Venda concluída no cadastro</span>
      </div>

      {notice && (
        <div className="success-notice" role="status">
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="sales-create-layout">
        <section className="sales-form-card">
          <div className="sales-card-header">
            <div>
              <h3>Nova venda</h3>
              <p>Adicione os itens e confirme a forma de pagamento.</p>
            </div>
          </div>

          <form className="sales-form" onSubmit={handleSubmit}>
            <div className="sales-form-grid">
              <div className="form-field">
                <label htmlFor="sale-customer">Cliente</label>
                <select
                  id="sale-customer"
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                >
                  <option value="">Venda sem cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.nome}
                    </option>
                  ))}
                </select>
                <span className="field-help">
                  A identificação do cliente é opcional.
                </span>
              </div>

              <div className="form-field">
                <label htmlFor="sale-payment">Forma de pagamento</label>
                <input
                  id="sale-payment"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  placeholder="Ex.: Pix, dinheiro ou cartão"
                  list="sale-payment-method-suggestions"
                  autoComplete="off"
                  disabled={isSubmitting}
                  required
                />
                <datalist id="sale-payment-method-suggestions">
                  <option value="Pix" />
                  <option value="Dinheiro" />
                  <option value="Cartão de crédito" />
                  <option value="Cartão de débito" />
                  <option value="Transferência bancária" />
                </datalist>
              </div>
            </div>

            <section className="sale-items-section">
              <div className="sale-items-header">
                <div>
                  <h4>Itens da venda</h4>
                  <p>O total definitivo será calculado pelo sistema.</p>
                </div>
                <button
                  className="add-sale-item-button"
                  type="button"
                  onClick={addItem}
                  disabled={isSubmitting}
                >
                  <span aria-hidden="true">+</span>
                  Adicionar item
                </button>
              </div>

              <div className="sale-items-list">
                {items.map((item, index) => (
                  <article className="sale-item-card" key={item.key}>
                    <div className="sale-item-heading">
                      <strong>Item {String(index + 1).padStart(2, '0')}</strong>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        disabled={isSubmitting || items.length === 1}
                        aria-label={'Remover item ' + (index + 1)}
                      >
                        Remover
                      </button>
                    </div>

                    <div className="sale-item-grid">
                      <div className="form-field sale-item-description">
                        <label htmlFor={'sale-item-description-' + item.key}>
                          Descrição
                        </label>
                        <input
                          id={'sale-item-description-' + item.key}
                          value={item.description}
                          onChange={(event) =>
                            updateItem(
                              item.key,
                              'description',
                              event.target.value,
                            )
                          }
                          placeholder="Produto vendido"
                          disabled={isSubmitting}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor={'sale-item-quantity-' + item.key}>
                          Quantidade
                        </label>
                        <input
                          id={'sale-item-quantity-' + item.key}
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(
                              item.key,
                              'quantity',
                              event.target.value,
                            )
                          }
                          disabled={isSubmitting}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor={'sale-item-amount-' + item.key}>
                          Valor unitário
                        </label>
                        <div className="currency-field">
                          <span aria-hidden="true">R$</span>
                          <input
                            id={'sale-item-amount-' + item.key}
                            value={item.unitAmount}
                            onChange={(event) =>
                              updateItem(
                                item.key,
                                'unitAmount',
                                formatCurrencyInput(event.target.value),
                              )
                            }
                            placeholder="0,00"
                            inputMode="numeric"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>

                      <div className="sale-item-subtotal">
                        <span>Subtotal</span>
                        <strong>{formatCurrency(getDraftSubtotal(item))}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="sales-form-actions">
              <button
                className="submit-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando venda...' : 'Registrar venda'}
              </button>
            </div>
          </form>
        </section>

        <aside className="sale-summary-card">
          <span className="sale-summary-index" aria-hidden="true">
            VD
          </span>
          <p className="eyebrow">Resumo da nova venda</p>
          <h3>Total em preenchimento</h3>
          <strong className="sale-summary-total">
            {formatCurrency(estimatedTotal)}
          </strong>
          <dl>
            <div>
              <dt>Cliente</dt>
              <dd>{selectedCustomer?.nome ?? 'Não identificado'}</dd>
            </div>
            <div>
              <dt>Itens</dt>
              <dd>{getItemCountLabel(items.length)}</dd>
            </div>
            <div>
              <dt>Pagamento</dt>
              <dd>{paymentMethod.trim() || 'Não informado'}</dd>
            </div>
          </dl>
          <p className="sale-summary-note">
            A venda será registrada como concluída e não poderá ser editada ou
            excluída.
          </p>
        </aside>
      </div>

      <section className="sales-list-card">
        <div className="sales-list-header">
          <div>
            <h3>Histórico de vendas</h3>
            <p>
              {loadState === 'success' ? saleCountLabel : 'Carregando dados'}
            </p>
          </div>
        </div>

        {loadState === 'loading' && (
          <div className="customers-state" aria-live="polite">
            <span className="loading-indicator" aria-hidden="true" />
            <h4>Carregando vendas</h4>
            <p>Aguarde enquanto buscamos os registros da loja.</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="customers-state">
            <span className="state-symbol state-symbol-error" aria-hidden="true">
              !
            </span>
            <h4>Não foi possível carregar</h4>
            <p>{listError}</p>
            <button className="retry-button" type="button" onClick={handleRetry}>
              Tentar novamente
            </button>
          </div>
        )}

        {loadState === 'success' && sales.length === 0 && (
          <div className="customers-state">
            <span className="state-symbol" aria-hidden="true">
              VD
            </span>
            <h4>Nenhuma venda registrada</h4>
            <p>Utilize o formulário acima para registrar a primeira venda.</p>
          </div>
        )}

        {loadState === 'success' && sales.length > 0 && (
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Venda</th>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Recebimento</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td data-label="Venda">
                      <div className="sale-history-identity">
                        <strong>#{sale.id}</strong>
                        <span>{formatDateTime(sale.realizada_em)}</span>
                      </div>
                    </td>
                    <td data-label="Cliente">
                      <span className="sale-customer-name">
                        {sale.cliente?.nome ?? 'Não identificado'}
                      </span>
                    </td>
                    <td data-label="Itens">
                      <ul className="sale-history-items">
                        {sale.itens.map((item) => (
                          <li key={item.id}>
                            <span>{item.descricao}</span>
                            <small>
                              {item.quantidade} ×{' '}
                              {formatCurrency(item.valor_unitario)} ={' '}
                              {formatCurrency(item.subtotal)}
                            </small>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td data-label="Recebimento">
                      <div className="sale-payment-details">
                        <strong>{sale.forma_pagamento}</strong>
                        <span>Por {sale.funcionario.nome}</span>
                      </div>
                    </td>
                    <td data-label="Total">
                      <div className="sale-total-details">
                        <strong>{formatCurrency(sale.valor_total)}</strong>
                        <span>Concluída</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
