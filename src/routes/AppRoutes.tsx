import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { ComingSoonPage } from '../pages/ComingSoonPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/clientes"
            element={<ComingSoonPage title="Clientes" />}
          />
          <Route
            path="/ordens"
            element={<ComingSoonPage title={'Ordens de servi\u00e7o'} />}
          />
          <Route
            path="/balancos"
            element={<ComingSoonPage title={'Balan\u00e7os'} />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
