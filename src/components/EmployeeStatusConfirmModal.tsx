import { useEffect, useState, type MouseEvent } from 'react'
import { ApiError } from '../api/http'
import { updateEmployeeStatus } from '../api/employees'
import type { ManagedEmployee } from '../types/employee'

interface EmployeeStatusConfirmModalProps {
  employee: ManagedEmployee
  onClose: () => void
  onUpdated: (employee: ManagedEmployee) => void
}

export function EmployeeStatusConfirmModal({
  employee,
  onClose,
  onUpdated,
}: EmployeeStatusConfirmModalProps) {
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

  async function handleConfirm() {
    setError(null)
    setIsSubmitting(true)

    try {
      const updatedEmployee = await updateEmployeeStatus(employee.id, {
        ativo: false,
      })
      onUpdated(updatedEmployee)
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível desativar o funcionário. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className="customer-modal status-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-status-modal-title"
        aria-describedby="employee-status-modal-description"
      >
        <div className="status-confirm-icon" aria-hidden="true">
          !
        </div>

        <div className="status-confirm-content">
          <p className="eyebrow">Alterar acesso</p>
          <h2 id="employee-status-modal-title">Desativar funcionário?</h2>
          <p id="employee-status-modal-description">
            {employee.nome} perderá o acesso ao sistema e não poderá continuar
            utilizando uma sessão existente.
          </p>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions status-confirm-actions">
          <button
            className="cancel-button"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Manter ativo
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Desativando...' : 'Desativar acesso'}
          </button>
        </div>
      </section>
    </div>
  )
}
