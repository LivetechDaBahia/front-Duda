// Role entity from backend
export interface Role {
  id: string; // UUID
  name: string;
  accessLevelId: string;
}

// DTO for creating roles
export interface CreateRoleDto {
  name: string;
  accessLevelId: string;
}

// DTO for updating roles
export interface UpdateRoleDto {
  name?: string;
  accessLevelId?: string;
}
