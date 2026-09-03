import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { ApiError } from '../api/http'
import { completeServiceOrder } from '../api/serviceOrders'
import type { ServiceOrder } from '../types/serviceOrder'
import { formatCurrency } from '../utils/formatters'

interface CompleteServiceOrderModalProps {
  serviceOrder: ServiceOrder
  onClose: () => void
  onCompleted: (serviceOrder: ServiceOrder) => void
}

export function CompleteServiceOrderModal({
  serviceOrder,
  onClose,
  onCompleted,
}: CompleteServiceOrderModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
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

    const trimmedPaymentMethod = paymentMethod.trim()

    if (!trimmedPaymentMethod) {
      setError('Informe a forma de pagamento.')
      return
    }

    if (!isConfirmed) {
      setError('Confirme que deseja concluir esta ordem.')
      return
    }

    setIsSubmitting(true)

    try {
      const completedOrder = await completeServiceOrder(serviceOrder.id, {
        forma_pagamento: trimmedPaymentMethod,
      })
      onCompleted(completedOrder)
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível concluir a ordem. Tente novamente.',
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
        aria-labelledby="complete-order-modal-title"
        aria-describedby="complete-order-warning"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Finalizar atendimento</p>
            <h2 id="complete-order-modal-title">
              Concluir ordem #{serviceOrder.id}
            </h2>
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

        <div className="order-summary">
          <span>{serviceOrder.cliente.nome}</span>
          <p>{serviceOrder.descricao_servico}</p>
          <strong className="order-summary-amount">
            {serviceOrder.valor === null
              ? 'Valor não informado'
              : 'Valor cobrado: ' + formatCurrency(serviceOrder.valor)}
          </strong>
        </div>

        <p className="irreversible-warning" id="complete-order-warning">
          Esta ação é definitiva. A ordem não poderá voltar ao status aberta.
        </p>

        <form className="service-order-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="service-order-payment">Forma de pagamento</label>
            <input
              id="service-order-payment"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              placeholder="Ex.: Pix, dinheiro ou cartão"
              list="payment-method-suggestions"
              maxLength={50}
              autoComplete="off"
              disabled={isSubmitting}
              required
              autoFocus
            />
            <datalist id="payment-method-suggestions">
              <option value="Pix" />
              <option value="Dinheiro" />
              <option value="Cartão de crédito" />
              <option value="Cartão de débito" />
              <option value="Transferência bancária" />
            </datalist>
          </div>

          <label className="confirmation-field">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(event) => setIsConfirmed(event.target.checked)}
              disabled={isSubmitting}
              required
            />
            <span>
              Confirmo o recebimento do valor informado e desejo concluir esta
              ordem.
            </span>
          </label>

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
              Voltar
            </button>
            <button
              className="submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Concluindo...' : 'Concluir ordem'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
