import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import {
  Position,
  CreatePositionDto,
  UpdatePositionDto,
} from "@/types/position";

class PositionService {
  // GET /positions - List all positions (optionally filtered by department)
  async getPositions(departmentId?: string): Promise<Position[]> {
    addUIBreadcrumb("getPositions", "positionService", { departmentId });
    const params = departmentId ? `?departmentId=${departmentId}` : "";
    return apiClient.get(`/positions${params}`);
  }

  // GET /positions/:id - Get single position
  async getPositionById(id: string): Promise<Position> {
    addUIBreadcrumb("getPositionById", "positionService", { id });
    return apiClient.get(`/positions/${id}`);
  }

  // POST /positions - Create position
  async createPosition(data: CreatePositionDto): Promise<Position> {
    addUIBreadcrumb("createPosition", "positionService", { name: data.name });
    return apiClient.post("/positions", data);
  }

  // PUT /positions/:id - Update position
  async updatePosition(id: string, data: UpdatePositionDto): Promise<Position> {
    addUIBreadcrumb("updatePosition", "positionService", { id });
    return apiClient.put(`/positions/${id}`, data);
  }

  // DELETE /positions/:id - Delete position
  async deletePosition(id: string): Promise<void> {
    addUIBreadcrumb("deletePosition", "positionService", { id });
    return apiClient.delete(`/positions/${id}`);
  }
}

export const positionService = new PositionService();
