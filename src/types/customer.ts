export interface Customer {
  id: number
  nome: string
  telefone: string
  email: string
  documento: string
}

export interface CreateCustomerInput {
  nome: string
  telefone: string
  email: string
  documento: string
}
