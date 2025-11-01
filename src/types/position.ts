import { Role } from "./role";
import { Department } from "./department";

// Position entity from backend
export interface Position {
  id: string; // UUID
  name: string;
  description: string | null;
  roleId: string;
  departmentId: string;
}

// DTO for creating positions
export interface CreatePositionDto {
  name: string;
  description?: string | null;
  roleId: string;
  departmentId: string;
}

// DTO for updating positions
export interface UpdatePositionDto {
  name?: string;
  description?: string | null;
  roleId?: string;
  departmentId?: string;
}

// Extended position with related data (for display)
export interface PositionWithRelations extends Position {
  role?: Role;
  department?: Department;
}
