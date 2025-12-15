import { PositionWithRelations } from "./position";

// Backend User entity shape (matches UserDto from API)
export interface User {
  id: string; // UUID
  aadId: string;
  name: string;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  firstAccess: boolean;
  departmentId: string;
  positionId: string;
  roleIds: string[]; // Multiple roles support
}

// Extended user with related data
export interface UserWithRelations extends User {
  positionData?: PositionWithRelations; // Avoid conflict with position string field
}

// DTO for creating users
export interface CreateUserDto {
  aadId: string;
  name: string;
  email: string;
  departmentId: string;
  positionId: string;
  roleIds: string[]; // Multiple roles support
  phone?: string | null;
  phoneVerified?: boolean; // default false
  firstAccess?: boolean; // default true
}

// DTO for updating users (all fields optional)
export interface UpdateUserDto {
  aadId?: string;
  name?: string;
  email?: string;
  departmentId?: string;
  positionId?: string;
  roleIds?: string[]; // Multiple roles support
  phone?: string | null;
  phoneVerified?: boolean;
  firstAccess?: boolean;
}

// Query params for listing users
export type SortDirection = "asc" | "desc";

export interface ListUsersQueryDto {
  page?: number;
  limit?: number;
  sortBy?:
    | "id"
    | "aadId"
    | "name"
    | "email"
    | "phoneVerified"
    | "firstAccess"
    | "departmentId"
    | "positionId";
  sortDir?: SortDirection;
  search?: string;
  departmentId?: string;
  positionId?: string;
  roleIds?: string[]; // Filter by any of these roles
  phoneVerified?: boolean;
  firstAccess?: boolean;
}

// Paginated response envelope
export interface PaginatedUsersDto<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: string;
  sortDir: "asc" | "desc";
}
