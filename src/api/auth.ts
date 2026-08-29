import type { LoginCredentials, LoginResponse } from '../types/auth'
import { apiRequest } from './http'

export function loginRequest(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function logoutRequest(): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  })
}
