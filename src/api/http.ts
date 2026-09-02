const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = (configuredApiBaseUrl || '/api').replace(/\/+$/, '')
const UNAUTHORIZED_EVENT = 'auth:unauthorized'

interface ApiErrorResponse {
  erro?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  if (!response.ok) {
    let message = 'N\u00e3o foi poss\u00edvel concluir a solicita\u00e7\u00e3o.'

    try {
      const body = (await response.json()) as ApiErrorResponse

      if (body.erro) {
        message = body.erro
      }
    } catch {
      // Mantem a mensagem padrao quando a API nao retorna JSON.
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function onUnauthorized(handler: () => void): () => void {
  window.addEventListener(UNAUTHORIZED_EVENT, handler)
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler)
}
