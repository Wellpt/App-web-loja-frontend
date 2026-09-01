import type { Employee } from '../types/auth'
import type { CreateEmployeeInput } from '../types/employee'
import { apiRequest } from './http'

interface EmployeeResponse {
  funcionario: Employee
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  const response = await apiRequest<EmployeeResponse>('/employees', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return response.funcionario
}
