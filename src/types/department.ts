// Department entity from backend
export interface Department {
  id: string; // UUID
  name: string;
}

// DTO for creating departments
export interface CreateDepartmentDto {
  name: string;
}

// DTO for updating departments
export interface UpdateDepartmentDto {
  name?: string;
}
