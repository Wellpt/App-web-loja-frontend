import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from '../types/customer'
import { apiRequest } from './http'

interface CustomerListResponse {
  clientes: Customer[]
}

interface CustomerResponse {
  cliente: Customer
}

export async function getCustomers(signal?: AbortSignal): Promise<Customer[]> {
  const response = await apiRequest<CustomerListResponse>('/customers', {
    signal,
  })

  return response.clientes
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  const response = await apiRequest<CustomerResponse>('/customers', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return response.cliente
}

export async function updateCustomer(
  customerId: number,
  input: UpdateCustomerInput,
): Promise<Customer> {
  const response = await apiRequest<CustomerResponse>(
    '/customers/' + customerId,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return response.cliente
}
