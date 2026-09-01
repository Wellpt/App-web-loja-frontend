import { Link } from 'react-router-dom'

interface ComingSoonPageProps {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <section className="coming-soon-page">
      <div className="coming-soon-card">
        <span className="coming-soon-index" aria-hidden="true">
          Em breve
        </span>
        <p className="eyebrow">Próxima etapa</p>
        <h2>{title}</h2>
        <p>
          A navegação desta área já está pronta. Suas funcionalidades serão
          implementadas em uma próxima história.
        </p>
        <Link className="secondary-link" to="/">
          Voltar para a visão geral
        </Link>
      </div>
    </section>
  )
}
