import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProfileProtectedRoute } from '../components/ProfileProtectedRoute'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout'
import { BalancesPage } from '../pages/BalancesPage'
import { CustomersPage } from '../pages/CustomersPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EmployeesPage } from '../pages/EmployeesPage'
import { LoginPage } from '../pages/LoginPage'
import { OrdersPage } from '../pages/OrdersPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route
              path="/clientes"
              element={<CustomersPage />}
            />
            <Route path="/ordens" element={<OrdersPage />} />
            <Route
              element={
                <ProfileProtectedRoute allowedProfiles={['empresario']} />
              }
            >
              <Route path="/balancos" element={<BalancesPage />} />
              <Route path="/funcionarios" element={<EmployeesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
