import { publicApiClient } from "@/lib/publicApiClient";
import { AccessRequestDto, AccessRequestResponse } from "@/types/accessRequest";

class AccessRequestService {
  // POST /access-requests - Submit access request
  async submitAccessRequest(
    data: AccessRequestDto
  ): Promise<AccessRequestResponse> {
    return publicApiClient.post("/access-requests", data);
  }
}

export const accessRequestService = new AccessRequestService();
