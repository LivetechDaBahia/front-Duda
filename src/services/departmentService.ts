import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "@/types/department";

class DepartmentService {
  // GET /departments - List all departments
  async getDepartments(): Promise<Department[]> {
    addUIBreadcrumb("getDepartments", "departmentService");
    return apiClient.get("/departments");
  }

  // GET /departments/:id - Get single department
  async getDepartmentById(id: string): Promise<Department> {
    addUIBreadcrumb("getDepartmentById", "departmentService", { id });
    return apiClient.get(`/departments/${id}`);
  }

  // POST /departments - Create department
  async createDepartment(data: CreateDepartmentDto): Promise<Department> {
    addUIBreadcrumb("createDepartment", "departmentService", { name: data.name });
    return apiClient.post("/departments", data);
  }

  // PUT /departments/:id - Update department
  async updateDepartment(
    id: string,
    data: UpdateDepartmentDto,
  ): Promise<Department> {
    addUIBreadcrumb("updateDepartment", "departmentService", { id });
    return apiClient.put(`/departments/${id}`, data);
  }

  // DELETE /departments/:id - Delete department
  async deleteDepartment(id: string): Promise<void> {
    addUIBreadcrumb("deleteDepartment", "departmentService", { id });
    return apiClient.delete(`/departments/${id}`);
  }
}

export const departmentService = new DepartmentService();
