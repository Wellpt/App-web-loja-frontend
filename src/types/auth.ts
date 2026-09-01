export type EmployeeProfile = 'funcionario' | 'empresario'

export interface Employee {
  id: number
  nome: string
  email: string
  perfil: EmployeeProfile
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  funcionario: Employee
  expira_em: string
}
