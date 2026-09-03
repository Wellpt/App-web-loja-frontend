import { createPortal } from 'react-dom'
import type { Customer } from '../types/customer'
import type { ServiceOrder } from '../types/serviceOrder'
import {
  formatCurrency,
  formatDateTime,
  formatDocument,
  formatPhone,
} from '../utils/formatters'

interface ServiceOrderPrintProps {
  serviceOrder: ServiceOrder
  customer?: Customer
}

function getStatusLabel(serviceOrder: ServiceOrder): string {
  return serviceOrder.status === 'aberta' ? 'Aberta' : 'Concluída'
}

export function ServiceOrderPrint({
  serviceOrder,
  customer,
}: ServiceOrderPrintProps) {
  const isCompleted = serviceOrder.status === 'concluida'
  const hasPayment =
    isCompleted &&
    serviceOrder.valor !== null &&
    serviceOrder.forma_pagamento

  return createPortal(
    <article className="service-order-print">
      <header className="print-header">
        <div className="print-brand">
          <span aria-hidden="true">VT</span>
          <div>
            <strong>VTcell</strong>
            <small>Documento de acompanhamento do serviço</small>
          </div>
        </div>
        <div className="print-order-number">
          <span>Ordem de serviço</span>
          <strong>#{serviceOrder.id}</strong>
        </div>
      </header>

      <section className="print-title">
        <div>
          <p>Atendimento</p>
          <h1>Ordem de serviço</h1>
        </div>
        <span
          className={
            isCompleted
              ? 'print-status is-completed'
              : 'print-status is-open'
          }
        >
          {getStatusLabel(serviceOrder)}
        </span>
      </section>

      <section className="print-section">
        <h2>Dados do cliente</h2>
        <div className="print-details-grid">
          <div className="print-detail print-detail-wide">
            <span>Nome</span>
            <strong>{serviceOrder.cliente.nome}</strong>
          </div>
          <div className="print-detail">
            <span>Telefone</span>
            <strong>
              {customer ? formatPhone(customer.telefone) : 'Não informado'}
            </strong>
          </div>
          <div className="print-detail">
            <span>CPF/CNPJ</span>
            <strong>
              {customer
                ? formatDocument(customer.documento)
                : 'Não informado'}
            </strong>
          </div>
          <div className="print-detail print-detail-wide">
            <span>E-mail</span>
            <strong>{customer?.email ?? 'Não informado'}</strong>
          </div>
        </div>
      </section>

      <section className="print-section">
        <h2>Serviço solicitado</h2>
        <p className="print-service-description">
          {serviceOrder.descricao_servico}
        </p>
      </section>

      <section className="print-section">
        <h2>Datas e situação</h2>
        <div className="print-details-grid print-timeline-grid">
          <div className="print-detail">
            <span>Aberta em</span>
            <strong>{formatDateTime(serviceOrder.criada_em)}</strong>
          </div>
          <div className="print-detail">
            <span>Concluída em</span>
            <strong>
              {serviceOrder.concluida_em
                ? formatDateTime(serviceOrder.concluida_em)
                : 'Em aberto'}
            </strong>
          </div>
          <div className="print-detail">
            <span>Status</span>
            <strong>{getStatusLabel(serviceOrder)}</strong>
          </div>
        </div>
      </section>

      <section className="print-section print-payment-section">
        <h2>Recebimento</h2>
        {hasPayment ? (
          <div className="print-payment">
            <div>
              <span>Valor recebido</span>
              <strong>{formatCurrency(serviceOrder.valor as number)}</strong>
            </div>
            <div>
              <span>Forma de pagamento</span>
              <strong>{serviceOrder.forma_pagamento}</strong>
            </div>
          </div>
        ) : (
          <p className="print-payment-pending">
            Pagamento pendente — ordem ainda não concluída.
          </p>
        )}
      </section>

      <section className="print-signatures">
        <div>
          <span />
          <strong>Assinatura do cliente</strong>
        </div>
        <div>
          <span />
          <strong>Responsável pelo atendimento</strong>
        </div>
      </section>

      <footer className="print-footer">
        <span>VTcell</span>
        <span>Emitido em {formatDateTime(new Date().toISOString())}</span>
      </footer>
    </article>,
    document.body,
  )
}
