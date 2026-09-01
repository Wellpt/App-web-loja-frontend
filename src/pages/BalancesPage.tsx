import { useCallback, useEffect, useState } from 'react'
import { getBalances } from '../api/balances'
import { ApiError } from '../api/http'
import type {
  BalancePeriod,
  BalanceSummary,
} from '../types/balance'
import { formatCurrency } from '../utils/formatters'

type LoadState = 'loading' | 'success' | 'error'

interface PeriodCard {
  period: BalancePeriod
  label: string
  note: string
  index: string
}

const periodCards: PeriodCard[] = [
  {
    period: 'diario',
    label: 'Hoje',
    note: 'Desde 00:00',
    index: 'D',
  },
  {
    period: 'semanal',
    label: 'Esta semana',
    note: 'Desde segunda-feira, 00:00',
    index: 'S',
  },
  {
    period: 'mensal',
    label: 'Este mês',
    note: 'Desde o primeiro dia, 00:00',
    index: 'M',
  },
]

function getLoadErrorMessage(requestError: unknown): string {
  return requestError instanceof ApiError
    ? requestError.message
    : 'Não foi possível carregar os balanços. Tente novamente.'
}

function getOrderCountLabel(count: number): string {
  return count === 1 ? '1 ordem concluída' : count + ' ordens concluídas'
}

function formatUpdateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function BalancesPage() {
  const [balances, setBalances] = useState<BalanceSummary | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const loadBalances = useCallback(async () => {
    try {
      const summary = await getBalances()
      setBalances(summary)
      setUpdatedAt(new Date())
      setLoadState('success')
    } catch (requestError) {
      setLoadError(getLoadErrorMessage(requestError))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getBalances(controller.signal)
      .then((summary) => {
        if (!controller.signal.aborted) {
          setBalances(summary)
          setUpdatedAt(new Date())
          setLoadState('success')
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(getLoadErrorMessage(requestError))
          setLoadState('error')
        }
      })

    return () => controller.abort()
  }, [])

  function handleReload() {
    setLoadState('loading')
    setLoadError(null)
    void loadBalances()
  }

  return (
    <section className="balances-page">
      <div className="page-intro balances-intro">
        <div>
          <p className="eyebrow">Financeiro</p>
          <h2>Balanços</h2>
          <p>
            Consulte o total recebido nas ordens de serviço concluídas.
          </p>
        </div>
        <button
          className="secondary-action"
          type="button"
          onClick={handleReload}
          disabled={loadState === 'loading'}
        >
          {loadState === 'loading' ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </div>

      {loadState === 'loading' && (
        <div className="balances-state-card">
          <div className="customers-state" aria-live="polite">
            <span className="loading-indicator" aria-hidden="true" />
            <h4>Calculando balanços</h4>
            <p>Aguarde enquanto atualizamos os valores recebidos.</p>
          </div>
        </div>
      )}

      {loadState === 'error' && (
        <div className="balances-state-card">
          <div className="customers-state">
            <span className="state-symbol state-symbol-error" aria-hidden="true">
              !
            </span>
            <h4>Não foi possível carregar</h4>
            <p>{loadError}</p>
            <button className="retry-button" type="button" onClick={handleReload}>
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {loadState === 'success' && balances && (
        <>
          <div className="balance-cards-grid">
            {periodCards.map((card) => {
              const balance = balances[card.period]

              return (
                <article className="balance-card" key={card.period}>
                  <div className="balance-card-heading">
                    <span className="balance-period-index" aria-hidden="true">
                      {card.index}
                    </span>
                    <div>
                      <p>{card.label}</p>
                      <span>{card.note}</span>
                    </div>
                  </div>

                  <div className="balance-card-value">
                    <span>Total recebido</span>
                    <strong>{formatCurrency(balance.valor_total)}</strong>
                  </div>

                  <div className="balance-card-footer">
                    <span>{getOrderCountLabel(balance.quantidade_ordens)}</span>
                    <span>Somente pagamentos integrais</span>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="balance-info-panel">
            <div className="balance-info-mark" aria-hidden="true">
              i
            </div>
            <div>
              <strong>Como os valores são calculados?</strong>
              <p>
                Entram no balanço somente ordens concluídas e pagas. Os
                períodos seguem o fuso horário de São Paulo.
              </p>
            </div>
            {updatedAt && (
              <span className="balance-updated-at">
                Atualizado às {formatUpdateTime(updatedAt)}
              </span>
            )}
          </div>
        </>
      )}
    </section>
  )
}
