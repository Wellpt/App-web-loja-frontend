import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { EmployeeProfile } from '../types/auth'

interface ProfileProtectedRouteProps {
  allowedProfiles: EmployeeProfile[]
}

export function ProfileProtectedRoute({
  allowedProfiles,
}: ProfileProtectedRouteProps) {
  const { employee } = useAuth()

  if (!employee) {
    return <Navigate to="/login" replace />
  }

  if (!allowedProfiles.includes(employee.perfil)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
