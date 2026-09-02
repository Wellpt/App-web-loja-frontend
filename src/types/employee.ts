export interface CreateEmployeeInput {
  nome: string
  email: string
  senha: string
}

export interface ManagedEmployee {
  id: number
  nome: string
  email: string
  perfil: 'funcionario'
  ativo: boolean
}

export interface UpdateEmployeeStatusInput {
  ativo: boolean
}
