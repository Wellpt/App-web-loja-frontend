import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function DashboardPage() {
  const { employee, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // O estado local e limpo mesmo se a API estiver indisponivel.
    }

    navigate('/login', { replace: true })
  }

  return (
    <main className="foundation-page">
      <p className="eyebrow">{'Funda\u00e7\u00e3o conclu\u00edda'}</p>
      <h1>
        {'Ol\u00e1'}, {employee?.nome.split(' ')[0]}.
      </h1>
      <p>{'Sua sess\u00e3o est\u00e1 ativa.'}</p>
      <button type="button" onClick={handleLogout}>
        Sair
      </button>
    </main>
  )
}
