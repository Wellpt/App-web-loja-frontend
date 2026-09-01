import type {
  CompleteServiceOrderInput,
  CompletedServiceOrder,
  CreateServiceOrderInput,
  CreatedServiceOrder,
  ServiceOrder,
} from '../types/serviceOrder'
import { apiRequest } from './http'

interface ServiceOrderListResponse {
  ordens_servico: ServiceOrder[]
}

interface CreatedServiceOrderResponse {
  ordem_servico: CreatedServiceOrder
}

interface CompletedServiceOrderResponse {
  ordem_servico: CompletedServiceOrder
}

export async function getServiceOrders(
  signal?: AbortSignal,
): Promise<ServiceOrder[]> {
  const response = await apiRequest<ServiceOrderListResponse>(
    '/service-orders',
    { signal },
  )

  return response.ordens_servico
}

export async function createServiceOrder(
  input: CreateServiceOrderInput,
): Promise<CreatedServiceOrder> {
  const response = await apiRequest<CreatedServiceOrderResponse>(
    '/service-orders',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return response.ordem_servico
}

export async function completeServiceOrder(
  serviceOrderId: number,
  input: CompleteServiceOrderInput,
): Promise<CompletedServiceOrder> {
  const response = await apiRequest<CompletedServiceOrderResponse>(
    '/service-orders/' + serviceOrderId,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return response.ordem_servico
}
