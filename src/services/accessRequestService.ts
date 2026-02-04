import { publicApiClient } from "@/lib/publicApiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import { AccessRequestDto, AccessRequestResponse } from "@/types/accessRequest";

class AccessRequestService {
  // POST /access-requests - Submit access request
  async submitAccessRequest(
    data: AccessRequestDto
  ): Promise<AccessRequestResponse> {
    addUIBreadcrumb("submitAccessRequest", "accessRequestService", { 
      email: data.email,
      departmentId: data.departmentId,
      positionId: data.positionId 
    });
    return publicApiClient.post("/access-requests", data);
  }
}

export const accessRequestService = new AccessRequestService();
