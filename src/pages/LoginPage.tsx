import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/http'
import { useAuth } from '../hooks/useAuth'

interface LoginLocationState {
  from?: string
}

export function LoginPage() {
  const { employee, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (employee) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 6 || password.length > 8) {
      setError('A senha deve ter entre 6 e 8 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      const state = location.state as LoginLocationState | null
      navigate(state?.from ?? '/', { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'N\u00e3o foi poss\u00edvel conectar ao servidor. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section
        className="login-hero"
        aria-label={'Apresenta\u00e7\u00e3o'}
      >
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">AL</span>
          <span>App Web Loja</span>
        </div>
        <div className="login-hero-content">
          <p className="eyebrow">{'Gest\u00e3o de servi\u00e7os'}</p>
          <h1>{'Seu neg\u00f3cio organizado em um s\u00f3 lugar.'}</h1>
          <p>
            {'Acompanhe clientes, ordens de servi\u00e7o e recebimentos com clareza.'}
          </p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-heading">
            <p className="eyebrow">{'\u00c1rea do funcion\u00e1rio'}</p>
            <h2>Entre na sua conta</h2>
            <p>Informe suas credenciais para acessar o sistema.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="funcionario@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
              autoFocus
            />

            <div className="field-heading">
              <label htmlFor="password">Senha</label>
              <span>6 a 8 caracteres</span>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              minLength={6}
              maxLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              required
            />

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
