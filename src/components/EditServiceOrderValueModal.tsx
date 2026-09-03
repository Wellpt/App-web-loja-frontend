import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { ApiError } from '../api/http'
import { updateServiceOrderValue } from '../api/serviceOrders'
import type { ServiceOrder } from '../types/serviceOrder'
import {
  currencyInputToNumber,
  formatCurrencyInput,
} from '../utils/formatters'

interface EditServiceOrderValueModalProps {
  serviceOrder: ServiceOrder
  onClose: () => void
  onUpdated: (serviceOrder: ServiceOrder) => void
}

function getInitialAmount(value: number | null): string {
  return value === null
    ? ''
    : formatCurrencyInput(String(Math.round(value * 100)))
}

export function EditServiceOrderValueModal({
  serviceOrder,
  onClose,
  onUpdated,
}: EditServiceOrderValueModalProps) {
  const [amount, setAmount] = useState(getInitialAmount(serviceOrder.valor))
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

    const numericAmount = currencyInputToNumber(amount)

    if (numericAmount <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }

    if (
      serviceOrder.valor !== null &&
      Math.round(numericAmount * 100) ===
        Math.round(serviceOrder.valor * 100)
    ) {
      setError('Altere o valor antes de salvar.')
      return
    }

    setIsSubmitting(true)

    try {
      const updatedOrder = await updateServiceOrderValue(serviceOrder.id, {
        valor: numericAmount,
      })
      onUpdated(updatedOrder)
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível alterar o valor. Tente novamente.',
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
        aria-labelledby="edit-order-value-modal-title"
        aria-describedby="edit-order-value-help"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Valor do serviço</p>
            <h2 id="edit-order-value-modal-title">
              Alterar valor da ordem #{serviceOrder.id}
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
        </div>

        <p className="irreversible-warning" id="edit-order-value-help">
          O valor pode ser alterado somente enquanto a ordem estiver aberta.
          Após a conclusão, ele será definitivo.
        </p>

        <form className="service-order-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="edit-service-order-amount">Valor cobrado</label>
            <div className="currency-field">
              <span aria-hidden="true">R$</span>
              <input
                id="edit-service-order-amount"
                value={amount}
                onChange={(event) =>
                  setAmount(formatCurrencyInput(event.target.value))
                }
                placeholder="0,00"
                inputMode="numeric"
                disabled={isSubmitting}
                required
                autoFocus
              />
            </div>
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
              {isSubmitting ? 'Salvando...' : 'Salvar valor'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
