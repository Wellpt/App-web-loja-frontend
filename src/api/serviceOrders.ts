import type {
  CompleteServiceOrderInput,
  CreateServiceOrderInput,
  ServiceOrder,
  UpdateServiceOrderValueInput,
} from '../types/serviceOrder'
import { apiRequest } from './http'

interface ServiceOrderListResponse {
  ordens_servico: ServiceOrder[]
}

interface ServiceOrderResponse {
  ordem_servico: ServiceOrder
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
): Promise<ServiceOrder> {
  const response = await apiRequest<ServiceOrderResponse>(
    '/service-orders',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return response.ordem_servico
}

export async function updateServiceOrderValue(
  serviceOrderId: number,
  input: UpdateServiceOrderValueInput,
): Promise<ServiceOrder> {
  const response = await apiRequest<ServiceOrderResponse>(
    '/service-orders/' + serviceOrderId,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return response.ordem_servico
}

export async function completeServiceOrder(
  serviceOrderId: number,
  input: CompleteServiceOrderInput,
): Promise<ServiceOrder> {
  const response = await apiRequest<ServiceOrderResponse>(
    '/service-orders/' + serviceOrderId + '/complete',
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return response.ordem_servico
}
