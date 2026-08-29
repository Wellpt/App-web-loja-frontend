import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { loginRequest, logoutRequest } from '../api/auth'
import { onUnauthorized } from '../api/http'
import type { Employee, LoginCredentials } from '../types/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: PropsWithChildren) {
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => onUnauthorized(() => setEmployee(null)), [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginRequest(credentials)
    setEmployee(response.funcionario)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setEmployee(null)
    }
  }, [])

  const value = useMemo(
    () => ({ employee, login, logout }),
    [employee, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
