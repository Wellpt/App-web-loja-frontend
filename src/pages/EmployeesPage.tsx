import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createEmployee,
  getEmployees,
  updateEmployeeStatus,
} from '../api/employees'
import { ApiError } from '../api/http'
import { EmployeeStatusConfirmModal } from '../components/EmployeeStatusConfirmModal'
import type { ManagedEmployee } from '../types/employee'

type LoadState = 'loading' | 'success' | 'error'

function getListErrorMessage(requestError: unknown): string {
  return requestError instanceof ApiError
    ? requestError.message
    : 'Não foi possível carregar os funcionários. Tente novamente.'
}

export function EmployeesPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [employees, setEmployees] = useState<ManagedEmployee[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [listError, setListError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingEmployeeId, setPendingEmployeeId] = useState<number | null>(
    null,
  )
  const [employeeToDeactivate, setEmployeeToDeactivate] =
    useState<ManagedEmployee | null>(null)

  const loadEmployees = useCallback(async () => {
    try {
      const employeeList = await getEmployees()
      setEmployees(employeeList)
      setListError(null)
      setLoadState('success')
    } catch (requestError) {
      setListError(getListErrorMessage(requestError))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getEmployees(controller.signal)
      .then((employeeList) => {
        if (!controller.signal.aborted) {
          setEmployees(employeeList)
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
    void loadEmployees()
  }

  function replaceEmployee(updatedEmployee: ManagedEmployee) {
    setEmployees((currentEmployees) =>
      currentEmployees.map((employee) =>
        employee.id === updatedEmployee.id ? updatedEmployee : employee,
      ),
    )
  }

  function handleEmployeeDeactivated(updatedEmployee: ManagedEmployee) {
    replaceEmployee(updatedEmployee)
    setActionError(null)
    setNotice('Funcionário desativado com sucesso.')
  }

  async function handleReactivate(employee: ManagedEmployee) {
    setActionError(null)
    setNotice(null)
    setPendingEmployeeId(employee.id)

    try {
      const updatedEmployee = await updateEmployeeStatus(employee.id, {
        ativo: true,
      })
      replaceEmployee(updatedEmployee)
      setNotice('Funcionário reativado com sucesso.')
    } catch (requestError) {
      setActionError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível reativar o funcionário. Tente novamente.',
      )
    } finally {
      setPendingEmployeeId(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setNotice(null)

    if (password.length < 6 || password.length > 8) {
      setFormError('A senha deve ter entre 6 e 8 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      const employee = await createEmployee({
        nome: name.trim(),
        email: email.trim(),
        senha: password,
      })
      setNotice('Funcionário ' + employee.nome + ' cadastrado com sucesso.')
      setName('')
      setEmail('')
      setPassword('')
      void loadEmployees()
    } catch (requestError) {
      setFormError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível cadastrar o funcionário. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const employeeCountLabel =
    employees.length === 1
      ? '1 funcionário cadastrado'
      : employees.length + ' funcionários cadastrados'

  return (
    <section className="employees-page">
      <div className="page-intro employees-intro">
        <div>
          <p className="eyebrow">Equipe</p>
          <h2>Funcionários</h2>
          <p>Cadastre acessos e gerencie quem participa da operação da loja.</p>
        </div>
        <span className="owner-only-badge">Acesso do empresário</span>
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

            {formError && (
              <p className="form-error" role="alert">
                {formError}
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

      <section className="employee-list-card">
        <div className="employee-list-header">
          <div>
            <h3>Equipe cadastrada</h3>
            <p>
              {loadState === 'success'
                ? employeeCountLabel
                : 'Carregando dados'}
            </p>
          </div>
        </div>

        {actionError && (
          <div className="employee-action-error" role="alert">
            <span>{actionError}</span>
            <button
              type="button"
              aria-label="Fechar mensagem de erro"
              onClick={() => setActionError(null)}
            >
              ×
            </button>
          </div>
        )}

        {loadState === 'loading' && (
          <div className="customers-state" aria-live="polite">
            <span className="loading-indicator" aria-hidden="true" />
            <h4>Carregando funcionários</h4>
            <p>Aguarde enquanto buscamos os acessos cadastrados.</p>
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

        {loadState === 'success' && employees.length === 0 && (
          <div className="customers-state">
            <span className="state-symbol" aria-hidden="true">
              EQ
            </span>
            <h4>Nenhum funcionário cadastrado</h4>
            <p>
              Utilize o formulário acima para cadastrar o primeiro acesso da
              equipe.
            </p>
          </div>
        )}

        {loadState === 'success' && employees.length > 0 && (
          <div className="employee-table-wrap">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>E-mail</th>
                  <th>Situação</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td data-label="Funcionário">
                      <div className="employee-list-identity">
                        <span aria-hidden="true">
                          {employee.nome.charAt(0).toUpperCase()}
                        </span>
                        <strong>{employee.nome}</strong>
                      </div>
                    </td>
                    <td className="employee-list-email" data-label="E-mail">
                      {employee.email}
                    </td>
                    <td data-label="Situação">
                      <span
                        className={
                          employee.ativo
                            ? 'employee-status-badge is-active'
                            : 'employee-status-badge is-inactive'
                        }
                      >
                        {employee.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="employee-list-action" data-label="Ação">
                      {employee.ativo ? (
                        <button
                          className="employee-status-action is-danger"
                          type="button"
                          onClick={() => setEmployeeToDeactivate(employee)}
                        >
                          Desativar
                        </button>
                      ) : (
                        <button
                          className="employee-status-action is-success"
                          type="button"
                          onClick={() => void handleReactivate(employee)}
                          disabled={pendingEmployeeId === employee.id}
                        >
                          {pendingEmployeeId === employee.id
                            ? 'Reativando...'
                            : 'Reativar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {employeeToDeactivate && (
        <EmployeeStatusConfirmModal
          employee={employeeToDeactivate}
          onClose={() => setEmployeeToDeactivate(null)}
          onUpdated={handleEmployeeDeactivated}
        />
      )}
    </section>
  )
}
