import { useCallback, useEffect, useState } from 'react'
import { getBalances, getMonthlyBalance } from '../api/balances'
import { ApiError } from '../api/http'
import type {
  Balance,
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

interface MonthReference {
  year: number
  month: number
}

const minimumBalanceYear = 2000

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

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

function getPreviousMonthReference(date: Date): MonthReference {
  const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  return {
    year: previousMonth.getFullYear(),
    month: previousMonth.getMonth() + 1,
  }
}

function getLoadErrorMessage(requestError: unknown): string {
  return requestError instanceof ApiError
    ? requestError.message
    : 'Não foi possível carregar os balanços. Tente novamente.'
}

function getOrderCountLabel(count: number): string {
  return count === 1 ? '1 ordem concluída' : count + ' ordens concluídas'
}

function getSaleCountLabel(count: number): string {
  return count === 1 ? '1 venda concluída' : count + ' vendas concluídas'
}

function formatUpdateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function BalancesPage() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const [balances, setBalances] = useState<BalanceSummary | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [selectedReference, setSelectedReference] = useState<MonthReference>(
    () => getPreviousMonthReference(new Date()),
  )
  const [monthlyBalance, setMonthlyBalance] = useState<Balance | null>(null)
  const [historyState, setHistoryState] = useState<LoadState>('loading')
  const [historyError, setHistoryError] = useState<string | null>(null)

  const loadBalances = useCallback(async (signal?: AbortSignal) => {
    try {
      const summary = await getBalances(signal)
      if (signal?.aborted) return
      setBalances(summary)
      setUpdatedAt(new Date())
      setLoadState('success')
    } catch (requestError) {
      if (signal?.aborted) return
      setLoadError(getLoadErrorMessage(requestError))
      setLoadState('error')
    }
  }, [])

  const loadMonthlyHistory = useCallback(
    async (reference: MonthReference, signal?: AbortSignal) => {
      try {
        const balance = await getMonthlyBalance(
          reference.year,
          reference.month,
          signal,
        )
        if (signal?.aborted) return
        setMonthlyBalance(balance)
        setHistoryState('success')
      } catch (requestError) {
        if (signal?.aborted) return
        setHistoryError(getLoadErrorMessage(requestError))
        setHistoryState('error')
      }
    },
    [],
  )

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

  useEffect(() => {
    const controller = new AbortController()

    getMonthlyBalance(
      selectedReference.year,
      selectedReference.month,
      controller.signal,
    )
      .then((balance) => {
        if (!controller.signal.aborted) {
          setMonthlyBalance(balance)
          setHistoryState('success')
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setHistoryError(getLoadErrorMessage(requestError))
          setHistoryState('error')
        }
      })

    return () => controller.abort()
  }, [selectedReference])

  function handleReload() {
    setLoadState('loading')
    setLoadError(null)
    setHistoryState('loading')
    setHistoryError(null)
    void loadBalances()
    void loadMonthlyHistory(selectedReference)
  }

  function handleYearChange(change: number) {
    setHistoryState('loading')
    setHistoryError(null)
    setSelectedReference((currentReference) => {
      const nextYear = currentReference.year + change
      const nextMonth =
        nextYear === currentYear
          ? Math.min(currentReference.month, currentMonth)
          : currentReference.month

      return { year: nextYear, month: nextMonth }
    })
  }

  function handleMonthChange(month: number) {
    setHistoryState('loading')
    setHistoryError(null)
    setSelectedReference((currentReference) => ({
      ...currentReference,
      month,
    }))
  }

  return (
    <section className="balances-page">
      <div className="page-intro balances-intro">
        <div>
          <p className="eyebrow">Financeiro</p>
          <h2>Balanços</h2>
          <p>Consulte o faturamento recebido em serviços e vendas.</p>
        </div>
        <button
          className="secondary-action"
          type="button"
          onClick={handleReload}
          disabled={loadState === 'loading' || historyState === 'loading'}
        >
          {loadState === 'loading' || historyState === 'loading'
            ? 'Atualizando...'
            : 'Atualizar dados'}
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
                  <span>Faturamento total</span>
                  <strong>{formatCurrency(balance.valor_total)}</strong>
                </div>

                <div className="balance-card-breakdown">
                  <div>
                    <span className="balance-breakdown-label">
                      <i className="is-service" aria-hidden="true" />
                      Serviços
                    </span>
                    <strong>{formatCurrency(balance.valor_servicos)}</strong>
                    <small>
                      {getOrderCountLabel(balance.quantidade_ordens)}
                    </small>
                  </div>
                  <div>
                    <span className="balance-breakdown-label">
                      <i className="is-sale" aria-hidden="true" />
                      Vendas
                    </span>
                    <strong>{formatCurrency(balance.valor_vendas)}</strong>
                    <small>{getSaleCountLabel(balance.quantidade_vendas)}</small>
                  </div>
                </div>

                <div className="balance-card-footer">
                  <span>Receitas confirmadas</span>
                  <span>Serviços + vendas</span>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <section className="monthly-history-section">
        <div className="monthly-history-heading">
          <div>
            <p className="eyebrow">Histórico mensal</p>
            <h3>Consulte outros meses</h3>
            <p>Escolha um dos 12 meses para ver o faturamento daquele período.</p>
          </div>
          <div className="monthly-year-navigation" aria-label="Selecionar ano">
            <button
              type="button"
              onClick={() => handleYearChange(-1)}
              disabled={selectedReference.year <= minimumBalanceYear}
              aria-label="Consultar ano anterior"
            >
              ←
            </button>
            <strong>{selectedReference.year}</strong>
            <button
              type="button"
              onClick={() => handleYearChange(1)}
              disabled={selectedReference.year >= currentYear}
              aria-label="Consultar próximo ano"
            >
              →
            </button>
          </div>
        </div>

        <div className="monthly-selector" aria-label="Selecionar mês">
          {monthNames.map((monthName, index) => {
            const month = index + 1
            const isSelected = month === selectedReference.month
            const isFuture =
              selectedReference.year === currentYear && month > currentMonth

            return (
              <button
                className={isSelected ? 'is-selected' : undefined}
                type="button"
                key={monthName}
                onClick={() => handleMonthChange(month)}
                disabled={isFuture}
                aria-pressed={isSelected}
              >
                <span>{monthName.slice(0, 3)}</span>
                <small>{monthName}</small>
              </button>
            )
          })}
        </div>

        {historyState === 'loading' && (
          <div className="monthly-history-state" aria-live="polite">
            <span className="loading-indicator" aria-hidden="true" />
            <p>Carregando {monthNames[selectedReference.month - 1]}...</p>
          </div>
        )}

        {historyState === 'error' && (
          <div className="monthly-history-state is-error" role="alert">
            <p>{historyError}</p>
            <button
              className="retry-button"
              type="button"
              onClick={() => {
                setHistoryState('loading')
                setHistoryError(null)
                void loadMonthlyHistory(selectedReference)
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {historyState === 'success' && monthlyBalance && (
          <article className="monthly-history-card">
            <div className="monthly-history-card-heading">
              <div>
                <span>Mês consultado</span>
                <h4>
                  {monthNames[selectedReference.month - 1]} de{' '}
                  {selectedReference.year}
                </h4>
              </div>
              <span className="monthly-period-badge">Período mensal</span>
            </div>

            <div className="monthly-history-total">
              <span>Faturamento total</span>
              <strong>{formatCurrency(monthlyBalance.valor_total)}</strong>
            </div>

            <div className="monthly-history-breakdown">
              <div>
                <span className="balance-breakdown-label">
                  <i className="is-service" aria-hidden="true" />
                  Serviços
                </span>
                <strong>{formatCurrency(monthlyBalance.valor_servicos)}</strong>
                <small>
                  {getOrderCountLabel(monthlyBalance.quantidade_ordens)}
                </small>
              </div>
              <div>
                <span className="balance-breakdown-label">
                  <i className="is-sale" aria-hidden="true" />
                  Vendas
                </span>
                <strong>{formatCurrency(monthlyBalance.valor_vendas)}</strong>
                <small>
                  {getSaleCountLabel(monthlyBalance.quantidade_vendas)}
                </small>
              </div>
            </div>
          </article>
        )}
      </section>

      {loadState === 'success' && (
        <div className="balance-info-panel">
          <div className="balance-info-mark" aria-hidden="true">
            i
          </div>
          <div>
            <strong>Como o faturamento é calculado?</strong>
            <p>
              Ordens entram após a conclusão e vendas no momento do cadastro.
              Custos de materiais e mão de obra não são descontados. Os
              períodos seguem o fuso horário de São Paulo.
            </p>
          </div>
          {updatedAt && (
            <span className="balance-updated-at">
              Atualizado às {formatUpdateTime(updatedAt)}
            </span>
          )}
        </div>
      )}
    </section>
  )
}
