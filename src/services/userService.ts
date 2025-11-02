import { apiClient } from "@/lib/apiClient";
import { User, CreateUserDto, UpdateUserDto, ListUsersQueryDto, PaginatedUsersDto } from "@/types/user";

class UserService {
  // Helper to build query string
  private toQuery(params: Record<string, any>): string {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length) {
        // Convert booleans to 'true' | 'false' for API
        const value = typeof v === 'boolean' ? String(v) : String(v);
        usp.append(k, value);
      }
    });
    const query = usp.toString();
    return query ? `?${query}` : '';
  }

  // GET /users - List users with pagination, filtering, sorting
  async getUsers(query: ListUsersQueryDto = {}): Promise<PaginatedUsersDto<User>> {
    return apiClient.get(`/users${this.toQuery(query)}`);
  }

  // GET /users/:id - Get single user
  async getUserById(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`);
  }

  // POST /users - Create user
  async createUser(data: CreateUserDto): Promise<User> {
    return apiClient.post("/users", data);
  }

  // PUT /users/:id - Update user
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return apiClient.put(`/users/${id}`, data);
  }

  // DELETE /users/:id - Delete user
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  }
}

export const userService = new UserService();
