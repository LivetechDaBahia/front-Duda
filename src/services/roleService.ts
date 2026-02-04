import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import { Role, CreateRoleDto, UpdateRoleDto, AccessLevel } from "@/types/role";

class RoleService {
  // GET /roles - List all roles
  async getRoles(): Promise<Role[]> {
    addUIBreadcrumb("getRoles", "roleService");
    return apiClient.get("/roles");
  }

  // GET /roles/:id - Get single role
  async getRoleById(id: string): Promise<Role> {
    addUIBreadcrumb("getRoleById", "roleService", { id });
    return apiClient.get(`/roles/${id}`);
  }

  // POST /roles - Create role
  async createRole(data: CreateRoleDto): Promise<Role> {
    addUIBreadcrumb("createRole", "roleService", { name: data.name });
    return apiClient.post("/roles", data);
  }

  // PUT /roles/:id - Update role
  async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
    addUIBreadcrumb("updateRole", "roleService", { id });
    return apiClient.put(`/roles/${id}`, data);
  }

  // DELETE /roles/:id - Delete role
  async deleteRole(id: string): Promise<void> {
    addUIBreadcrumb("deleteRole", "roleService", { id });
    return apiClient.delete(`/roles/${id}`);
  }

  // GET /roles/permissions/list - Fetch all available permissions
  async getPermissionsList(): Promise<string[]> {
    addUIBreadcrumb("getPermissionsList", "roleService");
    return apiClient.get("/roles/permissions/list");
  }

  // GET /roles/levels - Fetch all access levels
  async getAccessLevels(): Promise<AccessLevel[]> {
    addUIBreadcrumb("getAccessLevels", "roleService");
    return apiClient.get("/roles/levels");
  }
}

export const roleService = new RoleService();
