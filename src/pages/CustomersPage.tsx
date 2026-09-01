import { useCallback, useEffect, useState } from 'react'
import { getCustomers } from '../api/customers'
import { ApiError } from '../api/http'
import { CustomerFormModal } from '../components/CustomerFormModal'
import type { Customer } from '../types/customer'
import { formatDocument, formatPhone } from '../utils/formatters'

type LoadState = 'loading' | 'success' | 'error'

function getLoadErrorMessage(requestError: unknown): string {
  return requestError instanceof ApiError
    ? requestError.message
    : 'Não foi possível carregar os clientes. Tente novamente.'
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadCustomers = useCallback(async (signal?: AbortSignal) => {
    try {
      const customerList = await getCustomers(signal)

      if (!signal?.aborted) {
        setCustomers(customerList)
        setLoadState('success')
      }
    } catch (requestError) {
      if (signal?.aborted) {
        return
      }

      setLoadError(getLoadErrorMessage(requestError))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getCustomers(controller.signal)
      .then((customerList) => {
        if (!controller.signal.aborted) {
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

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
  }, [])

  function handleRetry() {
    setLoadState('loading')
    setLoadError(null)
    void loadCustomers()
  }

  const handleCustomerCreated = useCallback((customer: Customer) => {
    setCustomers((currentCustomers) =>
      [...currentCustomers, customer].sort((first, second) =>
        first.nome.localeCompare(second.nome, 'pt-BR'),
      ),
    )
    setLoadState('success')
    setNotice('Cliente cadastrado com sucesso.')
  }, [])

  const customerCountLabel =
    customers.length === 1
      ? '1 cliente cadastrado'
      : `${customers.length} clientes cadastrados`

  return (
    <section className="customers-page">
      <div className="page-intro customers-intro">
        <div>
          <p className="eyebrow">Cadastros</p>
          <h2>Seus clientes</h2>
          <p>Consulte os clientes ou adicione um novo cadastro.</p>
        </div>
        <button
          className="primary-action"
          type="button"
          onClick={() => setIsFormOpen(true)}
        >
          <span aria-hidden="true">+</span>
          Novo cliente
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

      <div className="customers-card">
        <div className="customers-card-header">
          <div>
            <h3>Lista de clientes</h3>
            <p>{loadState === 'success' ? customerCountLabel : 'Carregando dados'}</p>
          </div>
        </div>

        {loadState === 'loading' && (
          <div className="customers-state" aria-live="polite">
            <span className="loading-indicator" aria-hidden="true" />
            <h4>Carregando clientes</h4>
            <p>Aguarde enquanto buscamos os cadastros.</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="customers-state">
            <span className="state-symbol state-symbol-error" aria-hidden="true">
              !
            </span>
            <h4>Não foi possível carregar</h4>
            <p>{loadError}</p>
            <button
              className="retry-button"
              type="button"
              onClick={handleRetry}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loadState === 'success' && customers.length === 0 && (
          <div className="customers-state">
            <span className="state-symbol" aria-hidden="true">
              CL
            </span>
            <h4>Nenhum cliente cadastrado</h4>
            <p>Cadastre o primeiro cliente para criar ordens de serviço.</p>
            <button
              className="retry-button"
              type="button"
              onClick={() => setIsFormOpen(true)}
            >
              Cadastrar cliente
            </button>
          </div>
        )}

        {loadState === 'success' && customers.length > 0 && (
          <div className="customers-table-wrap">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>CPF/CNPJ</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td data-label="Cliente">
                      <div className="customer-identity">
                        <span aria-hidden="true">
                          {customer.nome.charAt(0).toUpperCase()}
                        </span>
                        <strong>{customer.nome}</strong>
                      </div>
                    </td>
                    <td data-label="Telefone">
                      {formatPhone(customer.telefone)}
                    </td>
                    <td className="customer-email" data-label="E-mail">
                      {customer.email}
                    </td>
                    <td data-label="CPF/CNPJ">
                      {formatDocument(customer.documento)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <CustomerFormModal
          onClose={closeForm}
          onCreated={handleCustomerCreated}
        />
      )}
    </section>
  )
}
