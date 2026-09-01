import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBalances } from '../api/balances'
import { ApiError } from '../api/http'
import { getServiceOrders } from '../api/serviceOrders'
import { useAuth } from '../hooks/useAuth'
import type { BalanceSummary } from '../types/balance'
import { formatCurrency } from '../utils/formatters'

type LoadState = 'loading' | 'success' | 'error'

function getDashboardErrorMessage(requestError: unknown): string {
  return requestError instanceof ApiError
    ? requestError.message
    : 'Não foi possível carregar os indicadores. Tente novamente.'
}

export function DashboardPage() {
  const { employee } = useAuth()
  const firstName = employee?.nome.split(' ')[0]
  const [balances, setBalances] = useState<BalanceSummary | null>(null)
  const [openOrderCount, setOpenOrderCount] = useState(0)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      const [summary, serviceOrders] = await Promise.all([
        getBalances(),
        getServiceOrders(),
      ])
      setBalances(summary)
      setOpenOrderCount(
        serviceOrders.filter((order) => order.status === 'aberta').length,
      )
      setLoadState('success')
    } catch (requestError) {
      setLoadError(getDashboardErrorMessage(requestError))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getBalances(controller.signal),
      getServiceOrders(controller.signal),
    ])
      .then(([summary, serviceOrders]) => {
        if (!controller.signal.aborted) {
          setBalances(summary)
          setOpenOrderCount(
            serviceOrders.filter((order) => order.status === 'aberta').length,
          )
          setLoadState('success')
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(getDashboardErrorMessage(requestError))
          setLoadState('error')
        }
      })

    return () => controller.abort()
  }, [])

  function handleRetry() {
    setLoadState('loading')
    setLoadError(null)
    void loadDashboard()
  }

  const metrics = [
    {
      label: 'Recebido hoje',
      value: balances ? formatCurrency(balances.diario.valor_total) : '—',
      note: 'Balanço diário',
    },
    {
      label: 'Esta semana',
      value: balances ? formatCurrency(balances.semanal.valor_total) : '—',
      note: 'Desde segunda-feira',
    },
    {
      label: 'Este mês',
      value: balances ? formatCurrency(balances.mensal.valor_total) : '—',
      note: 'Desde o primeiro dia',
    },
    {
      label: 'Ordens abertas',
      value: loadState === 'success' ? String(openOrderCount) : '—',
      note: 'Serviços em andamento',
    },
  ]

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

      {loadState === 'error' && (
        <div className="dashboard-load-error" role="alert">
          <div>
            <strong>Indicadores indisponíveis</strong>
            <span>{loadError}</span>
          </div>
          <button type="button" onClick={handleRetry}>
            Tentar novamente
          </button>
        </div>
      )}

      <div
        className="metrics-grid"
        aria-label="Resumo da operação"
        aria-busy={loadState === 'loading'}
      >
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <p>{metric.label}</p>
            {loadState === 'loading' ? (
              <span className="metric-loading" aria-label="Carregando indicador" />
            ) : (
              <strong>{metric.value}</strong>
            )}
            <span>{metric.note}</span>
          </article>
        ))}
      </div>

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Atalhos</p>
          <h3>Continue de onde precisa</h3>
          <p>Acesse rapidamente os cadastros, atendimentos e balanços.</p>
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
