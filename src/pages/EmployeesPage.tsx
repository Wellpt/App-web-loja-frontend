import { useState, type FormEvent } from 'react'
import { createEmployee } from '../api/employees'
import { ApiError } from '../api/http'
import type { Employee } from '../types/auth'

export function EmployeesPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setCreatedEmployee(null)

    if (password.length < 6 || password.length > 8) {
      setError('A senha deve ter entre 6 e 8 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      const employee = await createEmployee({
        nome: name.trim(),
        email: email.trim(),
        senha: password,
      })
      setCreatedEmployee(employee)
      setName('')
      setEmail('')
      setPassword('')
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível cadastrar o funcionário. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="employees-page">
      <div className="page-intro employees-intro">
        <div>
          <p className="eyebrow">Equipe</p>
          <h2>Novo funcionário</h2>
          <p>Cadastre um acesso para quem participa da operação da loja.</p>
        </div>
        <span className="owner-only-badge">Acesso do empresário</span>
      </div>

      {createdEmployee && (
        <div className="success-notice" role="status">
          <span>
            Funcionário {createdEmployee.nome} cadastrado com sucesso.
          </span>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => setCreatedEmployee(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="employee-create-layout">
        <section className="employee-form-card">
          <div className="employee-card-header">
            <div>
              <h3>Dados de acesso</h3>
              <p>Todos os campos são obrigatórios.</p>
            </div>
          </div>

          <form className="employee-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="employee-name">Nome</label>
              <input
                id="employee-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome completo"
                autoComplete="name"
                disabled={isSubmitting}
                required
                autoFocus
              />
            </div>

            <div className="form-field">
              <label htmlFor="employee-email">E-mail</label>
              <input
                id="employee-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="funcionario@loja.com"
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-field">
              <div className="employee-field-heading">
                <label htmlFor="employee-password">Senha inicial</label>
                <span>6 a 8 caracteres</span>
              </div>
              <input
                id="employee-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite a senha inicial"
                minLength={6}
                maxLength={8}
                autoComplete="new-password"
                disabled={isSubmitting}
                required
              />
              <span className="field-help">
                Compartilhe a senha com o funcionário por um canal seguro.
              </span>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="employee-form-actions">
              <button
                className="submit-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar funcionário'}
              </button>
            </div>
          </form>
        </section>

        <aside className="employee-access-card">
          <span className="employee-access-index" aria-hidden="true">
            PF
          </span>
          <p className="eyebrow">Perfil atribuído</p>
          <h3>Funcionário</h3>
          <p>
            O novo acesso poderá consultar clientes e trabalhar com ordens de
            serviço.
          </p>
          <ul>
            <li>Acesso a clientes</li>
            <li>Acesso a ordens de serviço</li>
            <li>Sem acesso aos balanços</li>
            <li>Sem permissão para cadastrar a equipe</li>
          </ul>
          <span className="employee-access-note">
            O perfil é definido automaticamente e não pode ser escolhido neste
            cadastro.
          </span>
        </aside>
      </div>
    </section>
  )
}
