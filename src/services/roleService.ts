import { apiClient } from "@/lib/apiClient";
import { Role, CreateRoleDto, UpdateRoleDto, AccessLevel } from "@/types/role";

class RoleService {
  // GET /roles - List all roles
  async getRoles(): Promise<Role[]> {
    return apiClient.get("/roles");
  }

  // GET /roles/:id - Get single role
  async getRoleById(id: string): Promise<Role> {
    return apiClient.get(`/roles/${id}`);
  }

  // POST /roles - Create role
  async createRole(data: CreateRoleDto): Promise<Role> {
    return apiClient.post("/roles", data);
  }

  // PUT /roles/:id - Update role
  async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
    return apiClient.put(`/roles/${id}`, data);
  }

  // DELETE /roles/:id - Delete role
  async deleteRole(id: string): Promise<void> {
    return apiClient.delete(`/roles/${id}`);
  }

  // GET /roles/permissions/list - Fetch all available permissions
  async getPermissionsList(): Promise<string[]> {
    return apiClient.get("/roles/permissions/list");
  }

  // GET /roles/levels - Fetch all access levels
  async getAccessLevels(): Promise<AccessLevel[]> {
    return apiClient.get("/roles/levels");
  }
}

export const roleService = new RoleService();
