import { apiRequest } from './http'
import type { Expense, ExpenseInput } from '../types/expense'

export async function getExpenses(signal?: AbortSignal): Promise<Expense[]> {
  const response = await apiRequest<{ despesas: Expense[] }>('/expenses', { signal })
  return response.despesas
}

export async function getExpenseAlerts(signal?: AbortSignal): Promise<Expense[]> {
  const response = await apiRequest<{ alertas: Expense[] }>('/expenses/alerts', { signal })
  return response.alertas
}

export async function saveExpense(input: ExpenseInput, expense?: Expense): Promise<Expense> {
  const response = await apiRequest<{ despesa: Expense }>(expense ? `/expenses/${expense.id}` : '/expenses', {
    method: expense ? 'PATCH' : 'POST',
    body: JSON.stringify(expense ? { ...input, revisao: expense.revisao } : input),
  })
  return response.despesa
}

export async function payExpense(expense: Expense, date: string): Promise<Expense> {
  const response = await apiRequest<{ despesa: Expense }>(`/expenses/${expense.id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ data_pagamento: date, revisao: expense.revisao }),
  })
  return response.despesa
}

export function notifyExpensesChanged() {
  window.dispatchEvent(new Event('expenses:changed'))
}
