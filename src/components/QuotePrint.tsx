import { createPortal } from 'react-dom'
import { BrandLogo } from './BrandLogo'
import type { Quote } from '../types/quote'
import type { Customer } from '../types/customer'
import { formatCurrency, formatDateTime, formatPhone } from '../utils/formatters'

export function QuotePrint({ quote, customer }: { quote: Quote; customer?: Customer }) {
  return createPortal(
    <article className="service-order-print">
      <header className="print-header">
        <div className="print-brand"><BrandLogo variant="print" /></div>
        <div className="print-order-number"><span>Orçamento</span><strong>#{quote.id}</strong></div>
      </header>
      <section className="print-title">
        <div><p>Atendimento</p><h1>Orçamento</h1></div>
        <span className="print-status is-open">{quote.status === 'pendente' ? 'Pendente' : 'Convertido em OS'}</span>
      </section>
      <section className="print-section">
        <h2>Dados do cliente</h2>
        <div className="print-details-grid">
          <div className="print-detail print-detail-wide"><span>Nome</span><strong>{quote.cliente.nome}</strong></div>
          <div className="print-detail"><span>Telefone</span><strong>{customer?.telefone ? formatPhone(customer.telefone) : 'Não informado'}</strong></div>
          <div className="print-detail"><span>E-mail</span><strong>{customer?.email || 'Não informado'}</strong></div>
        </div>
      </section>
      <section className="print-section"><h2>Serviço solicitado</h2><p className="print-service-description">{quote.descricao_servico}</p></section>
      <section className="print-section">
        <h2>Datas</h2>
        <div className="print-details-grid">
          <div className="print-detail"><span>Criado em</span><strong>{formatDateTime(quote.criado_em)}</strong></div>
          <div className="print-detail"><span>Atualizado em</span><strong>{formatDateTime(quote.atualizado_em)}</strong></div>
        </div>
      </section>
      <section className="print-section print-payment-section"><h2>Valor do orçamento</h2><div className="print-payment"><div><span>Total</span><strong>{formatCurrency(quote.valor)}</strong></div></div></section>
      <p>Este orçamento não comprova pagamento. O serviço será realizado após aprovação do cliente.</p>
      <footer className="print-footer"><span>VTcell</span><span>Emitido em {formatDateTime(new Date().toISOString())}</span></footer>
    </article>, document.body,
  )
}
