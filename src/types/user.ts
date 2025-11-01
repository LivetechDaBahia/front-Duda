import { PositionWithRelations } from "./position";

// Backend User entity shape
export interface User {
  id: string; // UUID
  name: string;
  email: string;
  positionId?: string; // Link to Position
  department?: string; // Keep for backward compatibility
  position?: string; // Keep for backward compatibility
  role?: string; // Keep for backward compatibility
  aadId?: string;
  phone?: string;
  phoneVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extended user with related data
export interface UserWithRelations extends User {
  positionData?: PositionWithRelations; // Avoid conflict with position string field
}

// DTO for creating users
export interface CreateUserDto {
  name: string;
  email: string;
  positionId?: string; // Use position instead of individual fields
  department?: string; // Keep for backward compatibility
  position?: string; // Keep for backward compatibility
  role?: string; // Keep for backward compatibility
}

// DTO for updating users (all fields optional)
export interface UpdateUserDto {
  name?: string;
  email?: string;
  positionId?: string; // Use position instead of individual fields
  department?: string; // Keep for backward compatibility
  position?: string; // Keep for backward compatibility
  role?: string; // Keep for backward compatibility
}

// Filters for user list
export interface UserFilters {
  search?: string;
  department?: string;
  role?: string;
}
