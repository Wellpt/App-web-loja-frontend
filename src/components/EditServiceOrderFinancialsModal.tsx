import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { ApiError } from '../api/http'
import { updateServiceOrderFinancials } from '../api/serviceOrders'
import type {
  ServiceOrder,
  UpdateServiceOrderFinancialsInput,
} from '../types/serviceOrder'
import {
  currencyInputToNumber,
  formatCurrency,
  formatCurrencyInput,
} from '../utils/formatters'

interface EditServiceOrderFinancialsModalProps {
  serviceOrder: ServiceOrder
  onClose: () => void
  onUpdated: (serviceOrder: ServiceOrder) => void
}

function getInitialAmount(value: number | null | undefined): string {
  return value == null
    ? ''
    : formatCurrencyInput(String(Math.round(value * 100)))
}

function valuesMatch(first: number, second: number): boolean {
  return Math.round(first * 100) === Math.round(second * 100)
}

export function EditServiceOrderFinancialsModal({
  serviceOrder,
  onClose,
  onUpdated,
}: EditServiceOrderFinancialsModalProps) {
  const [amount, setAmount] = useState(getInitialAmount(serviceOrder.valor))
  const [materialCost, setMaterialCost] = useState(
    getInitialAmount(serviceOrder.custo_materiais),
  )
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
    const numericMaterialCost = currencyInputToNumber(materialCost)

    if (numericAmount <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }

    if (numericMaterialCost < 0) {
      setError('O custo dos materiais não pode ser negativo.')
      return
    }

    if (numericMaterialCost > numericAmount) {
      setError('O custo dos materiais não pode ser maior que o valor da ordem.')
      return
    }

    const previousAmount = serviceOrder.valor
    const previousMaterialCost = serviceOrder.custo_materiais ?? 0
    const amountChanged =
      previousAmount === null || !valuesMatch(numericAmount, previousAmount)
    const materialCostChanged = !valuesMatch(
      numericMaterialCost,
      previousMaterialCost,
    )

    if (!amountChanged && !materialCostChanged) {
      setError('Altere o valor cobrado ou o custo dos materiais antes de salvar.')
      return
    }

    const input: UpdateServiceOrderFinancialsInput = {}

    if (amountChanged) {
      input.valor = numericAmount
    }

    if (materialCostChanged) {
      input.custo_materiais = numericMaterialCost
    }

    setIsSubmitting(true)

    try {
      const updatedOrder = await updateServiceOrderFinancials(
        serviceOrder.id,
        input,
      )
      onUpdated(updatedOrder)
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível alterar os valores. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const numericAmount = currencyInputToNumber(amount)
  const numericMaterialCost = currencyInputToNumber(materialCost)
  const laborAmount = numericAmount - numericMaterialCost

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className="customer-modal service-order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-order-financials-modal-title"
        aria-describedby="edit-order-financials-help"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Valores do serviço</p>
            <h2 id="edit-order-financials-modal-title">
              Alterar valores da ordem #{serviceOrder.id}
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

        <p className="irreversible-warning" id="edit-order-financials-help">
          O valor e o custo podem ser alterados somente enquanto a ordem estiver
          aberta. Após a conclusão, eles serão definitivos.
        </p>

        <form className="service-order-form" onSubmit={handleSubmit}>
          <div className="service-order-values-grid">
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

            <div className="form-field">
              <label htmlFor="edit-service-order-material-cost">
                Custo dos materiais
              </label>
              <div className="currency-field">
                <span aria-hidden="true">R$</span>
                <input
                  id="edit-service-order-material-cost"
                  value={materialCost}
                  onChange={(event) =>
                    setMaterialCost(formatCurrencyInput(event.target.value))
                  }
                  placeholder="0,00"
                  inputMode="numeric"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div
            className={
              laborAmount < 0
                ? 'service-order-labor-preview is-invalid'
                : 'service-order-labor-preview'
            }
          >
            <div>
              <span>Mão de obra estimada</span>
            </div>
            <strong>{formatCurrency(laborAmount)}</strong>
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
              {isSubmitting ? 'Salvando...' : 'Salvar valores'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
