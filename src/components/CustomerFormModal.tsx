import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { createCustomer } from '../api/customers'
import { ApiError } from '../api/http'
import type { Customer } from '../types/customer'
import { digitsOnly, formatDocument, formatPhone } from '../utils/formatters'

interface CustomerFormModalProps {
  onClose: () => void
  onCreated: (customer: Customer) => void
}

export function CustomerFormModal({
  onClose,
  onCreated,
}: CustomerFormModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [documentValue, setDocumentValue] = useState('')
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

    const phoneDigits = digitsOnly(phone)
    const documentDigits = digitsOnly(documentValue)

    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      setError('Informe um telefone com DDD válido.')
      return
    }

    if (documentDigits.length !== 11 && documentDigits.length !== 14) {
      setError('Informe um CPF ou CNPJ válido.')
      return
    }

    setIsSubmitting(true)

    try {
      const customer = await createCustomer({
        nome: name.trim(),
        telefone: phone,
        email: email.trim(),
        documento: documentValue,
      })
      onCreated(customer)
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível cadastrar o cliente. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className="customer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Novo cadastro</p>
            <h2 id="customer-modal-title">Novo cliente</h2>
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

        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="form-field form-field-wide">
            <label htmlFor="customer-name">Nome</label>
            <input
              id="customer-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo ou razão social"
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="customer-phone">Telefone</label>
            <input
              id="customer-phone"
              value={phone}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              placeholder="(00) 00000-0000"
              inputMode="tel"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="customer-document">CPF/CNPJ</label>
            <input
              id="customer-document"
              value={documentValue}
              onChange={(event) =>
                setDocumentValue(formatDocument(event.target.value))
              }
              placeholder="000.000.000-00"
              inputMode="numeric"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-field form-field-wide">
            <label htmlFor="customer-email">E-mail</label>
            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="cliente@exemplo.com"
              autoComplete="email"
              disabled={isSubmitting}
              required
            />
          </div>

          {error && (
            <p className="form-error form-field-wide" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions form-field-wide">
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
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar cliente'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
