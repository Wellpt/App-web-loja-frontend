import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '../types/expense'
import { businessDate } from '../utils/expenseDates'

// Refresh after mutations, on returning to the tab, and when the Sao Paulo day changes.
export function useExpenseData(loader: (signal?: AbortSignal) => Promise<Expense[]>) {
  const [items, setItems] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => { setLoading(true); setVersion(value => value + 1) }, [])

  useEffect(() => {
    let controller: AbortController | undefined
    let active = true
    let day = businessDate()
    async function load() {
      controller?.abort()
      const current = new AbortController()
      controller = current
      try {
        const data = await loader(current.signal)
        if (active && !current.signal.aborted) { setItems(data); setError('') }
      } catch (cause) {
        if (active && !current.signal.aborted) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as despesas.')
      } finally {
        if (active && !current.signal.aborted) setLoading(false)
      }
    }
    function onReturn() { if (document.visibilityState === 'visible') { day = businessDate(); void load() } }
    function onChange() { void load() }
    void load()
    window.addEventListener('focus', onReturn)
    document.addEventListener('visibilitychange', onReturn)
    window.addEventListener('expenses:changed', onChange)
    const timer = window.setInterval(() => {
      const today = businessDate()
      if (today !== day && document.visibilityState === 'visible') { day = today; void load() }
    }, 60_000)
    return () => {
      active = false; controller?.abort(); window.clearInterval(timer)
      window.removeEventListener('focus', onReturn)
      document.removeEventListener('visibilitychange', onReturn)
      window.removeEventListener('expenses:changed', onChange)
    }
  }, [loader, version])
  return { items, loading, error, refresh }
}
