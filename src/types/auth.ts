export interface Employee {
  id: number
  nome: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  funcionario: Employee
  expira_em: string
}
