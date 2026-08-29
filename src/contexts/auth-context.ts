import { createContext } from 'react'
import type { Employee, LoginCredentials } from '../types/auth'

export interface AuthContextValue {
  employee: Employee | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
