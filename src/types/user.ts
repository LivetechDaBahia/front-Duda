// Backend User entity shape
export interface User {
  id: number; // Backend uses numeric IDs for now
  name: string;
  email: string;
  department?: string;
  position?: string;
  role?: string;
  aadId?: string;
  phone?: string;
  phoneVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// DTO for creating users
export interface CreateUserDto {
  name: string;
  email: string;
  department?: string;
  position?: string;
  role?: string;
}

// DTO for updating users (all fields optional)
export interface UpdateUserDto {
  name?: string;
  email?: string;
  department?: string;
  position?: string;
  role?: string;
}

// Filters for user list
export interface UserFilters {
  search?: string;
  department?: string;
  role?: string;
}
