// Access Level from backend
export interface AccessLevel {
  id: string;
  name: string;
  value: string;
}

// Role entity from backend
export interface Role {
  id: string; // UUID
  name: string;
  accessLevelId: string;
  permissions: string[]; // Array of permission strings
}

// DTO for creating roles
export interface CreateRoleDto {
  name: string;
  accessLevelId: string;
  permissions: string[];
}

// DTO for updating roles
export interface UpdateRoleDto {
  name?: string;
  accessLevelId?: string;
  permissions?: string[];
}
