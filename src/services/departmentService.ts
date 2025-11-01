import { apiClient } from "@/lib/apiClient";
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "@/types/department";

class DepartmentService {
  // GET /departments - List all departments
  async getDepartments(): Promise<Department[]> {
    return apiClient.get("/departments");
  }

  // GET /departments/:id - Get single department
  async getDepartmentById(id: string): Promise<Department> {
    return apiClient.get(`/departments/${id}`);
  }

  // POST /departments - Create department
  async createDepartment(data: CreateDepartmentDto): Promise<Department> {
    return apiClient.post("/departments", data);
  }

  // PUT /departments/:id - Update department
  async updateDepartment(
    id: string,
    data: UpdateDepartmentDto
  ): Promise<Department> {
    return apiClient.put(`/departments/${id}`, data);
  }

  // DELETE /departments/:id - Delete department
  async deleteDepartment(id: string): Promise<void> {
    return apiClient.delete(`/departments/${id}`);
  }
}

export const departmentService = new DepartmentService();
