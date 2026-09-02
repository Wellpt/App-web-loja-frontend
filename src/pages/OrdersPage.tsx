import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomers } from '../api/customers'
import { ApiError } from '../api/http'
import { getServiceOrders } from '../api/serviceOrders'
import { CompleteServiceOrderModal } from '../components/CompleteServiceOrderModal'
import { NewServiceOrderModal } from '../components/NewServiceOrderModal'
import type { Customer } from '../types/customer'
import type {
  CompletedServiceOrder,
  CreatedServiceOrder,
  ServiceOrder,
  ServiceOrderStatus,
} from '../types/serviceOrder'
import { formatCurrency, formatDateTime } from '../utils/formatters'

type LoadState = 'loading' | 'success' | 'error'
type OrderTab = 'aberta' | 'concluida'

function getLoadErrorMessage(requestError: unknown): string {
  return requestError instanceof ApiError
    ? requestError.message
    : 'Não foi possível carregar as ordens de serviço. Tente novamente.'
}

function getStatusLabel(status: ServiceOrderStatus): string {
  return status === 'aberta' ? 'Aberta' : 'Concluída'
}

export function OrdersPage() {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<OrderTab>('aberta')
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [orderToComplete, setOrderToComplete] =
    useState<ServiceOrder | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [orderList, customerList] = await Promise.all([
        getServiceOrders(),
        getCustomers(),
      ])
      setServiceOrders(orderList)
      setCustomers(customerList)
      setLoadState('success')
    } catch (requestError) {
      setLoadError(getLoadErrorMessage(requestError))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getServiceOrders(controller.signal),
      getCustomers(controller.signal),
    ])
      .then(([orderList, customerList]) => {
        if (!controller.signal.aborted) {
          setServiceOrders(orderList)
          setCustomers(customerList)
          setLoadState('success')
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(getLoadErrorMessage(requestError))
          setLoadState('error')
        }
      })

    return () => controller.abort()
  }, [])

  function handleRetry() {
    setLoadState('loading')
    setLoadError(null)
    void loadData()
  }

  const closeNewOrder = useCallback(() => {
    setIsNewOrderOpen(false)
  }, [])

  const closeCompletion = useCallback(() => {
    setOrderToComplete(null)
  }, [])

  const handleOrderCreated = useCallback(
    (createdOrder: CreatedServiceOrder) => {
      const customer = customers.find(
        (item) => item.id === createdOrder.cliente_id,
      )

      const newOrder: ServiceOrder = {
        id: createdOrder.id,
        cliente: {
          id: createdOrder.cliente_id,
          nome: customer?.nome ?? 'Cliente #' + createdOrder.cliente_id,
        },
        descricao_servico: createdOrder.descricao_servico,
        status: createdOrder.status,
        valor: null,
        forma_pagamento: null,
        criada_em: createdOrder.criada_em,
        concluida_em: null,
      }

      setServiceOrders((currentOrders) => [newOrder, ...currentOrders])
      setActiveTab('aberta')
      setNotice('Ordem #' + createdOrder.id + ' criada com sucesso.')
    },
    [customers],
  )

  const handleOrderCompleted = useCallback(
    (completedOrder: CompletedServiceOrder) => {
      setServiceOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === completedOrder.id
            ? {
                ...order,
                descricao_servico: completedOrder.descricao_servico,
                status: completedOrder.status,
                valor: completedOrder.valor,
                forma_pagamento: completedOrder.forma_pagamento,
                criada_em: completedOrder.criada_em,
                concluida_em: completedOrder.concluida_em,
              }
            : order,
        ),
      )
      setActiveTab('concluida')
      setNotice('Ordem #' + completedOrder.id + ' concluída com sucesso.')
    },
    [],
  )

  const openOrders = serviceOrders.filter((order) => order.status === 'aberta')
  const completedOrders = serviceOrders.filter(
    (order) => order.status === 'concluida',
  )
  const displayedOrders =
    activeTab === 'aberta' ? openOrders : completedOrders

  const tabEmptyTitle =
    activeTab === 'aberta'
      ? 'Nenhuma ordem aberta'
      : 'Nenhuma ordem concluída'
  const tabEmptyMessage =
    activeTab === 'aberta'
      ? 'Crie uma ordem para registrar o próximo serviço.'
      : 'As ordens finalizadas aparecerão aqui com os dados do pagamento.'

  return (
    <section className="orders-page">
      <div className="page-intro customers-intro">
        <div>
          <p className="eyebrow">Atendimentos</p>
          <h2>Ordens de serviço</h2>
          <p>Acompanhe os serviços em aberto e registre seus recebimentos.</p>
        </div>
        <button
          className="primary-action"
          type="button"
          onClick={() => setIsNewOrderOpen(true)}
          disabled={loadState !== 'success' || customers.length === 0}
          title={
            loadState === 'success' && customers.length === 0
              ? 'Cadastre um cliente antes de criar uma ordem'
              : undefined
          }
        >
          <span aria-hidden="true">+</span>
          Nova ordem
        </button>
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

      {loadState === 'success' && customers.length === 0 && (
        <div className="customer-required-notice">
          <div>
            <strong>Cadastre um cliente para começar</strong>
            <span>
              Toda ordem de serviço precisa estar vinculada a um cliente.
            </span>
          </div>
          <Link to="/clientes">Ir para clientes</Link>
        </div>
      )}

      <div className="orders-card">
        <div className="orders-card-header">
          <div>
            <h3>Histórico de ordens</h3>
            <p>
              {loadState === 'success'
                ? serviceOrders.length +
                  ' ' +
                  (serviceOrders.length === 1
                    ? 'ordem registrada'
                    : 'ordens registradas')
                : 'Carregando dados'}
            </p>
          </div>

          {loadState === 'success' && (
            <div className="order-tabs" role="tablist" aria-label="Status da ordem">
              <button
                className={activeTab === 'aberta' ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={activeTab === 'aberta'}
                onClick={() => setActiveTab('aberta')}
              >
                Abertas <span>{openOrders.length}</span>
              </button>
              <button
                className={activeTab === 'concluida' ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={activeTab === 'concluida'}
                onClick={() => setActiveTab('concluida')}
              >
                Concluídas <span>{completedOrders.length}</span>
              </button>
            </div>
          )}
        </div>

        {loadState === 'loading' && (
          <div className="customers-state" aria-live="polite">
            <span className="loading-indicator" aria-hidden="true" />
            <h4>Carregando ordens</h4>
            <p>Aguarde enquanto buscamos os atendimentos.</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="customers-state">
            <span className="state-symbol state-symbol-error" aria-hidden="true">
              !
            </span>
            <h4>Não foi possível carregar</h4>
            <p>{loadError}</p>
            <button className="retry-button" type="button" onClick={handleRetry}>
              Tentar novamente
            </button>
          </div>
        )}

        {loadState === 'success' && displayedOrders.length === 0 && (
          <div className="customers-state">
            <span className="state-symbol order-state-symbol" aria-hidden="true">
              OS
            </span>
            <h4>{tabEmptyTitle}</h4>
            <p>{tabEmptyMessage}</p>
            {activeTab === 'aberta' && customers.length > 0 && (
              <button
                className="retry-button"
                type="button"
                onClick={() => setIsNewOrderOpen(true)}
              >
                Criar ordem
              </button>
            )}
          </div>
        )}

        {loadState === 'success' && displayedOrders.length > 0 && (
          <div className="orders-table-wrap" role="tabpanel">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Cliente e serviço</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Recebimento</th>
                  <th>
                    <span className="visually-hidden">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Ordem">
                      <strong className="order-number">#{order.id}</strong>
                    </td>
                    <td data-label="Cliente e serviço">
                      <div className="order-description">
                        <strong>{order.cliente.nome}</strong>
                        <span>{order.descricao_servico}</span>
                      </div>
                    </td>
                    <td data-label="Data">
                      <div className="order-date">
                        <div className="order-date-entry">
                          <span>Aberta em</span>
                          <strong>{formatDateTime(order.criada_em)}</strong>
                        </div>
                        {order.status === 'concluida' && order.concluida_em && (
                          <div className="order-date-entry is-completed">
                            <span>Concluída em</span>
                            <strong>
                              {formatDateTime(order.concluida_em)}
                            </strong>
                          </div>
                        )}
                      </div>
                    </td>
                    <td data-label="Status">
                      <span
                        className={'status-badge status-' + order.status}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td data-label="Recebimento">
                      {order.status === 'concluida' &&
                      order.valor !== null &&
                      order.forma_pagamento ? (
                        <div className="order-payment">
                          <strong>{formatCurrency(order.valor)}</strong>
                          <span>{order.forma_pagamento}</span>
                        </div>
                      ) : (
                        <span className="pending-payment">Pendente</span>
                      )}
                    </td>
                    <td className="order-action-cell">
                      {order.status === 'aberta' && (
                        <button
                          className="complete-order-button"
                          type="button"
                          onClick={() => setOrderToComplete(order)}
                        >
                          Concluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isNewOrderOpen && (
        <NewServiceOrderModal
          customers={customers}
          onClose={closeNewOrder}
          onCreated={handleOrderCreated}
        />
      )}

      {orderToComplete && (
        <CompleteServiceOrderModal
          serviceOrder={orderToComplete}
          onClose={closeCompletion}
          onCompleted={handleOrderCompleted}
        />
      )}
    </section>
  )
}
