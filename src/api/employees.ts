import type { Employee } from '../types/auth'
import type {
  CreateEmployeeInput,
  ManagedEmployee,
  UpdateEmployeeStatusInput,
} from '../types/employee'
import { apiRequest } from './http'

interface CreatedEmployeeResponse {
  funcionario: Employee
}

interface EmployeeListResponse {
  funcionarios: ManagedEmployee[]
}

interface ManagedEmployeeResponse {
  funcionario: ManagedEmployee
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  const response = await apiRequest<CreatedEmployeeResponse>('/employees', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return response.funcionario
}

export async function getEmployees(
  signal?: AbortSignal,
): Promise<ManagedEmployee[]> {
  const response = await apiRequest<EmployeeListResponse>('/employees', {
    signal,
  })

  return response.funcionarios
}

export async function updateEmployeeStatus(
  employeeId: number,
  input: UpdateEmployeeStatusInput,
): Promise<ManagedEmployee> {
  const response = await apiRequest<ManagedEmployeeResponse>(
    '/employees/' + employeeId,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return response.funcionario
}
