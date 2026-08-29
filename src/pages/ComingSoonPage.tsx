import { Link } from 'react-router-dom'

interface ComingSoonPageProps {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <main className="coming-soon-page">
      <p className="eyebrow">{'Pr\u00f3xima etapa'}</p>
      <h1>{title}</h1>
      <p>
        {'Esta \u00e1rea j\u00e1 possui uma rota protegida e ser\u00e1 implementada em breve.'}
      </p>
      <Link className="secondary-button" to="/">
        {'Voltar para o in\u00edcio'}
      </Link>
    </main>
  )
}
