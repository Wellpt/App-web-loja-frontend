import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBalances } from '../api/balances'
import { getCustomers } from '../api/customers'
import { ApiError } from '../api/http'
import { getServiceOrders } from '../api/serviceOrders'
import { useAuth } from '../hooks/useAuth'
import type { BalanceSummary } from '../types/balance'
import { formatCurrency } from '../utils/formatters'

type LoadState = 'loading' | 'success' | 'error'

interface DashboardSnapshot {
  balances: BalanceSummary | null
  customerCount: number
  openOrderCount: number
  completedOrderCount: number
  totalOrderCount: number
}

function getDashboardErrorMessage(requestError: unknown): string {
  return requestError instanceof ApiError
    ? requestError.message
    : 'Não foi possível carregar os indicadores. Tente novamente.'
}

function getOrderCounts(
  serviceOrders: Awaited<ReturnType<typeof getServiceOrders>>,
) {
  return {
    openOrderCount: serviceOrders.filter((order) => order.status === 'aberta')
      .length,
    completedOrderCount: serviceOrders.filter(
      (order) => order.status === 'concluida',
    ).length,
    totalOrderCount: serviceOrders.length,
  }
}

async function getDashboardSnapshot(
  isOwner: boolean,
  signal?: AbortSignal,
): Promise<DashboardSnapshot> {
  if (isOwner) {
    const [balances, serviceOrders] = await Promise.all([
      getBalances(signal),
      getServiceOrders(signal),
    ])

    return {
      balances,
      customerCount: 0,
      ...getOrderCounts(serviceOrders),
    }
  }

  const [customers, serviceOrders] = await Promise.all([
    getCustomers(signal),
    getServiceOrders(signal),
  ])

  return {
    balances: null,
    customerCount: customers.length,
    ...getOrderCounts(serviceOrders),
  }
}

export function DashboardPage() {
  const { employee } = useAuth()
  const firstName = employee?.nome.split(' ')[0]
  const isOwner = employee?.perfil === 'empresario'
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      const dashboardSnapshot = await getDashboardSnapshot(isOwner)
      setSnapshot(dashboardSnapshot)
      setLoadState('success')
    } catch (requestError) {
      setLoadError(getDashboardErrorMessage(requestError))
      setLoadState('error')
    }
  }, [isOwner])

  useEffect(() => {
    const controller = new AbortController()

    getDashboardSnapshot(isOwner, controller.signal)
      .then((dashboardSnapshot) => {
        if (!controller.signal.aborted) {
          setSnapshot(dashboardSnapshot)
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
  }, [isOwner])

  function handleRetry() {
    setLoadState('loading')
    setLoadError(null)
    void loadDashboard()
  }

  const ownerMetrics = [
    {
      label: 'Recebido hoje',
      value: snapshot?.balances
        ? formatCurrency(snapshot.balances.diario.valor_total)
        : '—',
      note: 'Balanço diário',
    },
    {
      label: 'Esta semana',
      value: snapshot?.balances
        ? formatCurrency(snapshot.balances.semanal.valor_total)
        : '—',
      note: 'Desde segunda-feira',
    },
    {
      label: 'Este mês',
      value: snapshot?.balances
        ? formatCurrency(snapshot.balances.mensal.valor_total)
        : '—',
      note: 'Desde o primeiro dia',
    },
    {
      label: 'Ordens abertas',
      value:
        loadState === 'success' && snapshot
          ? String(snapshot.openOrderCount)
          : '—',
      note: 'Serviços em andamento',
    },
  ]

  const employeeMetrics = [
    {
      label: 'Clientes cadastrados',
      value:
        loadState === 'success' && snapshot
          ? String(snapshot.customerCount)
          : '—',
      note: 'Base de clientes',
    },
    {
      label: 'Ordens abertas',
      value:
        loadState === 'success' && snapshot
          ? String(snapshot.openOrderCount)
          : '—',
      note: 'Serviços em andamento',
    },
    {
      label: 'Ordens concluídas',
      value:
        loadState === 'success' && snapshot
          ? String(snapshot.completedOrderCount)
          : '—',
      note: 'Serviços finalizados',
    },
    {
      label: 'Total de ordens',
      value:
        loadState === 'success' && snapshot
          ? String(snapshot.totalOrderCount)
          : '—',
      note: 'Histórico operacional',
    },
  ]

  const metrics = isOwner ? ownerMetrics : employeeMetrics

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
          <p>
            {isOwner
              ? 'Acesse rapidamente cadastros, atendimentos e gestão.'
              : 'Acesse rapidamente clientes e atendimentos.'}
          </p>
        </div>
        <div className="quick-links">
          <Link to="/clientes">Ver clientes</Link>
          <Link to="/ordens">Ver ordens</Link>
          {isOwner && <Link to="/balancos">Ver balanços</Link>}
          {isOwner && <Link to="/funcionarios">Cadastrar funcionário</Link>}
        </div>
      </section>
    </section>
  )
}
