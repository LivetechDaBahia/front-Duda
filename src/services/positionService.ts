import { apiClient } from "@/lib/apiClient";
import {
  Position,
  CreatePositionDto,
  UpdatePositionDto,
} from "@/types/position";

class PositionService {
  // GET /positions - List all positions (optionally filtered by department)
  async getPositions(departmentId?: string): Promise<Position[]> {
    const params = departmentId ? `?departmentId=${departmentId}` : "";
    return apiClient.get(`/positions${params}`);
  }

  // GET /positions/:id - Get single position
  async getPositionById(id: string): Promise<Position> {
    return apiClient.get(`/positions/${id}`);
  }

  // POST /positions - Create position
  async createPosition(data: CreatePositionDto): Promise<Position> {
    return apiClient.post("/positions", data);
  }

  // PUT /positions/:id - Update position
  async updatePosition(
    id: string,
    data: UpdatePositionDto
  ): Promise<Position> {
    return apiClient.put(`/positions/${id}`, data);
  }

  // DELETE /positions/:id - Delete position
  async deletePosition(id: string): Promise<void> {
    return apiClient.delete(`/positions/${id}`);
  }
}

export const positionService = new PositionService();
