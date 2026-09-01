import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { createServiceOrder } from '../api/serviceOrders'
import { ApiError } from '../api/http'
import type { Customer } from '../types/customer'
import type { CreatedServiceOrder } from '../types/serviceOrder'

interface NewServiceOrderModalProps {
  customers: Customer[]
  onClose: () => void
  onCreated: (serviceOrder: CreatedServiceOrder) => void
}

export function NewServiceOrderModal({
  customers,
  onClose,
  onCreated,
}: NewServiceOrderModalProps) {
  const [customerId, setCustomerId] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSubmitting, onClose])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const selectedCustomerId = Number(customerId)
    const serviceDescription = description.trim()

    if (!Number.isInteger(selectedCustomerId) || selectedCustomerId <= 0) {
      setError('Selecione o cliente desta ordem de serviço.')
      return
    }

    if (!serviceDescription) {
      setError('Descreva o serviço que será realizado.')
      return
    }

    setIsSubmitting(true)

    try {
      const serviceOrder = await createServiceOrder({
        cliente_id: selectedCustomerId,
        descricao_servico: serviceDescription,
      })
      onCreated(serviceOrder)
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível criar a ordem. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className="customer-modal service-order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-order-modal-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Nova solicitação</p>
            <h2 id="new-order-modal-title">Nova ordem de serviço</h2>
          </div>
          <button
            className="modal-close"
            type="button"
            aria-label="Fechar formulário"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form className="service-order-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="service-order-customer">Cliente</label>
            <select
              id="service-order-customer"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              disabled={isSubmitting}
              required
              autoFocus
            >
              <option value="">Selecione um cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="service-order-description">Descrição do serviço</label>
            <textarea
              id="service-order-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva o que precisa ser feito"
              rows={5}
              disabled={isSubmitting}
              required
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button
              className="cancel-button"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              className="submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando ordem...' : 'Criar ordem'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
