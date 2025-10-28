import { apiClient } from "@/lib/apiClient";
import { User, CreateUserDto, UpdateUserDto } from "@/types/user";

class UserService {
  // GET /users - List all users
  async getUsers(): Promise<User[]> {
    return apiClient.get("/users");
  }

  // GET /users/:id - Get single user
  async getUserById(id: number): Promise<User> {
    return apiClient.get(`/users/${id}`);
  }

  // POST /users - Create user
  async createUser(data: CreateUserDto): Promise<User> {
    return apiClient.post("/users", data);
  }

  // PUT /users/:id - Update user
  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    return apiClient.put(`/users/${id}`, data);
  }

  // DELETE /users/:id - Delete user
  async deleteUser(id: number): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  }
}

export const userService = new UserService();
