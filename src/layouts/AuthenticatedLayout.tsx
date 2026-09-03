import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { EmployeeProfile } from '../types/auth'

interface NavigationItem {
  to: string
  label: string
  end: boolean
  allowedProfiles?: EmployeeProfile[]
}

const navigation: NavigationItem[] = [
  { to: '/', label: 'Visão geral', end: true },
  { to: '/clientes', label: 'Clientes', end: false },
  { to: '/vendas', label: 'Vendas', end: false },
  { to: '/ordens', label: 'Ordens de serviço', end: false },
  {
    to: '/balancos',
    label: 'Balanços',
    end: false,
    allowedProfiles: ['empresario'],
  },
  {
    to: '/funcionarios',
    label: 'Funcionários',
    end: false,
    allowedProfiles: ['empresario'],
  },
]

function getProfileLabel(profile?: EmployeeProfile): string {
  return profile === 'empresario' ? 'Empresário' : 'Funcionário'
}

export function AuthenticatedLayout() {
  const { employee, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const visibleNavigation = navigation.filter(
    (item) =>
      !item.allowedProfiles ||
      (employee ? item.allowedProfiles.includes(employee.perfil) : false),
  )

  const currentPage =
    visibleNavigation.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    )?.label ?? 'VTcell'

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // O estado local é limpo mesmo se a API estiver indisponível.
    }

    navigate('/login', { replace: true })
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <div className="app-shell">
      <button
        className={`sidebar-backdrop ${isMenuOpen ? 'is-visible' : ''}`}
        type="button"
        aria-label="Fechar menu"
        onClick={closeMenu}
      />

      <aside
        id="app-sidebar"
        className={`app-sidebar ${isMenuOpen ? 'is-open' : ''}`}
      >
        <div className="sidebar-header">
          <div className="brand sidebar-brand">
            <span className="brand-mark" aria-hidden="true">
              VT
            </span>
            <span>VTcell</span>
          </div>

          <button
            className="sidebar-close"
            type="button"
            aria-label="Fechar menu"
            onClick={closeMenu}
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <p className="sidebar-section-label">Menu principal</p>
          {visibleNavigation.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'is-active' : ''}`
              }
              onClick={closeMenu}
            >
              <span className="nav-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-account">
          <div className="employee-avatar" aria-hidden="true">
            {employee?.nome.charAt(0).toUpperCase()}
          </div>
          <div className="employee-details">
            <strong>{employee?.nome}</strong>
            <span>{employee?.email}</span>
            <small>{getProfileLabel(employee?.perfil)}</small>
          </div>
          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="menu-button"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            aria-controls="app-sidebar"
            onClick={() => setIsMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>

          <div>
            <p className="topbar-label">VTcell</p>
            <h1>{currentPage}</h1>
          </div>

          <div className="topbar-employee">
            <span>{employee?.nome}</span>
            <div className="employee-avatar" aria-hidden="true">
              {employee?.nome.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
