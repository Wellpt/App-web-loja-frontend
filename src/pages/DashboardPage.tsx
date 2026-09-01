import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const metrics = [
  { label: 'Recebido hoje', note: 'Balanço diário' },
  { label: 'Esta semana', note: 'Desde segunda-feira' },
  { label: 'Este mês', note: 'Desde o primeiro dia' },
  { label: 'Ordens abertas', note: 'Serviços em andamento' },
]

export function DashboardPage() {
  const { employee } = useAuth()
  const firstName = employee?.nome.split(' ')[0]

  return (
    <section className="dashboard-page">
      <div className="page-intro dashboard-intro">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h2>Bem-vindo, {firstName}.</h2>
          <p>Acompanhe os principais números da sua operação.</p>
        </div>
        <Link className="primary-link" to="/ordens">
          Nova ordem
        </Link>
      </div>

      <div className="metrics-grid" aria-label="Resumo da operação">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <p>{metric.label}</p>
            <strong aria-label="Dados disponíveis em uma próxima etapa">—</strong>
            <span>{metric.note}</span>
          </article>
        ))}
      </div>

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Atalhos</p>
          <h3>Continue de onde precisa</h3>
          <p>As funcionalidades serão liberadas nas próximas histórias.</p>
        </div>
        <div className="quick-links">
          <Link to="/clientes">Ver clientes</Link>
          <Link to="/ordens">Ver ordens</Link>
          <Link to="/balancos">Ver balanços</Link>
        </div>
      </section>
    </section>
  )
}
